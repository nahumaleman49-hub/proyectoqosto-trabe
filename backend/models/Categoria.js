const pool = require('../config/db');

class Categoria {
    static async getAll() {
        const [rows] = await pool.query('SELECT ID_Categoria, nombre FROM categoria WHERE deleted_at IS NULL ORDER BY nombre');
        return rows;
    }
}

module.exports = Categoria;