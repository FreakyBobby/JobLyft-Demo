const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbOperations } = require('./database');

class User {
    constructor({ id, name, email, password, role, phone, createdAt, isEmailVerified, resetPasswordToken, resetPasswordExpires }) {
        this.id = id || dbOperations.generateId();
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone || '';
        this.createdAt = createdAt || new Date().toISOString();
        this.isEmailVerified = isEmailVerified || false;
        this.resetPasswordToken = resetPasswordToken || null;
        this.resetPasswordExpires = resetPasswordExpires || null;
    }

    async hashPassword() {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

    generateAuthToken() {
        return jwt.sign(
            { id: this.id, role: this.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
    }

    generatePasswordResetToken() {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        this.resetPasswordExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
        return resetToken;
    }
}

// Helper functions for SQLite operations
const findUserByEmail = async (email) => {
    try {
        const user = await dbOperations.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return null;
        return new User(user);
    } catch (error) {
        console.error('Error finding user by email:', error);
        return null;
    }
};

const findUserById = async (id) => {
    try {
        const user = await dbOperations.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) return null;
        return new User(user);
    } catch (error) {
        console.error('Error finding user by id:', error);
        return null;
    }
};

const saveUser = async (user) => {
    try {
        await user.hashPassword();
        
        await dbOperations.run(`
            INSERT INTO users (id, name, email, password, role, phone, createdAt, isEmailVerified, resetPasswordToken, resetPasswordExpires)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user.id,
            user.name,
            user.email,
            user.password,
            user.role,
            user.phone,
            user.createdAt,
            user.isEmailVerified ? 1 : 0,
            user.resetPasswordToken,
            user.resetPasswordExpires
        ]);
        
        return user;
    } catch (error) {
        console.error('Error saving user:', error);
        throw new Error('Failed to save user');
    }
};

const updateUser = async (user) => {
    try {
        dbOperations.run(`
            UPDATE users 
            SET name = ?, email = ?, password = ?, role = ?, phone = ?, 
                isEmailVerified = ?, resetPasswordToken = ?, resetPasswordExpires = ?
            WHERE id = ?
        `, [
            user.name,
            user.email,
            user.password,
            user.role,
            user.phone,
            user.isEmailVerified ? 1 : 0,
            user.resetPasswordToken,
            user.resetPasswordExpires,
            user.id
        ]);
        
        return user;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
    }
};

module.exports = {
    User,
    findUserByEmail,
    findUserById,
    saveUser,
    updateUser
};
