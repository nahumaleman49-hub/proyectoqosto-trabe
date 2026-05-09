const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async findByName(name) {
        const [rows] = await pool.query('SELECT id, name, email, password FROM users WHERE name = ?', [name]);
        if (rows.length === 0) return null;
        return rows[0];
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;