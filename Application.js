const { dbOperations } = require('./database');

class Application {
    constructor({
        id, jobId, applicantId, status, appliedDate, resume, coverLetter
    }) {
        this.id = id || dbOperations.generateId();
        this.jobId = jobId;
        this.applicantId = applicantId;
        this.status = status || 'pending';
        this.appliedDate = appliedDate || new Date().toISOString();
        this.resume = resume;
        this.coverLetter = coverLetter;
    }

    static find(criteria = {}) {
        let query = 'SELECT * FROM applications';
        const params = [];
        const conditions = [];

        if (criteria.id) {
            conditions.push('id = ?');
            params.push(criteria.id);
        }

        if (criteria.jobId) {
            conditions.push('jobId = ?');
            params.push(criteria.jobId);
        }

        if (criteria.applicantId) {
            conditions.push('applicantId = ?');
            params.push(criteria.applicantId);
        }

        if (criteria.status) {
            conditions.push('status = ?');
            params.push(criteria.status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const applications = dbOperations.all(query, params);
        
        return applications.map(app => new Application(app));
    }

    static findById(id) {
        const application = dbOperations.get('SELECT * FROM applications WHERE id = ?', [id]);
        
        if (!application) return null;
        
        return new Application(application);
    }

    save() {
        dbOperations.run(`
            INSERT INTO applications (
                id, jobId, applicantId, status, appliedDate, resume, coverLetter
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            this.id,
            this.jobId,
            this.applicantId,
            this.status,
            this.appliedDate,
            this.resume,
            this.coverLetter
        ]);
        
        return this;
    }

    update() {
        dbOperations.run(`
            UPDATE applications 
            SET status = ?, resume = ?, coverLetter = ?
            WHERE id = ?
        `, [
            this.status,
            this.resume,
            this.coverLetter,
            this.id
        ]);
        
        return this;
    }

    static delete(id) {
        return dbOperations.run('DELETE FROM applications WHERE id = ?', [id]);
    }
}

module.exports = Application;
