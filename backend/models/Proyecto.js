const pool = require('../config/db');

class Proyecto {
    static async getAll(search = null) {
        let query = `
            SELECT p.*, c.nombre as cliente_nombre
            FROM proyecto p
            LEFT JOIN clientes c ON p.fk_id_cliente = c.ID_cliente AND c.deleted_at IS NULL
            WHERE p.deleted_at IS NULL
        `;
        const params = [];
        if (search) {
            query += ` AND c.nombre LIKE ?`;
            params.push(`%${search}%`);
        }
        query += ` ORDER BY p.ID_proyecto DESC`;
        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre as cliente_nombre, c.ID_cliente as cliente_id
            FROM proyecto p
            LEFT JOIN clientes c ON p.fk_id_cliente = c.ID_cliente AND c.deleted_at IS NULL
            WHERE p.ID_proyecto = ? AND p.deleted_at IS NULL
        `, [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const { nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto } = data;
        const [result] = await pool.query(
            `INSERT INTO proyecto (nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, fk_id_cliente, estado, fecha_ini, fecha_fin || null, presupuesto]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        if (fields.length === 0) return false;
        values.push(id);
        const query = `UPDATE proyecto SET ${fields.join(', ')} WHERE ID_proyecto = ? AND deleted_at IS NULL`;
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    static async updatePresupuesto(id, presupuesto) {
        const [result] = await pool.query(`
            UPDATE proyecto SET presupuesto = ? WHERE ID_proyecto = ? AND deleted_at IS NULL
        `, [presupuesto, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query(
            `UPDATE proyecto SET deleted_at = NOW() WHERE ID_proyecto = ? AND deleted_at IS NULL`,
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Proyecto;