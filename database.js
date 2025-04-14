const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Ensure the database directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// Database file path
const dbPath = path.join(dbDir, 'joblyft.db');

// Global database object
let db;
let dbBuffer;

// Initialize database
async function initializeDatabase() {
    try {
        // Load sql.js
        const SQL = await initSqlJs();
        
        // Check if database file exists
        if (fs.existsSync(dbPath)) {
            // Load existing database
            dbBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(dbBuffer);
            console.log('Existing database loaded successfully');
        } else {
            // Create new database
            db = new SQL.Database();
            console.log('New database created');
        }
        
        // Create tables if they don't exist
        await createTables();
        
        // Save initial database
        saveDatabase();
        
        console.log('Database initialized successfully');
        return db;
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
}

// Create database tables
async function createTables() {
    // Create Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            phone TEXT,
            createdAt TEXT NOT NULL,
            isEmailVerified INTEGER DEFAULT 0,
            resetPasswordToken TEXT,
            resetPasswordExpires TEXT
        )
    `);

    // Create Jobs table
    db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            jobType TEXT NOT NULL,
            industry TEXT,
            salaryRange TEXT NOT NULL,
            description TEXT NOT NULL,
            qualifications TEXT,
            contactEmail TEXT,
            benefits TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            postedBy TEXT NOT NULL,
            postedAt TEXT NOT NULL,
            FOREIGN KEY (postedBy) REFERENCES users (id)
        )
    `);

    // Create Applications table
    db.run(`
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            jobId TEXT NOT NULL,
            applicantId TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            appliedDate TEXT NOT NULL,
            resume TEXT NOT NULL,
            coverLetter TEXT NOT NULL,
            FOREIGN KEY (jobId) REFERENCES jobs (id),
            FOREIGN KEY (applicantId) REFERENCES users (id)
        )
    `);

    // Add test user if no users exist
    const users = db.exec("SELECT COUNT(*) as count FROM users");
    if (users[0].values[0][0] === 0) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        db.run(`
            INSERT INTO users (id, name, email, password, role, phone, createdAt, isEmailVerified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            crypto.randomUUID(),
            'Test User',
            'test@example.com',
            hashedPassword,
            'employer',
            '123-456-7890',
            new Date().toISOString(),
            1
        ]);
        console.log('Test user created successfully');
    }
}

// Save database to file
function saveDatabase() {
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error('Error saving database:', err);
        throw err;
    }
}

// Database operations
const dbOperations = {
    // Run a query with parameters
    run(sql, params = []) {
        try {
            const stmt = db.prepare(sql);
            stmt.run(params);
            stmt.free();
            saveDatabase();
            return true;
        } catch (err) {
            console.error('Error running query:', err);
            throw err;
        }
    },
    
    // Get a single row
    get(sql, params = []) {
        try {
            const stmt = db.prepare(sql);
            const result = stmt.getAsObject(params);
            stmt.free();
            return Object.keys(result).length === 0 ? null : result;
        } catch (err) {
            console.error('Error getting row:', err);
            throw err;
        }
    },
    
    // Get all rows
    all(sql, params = []) {
        try {
            const stmt = db.prepare(sql);
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            stmt.free();
            return rows;
        } catch (err) {
            console.error('Error getting rows:', err);
            throw err;
        }
    },
    
    // Generate a unique ID
    generateId() {
        return crypto.randomUUID();
    }
};

// Initialize the database
const dbPromise = initializeDatabase();

module.exports = {
    dbPromise,
    dbOperations
};
