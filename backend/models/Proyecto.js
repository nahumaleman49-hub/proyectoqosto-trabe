const pool = require('../config/db');

class Proyecto {
    // Obtener todos los proyectos con nombre del cliente (soft delete)
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

    // Obtener un proyecto por ID (con datos del cliente)
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre as cliente_nombre, c.ID_cliente as cliente_id
            FROM proyecto p
            LEFT JOIN clientes c ON p.fk_id_cliente = c.ID_cliente AND c.deleted_at IS NULL
            WHERE p.ID_proyecto = ? AND p.deleted_at IS NULL
        `, [id]);
        return rows[0] || null;
    }

    // Crear proyecto
    static async create(data) {
        const { nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto } = data;
        const [result] = await pool.query(
            `INSERT INTO proyecto (nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, fk_id_cliente, estado, fecha_ini, fecha_fin || null, presupuesto]
        );
        return result.insertId;
    }

    // Actualizar proyecto
    static async update(id, data) {
        const { nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto } = data;
        const [result] = await pool.query(
            `UPDATE proyecto SET nombre=?, fk_id_cliente=?, estado=?, fecha_ini=?, fecha_fin=?, presupuesto=?
             WHERE ID_proyecto = ? AND deleted_at IS NULL`,
            [nombre, fk_id_cliente, estado, fecha_ini, fecha_fin || null, presupuesto, id]
        );
        return result.affectedRows > 0;
    }

    // Soft delete
    static async delete(id) {
        const [result] = await pool.query(
            `UPDATE proyecto SET deleted_at = NOW() WHERE ID_proyecto = ? AND deleted_at IS NULL`,
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Proyecto;