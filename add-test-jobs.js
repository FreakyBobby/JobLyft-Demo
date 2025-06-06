const { dbOperations, dbPromise } = require('./database');

const companies = [
    'TechCorp', 'InnovateAI', 'Global Solutions', 'Digital Dynamics', 'Future Systems',
    'SmartTech', 'DataSphere', 'CloudNine', 'Quantum Computing', 'CyberSecure'
];

const locations = [
    'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA',
    'Chicago, IL', 'Denver, CO', 'Miami, FL', 'Portland, OR', 'Remote'
];

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Marketing', 'Engineering', 'Design', 'Consulting'
];

const skills = [
    'JavaScript, React, Node.js',
    'Python, Machine Learning, Data Analysis',
    'Java, Spring Boot, Microservices',
    'SQL, Database Design, Data Modeling',
    'AWS, Cloud Architecture, DevOps',
    'UI/UX Design, Figma, Adobe Creative Suite',
    'Project Management, Agile, Scrum',
    'Mobile Development, iOS, Android',
    'Cybersecurity, Network Security, Penetration Testing',
    'Sales, Business Development, CRM'
];

const titles = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
    'DevOps Engineer', 'Marketing Specialist', 'Business Analyst', 'Sales Representative',
    'Project Manager', 'Quality Assurance Engineer', 'Frontend Developer',
    'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
    'Cloud Architect', 'Security Engineer', 'Data Analyst', 'Content Writer',
    'Customer Success Manager', 'Technical Support Specialist'
];

const descriptions = [
    'Join our innovative team to build cutting-edge solutions.',
    'Help shape the future of technology with your expertise.',
    'Work on challenging projects that make a real impact.',
    'Collaborate with talented professionals in a dynamic environment.',
    'Drive innovation and growth in a fast-paced startup.',
    'Lead exciting projects and mentor junior team members.',
    'Create solutions that solve real-world problems.',
    'Work with the latest technologies and frameworks.',
    'Contribute to our mission of transforming industries.',
    'Be part of a culture that values creativity and innovation.'
];

const salaryRanges = [
    '$80,000 - $100,000',
    '$90,000 - $120,000',
    '$100,000 - $130,000',
    '$70,000 - $90,000',
    '$120,000 - $150,000',
    '$60,000 - $80,000',
    '$110,000 - $140,000',
    '$85,000 - $105,000',
    '$95,000 - $115,000',
    '$75,000 - $95,000'
];

const benefits = [
    'Health insurance, 401(k) matching, flexible hours',
    'Remote work options, professional development, gym membership',
    'Competitive salary, stock options, unlimited PTO',
    'Comprehensive benefits, work-life balance, team events',
    'Medical, dental, vision, and wellness programs',
    'Learning budget, home office setup, flexible schedule',
    'Health benefits, retirement plan, paid time off',
    'Remote-first culture, professional growth, team building',
    'Comprehensive package, work flexibility, career development',
    'Health coverage, 401(k), flexible work arrangements'
];

async function addTestJobs() {
    try {
        // Wait for database to initialize
        await dbPromise;
        
        // Clear existing jobs
        await dbOperations.run('DELETE FROM jobs');
        
        // Add 20 new jobs
        for (let i = 0; i < 20; i++) {
            const job = {
                id: Date.now().toString() + i,
                title: titles[i % titles.length],
                company: companies[i % companies.length],
                location: locations[i % locations.length],
                jobType: jobTypes[i % jobTypes.length],
                industry: industries[i % industries.length],
                salaryRange: salaryRanges[i % salaryRanges.length],
                description: descriptions[i % descriptions.length],
                qualifications: skills[i % skills.length],
                contactEmail: 'careers@' + companies[i % companies.length].toLowerCase() + '.com',
                benefits: benefits[i % benefits.length],
                status: 'active',
                postedBy: 'test-user-id',
                postedAt: new Date().toISOString()
            };

            await dbOperations.run(`
                INSERT INTO jobs (
                    id, title, company, location, jobType, industry,
                    salaryRange, description, qualifications, contactEmail,
                    benefits, status, postedBy, postedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                job.id,
                job.title,
                job.company,
                job.location,
                job.jobType,
                job.industry,
                job.salaryRange,
                job.description,
                job.qualifications,
                job.contactEmail,
                job.benefits,
                job.status,
                job.postedBy,
                job.postedAt
            ]);
        }

        console.log('Successfully added 20 test jobs to the database');
    } catch (error) {
        console.error('Error adding test jobs:', error);
    }
}

// Run the function
addTestJobs(); 