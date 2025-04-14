const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, findUserByEmail, findUserById, saveUser, updateUser } = require('./User');
const Job = require('./Job');
const Application = require('./Application');
const { dbPromise, dbOperations } = require('./database');
const crypto = require('crypto');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await findUserById(decoded.id);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        req.token = token;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Ensure database is initialized before starting server
async function startServer() {
    try {
        // Wait for database to initialize
        await dbPromise;
        console.log('Database initialized successfully');
        
        // User registration
        app.post('/api/users/register', async (req, res) => {
            try {
                const { name, email, password, role = 'jobseeker', phone = '' } = req.body;
                
                // Validate required fields
                if (!name || !email || !password) {
                    return res.status(400).json({ message: 'Name, email and password are required' });
                }
                
                // Check if user already exists
                const existingUser = await findUserByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ message: 'Email already registered' });
                }
                
                // Create new user
                const user = new User({
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    role,
                    phone
                });
                
                await saveUser(user);
                
                // Generate token
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '7d' }
                );
                
                res.status(201).json({
                    message: 'User registered successfully',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    token
                });
            } catch (error) {
                console.error('Registration error:', error);
                res.status(400).json({ message: error.message || 'Registration failed' });
            }
        });

        // Login route
        app.post('/api/users/login', async (req, res) => {
            try {
                const { email, password } = req.body;
                
                if (!email || !password) {
                    return res.status(400).json({ message: 'Email and password are required' });
                }
                
                // Find user
                const user = await findUserByEmail(email);
                if (!user) {
                    return res.status(401).json({ message: 'Invalid email or password' });
                }
                
                // Check password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid email or password' });
                }
                
                // Generate token
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '7d' }
                );
                
                // Clean user data before sending
                const userData = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                };
                
                res.json({
                    message: 'Login successful',
                    user: userData,
                    token
                });
            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ message: 'Login failed. Please try again.' });
            }
        });

        // Get user profile
        app.get('/api/users/profile', auth, async (req, res) => {
            try {
                const user = await findUserById(req.user.id);
                if (!user) {
                    throw new Error('User not found');
                }
                
                // Remove sensitive data
                const userData = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                };
                
                res.json(userData);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Update user profile
        app.put('/api/users/profile', auth, async (req, res) => {
            try {
                const updates = Object.keys(req.body);
                const allowedUpdates = ['name', 'email', 'phone'];
                const isValidOperation = updates.every(update => allowedUpdates.includes(update));
                
                if (!isValidOperation) {
                    return res.status(400).json({ message: 'Invalid updates' });
                }
                
                const user = await findUserById(req.user.id);
                if (!user) {
                    throw new Error('User not found');
                }
                
                updates.forEach(update => user[update] = req.body[update]);
                await updateUser(user);
                
                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        // Change password
        app.put('/api/users/change-password', auth, async (req, res) => {
            try {
                const { currentPassword, newPassword } = req.body;
                
                const user = await findUserById(req.user.id);
                if (!user) {
                    throw new Error('User not found');
                }
                
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Current password is incorrect' });
                }
                
                user.password = await bcrypt.hash(newPassword, 10);
                await updateUser(user);
                
                res.json({ message: 'Password changed successfully' });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        // Get all jobs
        app.get('/api/jobs', async (req, res) => {
            try {
                const jobs = await Job.find();
                res.json(jobs);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                res.status(500).json({ message: error.message || 'Failed to fetch jobs' });
            }
        });

        // Get job by ID
        app.get('/api/jobs/:id', async (req, res) => {
            try {
                const job = await Job.findById(req.params.id);
                if (!job) {
                    return res.status(404).json({ message: 'Job not found' });
                }
                res.json(job);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Create new job
        app.post('/api/jobs', auth, async (req, res) => {
            try {
                // Check if user is an employer
                if (req.user.role !== 'employer') {
                    return res.status(403).json({ message: 'Only employers can post jobs' });
                }

                const {
                    title,
                    company,
                    location,
                    jobType,
                    industry,
                    salaryRange,
                    description,
                    qualifications,
                    contactEmail,
                    benefits
                } = req.body;

                // Validate required fields
                if (!title || !company || !location || !jobType || !description) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }

                const job = {
                    id: Date.now().toString(),
                    title,
                    company,
                    location,
                    jobType,
                    industry,
                    salaryRange,
                    description,
                    qualifications,
                    contactEmail,
                    benefits,
                    postedBy: req.user.id,
                    postedAt: new Date().toISOString(),
                    status: 'active'
                };

                await Job.create(job);
                res.status(201).json(job);
            } catch (error) {
                console.error('Error creating job:', error);
                res.status(500).json({ message: error.message || 'Failed to create job' });
            }
        });

        // Update job
        app.put('/api/jobs/:id', auth, async (req, res) => {
            try {
                const job = await Job.findById(req.params.id);
                
                if (!job) {
                    return res.status(404).json({ message: 'Job not found' });
                }
                
                if (job.postedBy !== req.user.id && req.user.role !== 'admin') {
                    return res.status(403).json({ message: 'Not authorized to update this job' });
                }
                
                const updates = Object.keys(req.body);
                updates.forEach(update => job[update] = req.body[update]);
                
                await job.update();
                res.json(job);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        // Delete job
        app.delete('/api/jobs/:id', auth, async (req, res) => {
            try {
                const job = await Job.findById(req.params.id);
                
                if (!job) {
                    return res.status(404).json({ message: 'Job not found' });
                }
                
                if (job.postedBy !== req.user.id && req.user.role !== 'admin') {
                    return res.status(403).json({ message: 'Not authorized to delete this job' });
                }
                
                await Job.delete(job.id);
                res.json({ message: 'Job deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Get applications for a job
        app.get('/api/jobs/:id/applications', auth, async (req, res) => {
            try {
                const job = await Job.findById(req.params.id);
                
                if (!job) {
                    return res.status(404).json({ message: 'Job not found' });
                }
                
                if (job.postedBy !== req.user.id && req.user.role !== 'admin') {
                    return res.status(403).json({ message: 'Not authorized to view applications' });
                }
                
                const applications = await Application.find({ jobId: job.id });
                res.json(applications);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Get user applications
        app.get('/api/applications', auth, async (req, res) => {
            try {
                const applications = await Application.find({ applicantId: req.user.id });
                res.json(applications);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Apply for a job
        app.post('/api/jobs/:id/apply', auth, async (req, res) => {
            try {
                const job = await Job.findById(req.params.id);
                
                if (!job) {
                    return res.status(404).json({ message: 'Job not found' });
                }
                
                const { resume, coverLetter } = req.body;
                
                if (!resume || !coverLetter) {
                    return res.status(400).json({ message: 'Resume and cover letter are required' });
                }
                
                const application = new Application({
                    jobId: job.id,
                    applicantId: req.user.id,
                    resume,
                    coverLetter,
                    createdAt: new Date().toISOString()
                });
                
                await application.save();
                
                res.status(201).json({
                    message: 'Application submitted successfully',
                    application
                });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        // Bookmark a job
        app.post('/api/jobs/:id/bookmark', auth, (req, res) => {
            try {
                const jobId = req.params.id;
                // In a real app, we would save this to a bookmarks table
                // For this MVP, we'll just return success
                res.json({ message: 'Job bookmarked successfully' });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        // Check if user is authenticated
        app.get('/api/auth/check', auth, (req, res) => {
            res.json({ authenticated: true, user: req.user });
        });

        // Debug route to check database entries (only in development)
        app.get('/api/debug/users', async (req, res) => {
            try {
                const users = await dbOperations.all('SELECT id, name, email, role, phone, createdAt, isEmailVerified FROM users');
                res.json(users);
            } catch (error) {
                console.error('Error getting users:', error);
                res.status(500).json({ message: 'Error retrieving users' });
            }
        });

        // Debug route to add test user
        app.get('/api/debug/add-test-user', async (req, res) => {
            try {
                // Check if test user already exists
                const testUser = await dbOperations.get('SELECT * FROM users WHERE email = ?', ['test@example.com']);
                
                if (testUser) {
                    return res.json({ 
                        message: 'Test user already exists', 
                        user: { 
                            email: testUser.email,
                            id: testUser.id
                        } 
                    });
                }
                
                // Create test user
                const hashedPassword = await bcrypt.hash('password123', 10);
                const userId = dbOperations.generateId();
                
                await dbOperations.run(
                    'INSERT INTO users (id, name, email, password, role, phone, createdAt, isEmailVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        userId,
                        'Test User',
                        'test@example.com',
                        hashedPassword,
                        'employer',
                        '123-456-7890',
                        new Date().toISOString(),
                        1
                    ]
                );
                
                res.json({ 
                    message: 'Test user created successfully', 
                    user: { 
                        email: 'test@example.com',
                        id: userId
                    } 
                });
            } catch (error) {
                console.error('Error creating test user:', error);
                res.status(500).json({ message: 'Error creating test user', error: error.message });
            }
        });

        // Debug route to force-add a test user directly with SQL
        app.get('/api/debug/force-add-test-user', async (req, res) => {
            try {
                // Force create test user with direct SQL
                const hashedPassword = await bcrypt.hash('password123', 10);
                const userId = crypto.randomUUID();
                const now = new Date().toISOString();
                
                // First delete any existing test user
                await dbOperations.run('DELETE FROM users WHERE email = ?', ['test@example.com']);
                
                // Then insert the new test user
                await dbOperations.run(`
                    INSERT INTO users (id, name, email, password, role, phone, createdAt, isEmailVerified) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    userId,
                    'Test User',
                    'test@example.com',
                    hashedPassword,
                    'employer',
                    '123-456-7890',
                    now,
                    1
                ]);
                
                // Verify user was created
                const user = await dbOperations.get('SELECT * FROM users WHERE email = ?', ['test@example.com']);
                
                if (user) {
                    res.json({ 
                        message: 'Test user created successfully', 
                        user: { 
                            id: user.id,
                            email: user.email,
                            password: 'password123' // Only showing for testing
                        }
                    });
                } else {
                    res.status(500).json({ message: 'Failed to create test user' });
                }
            } catch (error) {
                console.error('Error creating test user:', error);
                res.status(500).json({ message: 'Error creating test user', error: error.message });
            }
        });

        // Debug route to test login
        app.get('/api/debug/test-login', async (req, res) => {
            try {
                const email = 'test@example.com';
                const password = 'password123';
                
                // Find user
                const user = await dbOperations.get('SELECT * FROM users WHERE email = ?', [email]);
                
                if (!user) {
                    return res.status(404).json({ message: 'Test user not found' });
                }
                
                // Check password
                const isMatch = await bcrypt.compare(password, user.password);
                
                if (!isMatch) {
                    return res.status(401).json({ 
                        message: 'Password does not match',
                        storedPasswordHash: user.password,
                        providedPassword: password
                    });
                }
                
                res.json({ 
                    message: 'Login test successful',
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    }
                });
            } catch (error) {
                console.error('Error testing login:', error);
                res.status(500).json({ message: 'Error testing login', error: error.message });
            }
        });

        // Start server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
