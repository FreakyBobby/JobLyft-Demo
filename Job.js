const { dbOperations } = require('./database');

class Job {
    constructor({
        id, title, company, location, jobType, industry, salaryRange,
        description, qualifications, contactEmail, benefits, status, postedBy, postedAt
    }) {
        this.id = id || Date.now().toString();
        this.title = title;
        this.company = company;
        this.location = location;
        this.jobType = jobType;
        this.industry = industry || '';
        this.salaryRange = salaryRange;
        this.description = description;
        this.qualifications = qualifications || '';
        this.contactEmail = contactEmail || '';
        this.benefits = benefits || '';
        this.status = status || 'active';
        this.postedBy = postedBy;
        this.postedAt = postedAt || new Date().toISOString();
    }

    static async find(criteria = {}) {
        try {
            let query = 'SELECT * FROM jobs';
            const params = [];
            const conditions = [];

            if (criteria.id) {
                conditions.push('id = ?');
                params.push(criteria.id);
            }

            if (criteria.postedBy) {
                conditions.push('postedBy = ?');
                params.push(criteria.postedBy);
            }

            if (criteria.status) {
                conditions.push('status = ?');
                params.push(criteria.status);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            // Add order by postedAt DESC to show newest jobs first
            query += ' ORDER BY postedAt DESC';

            const jobs = await dbOperations.all(query, params);
            return jobs.map(job => new Job(job));
        } catch (error) {
            console.error('Error finding jobs:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const job = await dbOperations.get('SELECT * FROM jobs WHERE id = ?', [id]);
            return job ? new Job(job) : null;
        } catch (error) {
            console.error('Error finding job by ID:', error);
            throw error;
        }
    }

    static async create(jobData) {
        try {
            const job = new Job(jobData);
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
            return job;
        } catch (error) {
            console.error('Error creating job:', error);
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const job = await this.findById(id);
            if (!job) {
                throw new Error('Job not found');
            }

            const updatedJob = new Job({ ...job, ...updates });
            const fields = Object.keys(updates)
                .filter(key => key !== 'id') // Don't update ID
                .map(key => `${key} = ?`);
            const values = Object.keys(updates)
                .filter(key => key !== 'id')
                .map(key => updates[key]);

            await dbOperations.run(
                `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`,
                [...values, id]
            );

            return updatedJob;
        } catch (error) {
            console.error('Error updating job:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            await dbOperations.run('DELETE FROM jobs WHERE id = ?', [id]);
        } catch (error) {
            console.error('Error deleting job:', error);
            throw error;
        }
    }
}

module.exports = Job;
