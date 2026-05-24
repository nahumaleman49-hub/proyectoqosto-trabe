// backend/models/User.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async findByName(name) {
    const [rows] = await pool.query('SELECT id, name, email, password, role FROM users WHERE name = ?', [name]);
    return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async getAll() {
        const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
        return rows;
    }

    static async create({ name, email, password, role }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [name, email || null, hashedPassword, role || 'user']
        );
        return result.insertId;
    }

    static async update(id, { name, email, role, password }) {
        let query = 'UPDATE users SET name = ?, email = ?, role = ?, updated_at = NOW()';
        const params = [name, email || null, role];
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashed);
        }
        query += ' WHERE id = ?';
        params.push(id);
        const [result] = await pool.query(query, params);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;