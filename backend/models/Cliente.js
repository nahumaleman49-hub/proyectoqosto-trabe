const pool = require('../config/db');

class Cliente {
    // Obtener todos los clientes no eliminados con conteo de proyectos
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT c.*, COUNT(p.ID_proyecto) as proyectos_count
            FROM clientes c
            LEFT JOIN proyecto p ON c.ID_cliente = p.fk_id_cliente AND p.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
            GROUP BY c.ID_cliente
            ORDER BY c.nombre ASC
        `);
        return rows;
    }

    // Obtener un cliente por ID (con conteo de proyectos)
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM proyecto WHERE fk_id_cliente = c.ID_cliente AND deleted_at IS NULL) as proyectos_count
            FROM clientes c
            WHERE c.ID_cliente = ? AND c.deleted_at IS NULL
        `, [id]);
        return rows[0] || null;
    }

    // Crear un nuevo cliente
    static async create(data) {
        const { nombre, telefono, direccion, email } = data;
        const [result] = await pool.query(
            'INSERT INTO clientes (nombre, telefono, direccion, email, updated_at) VALUES (?, ?, ?, ?, NOW())',
            [nombre, telefono, direccion, email]
        );
        return result.insertId;
    }

    // Actualizar cliente (solo si no está eliminado)
    static async update(id, data) {
        const { nombre, telefono, direccion, email } = data;
        const [result] = await pool.query(
            'UPDATE clientes SET nombre = ?, telefono = ?, direccion = ?, email = ?, updated_at = NOW() WHERE ID_cliente = ? AND deleted_at IS NULL',
            [nombre, telefono, direccion, email, id]
        );
        return result.affectedRows > 0;
    }

    // Soft delete: marcar deleted_at
    static async delete(id) {
        const [result] = await pool.query(
            'UPDATE clientes SET deleted_at = NOW() WHERE ID_cliente = ? AND deleted_at IS NULL',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Verificar unicidad de campos (nombre, teléfono, email)
    static async checkUnique(field, value, excludeId = null) {
        let query = `SELECT COUNT(*) as count FROM clientes WHERE ${field} = ? AND deleted_at IS NULL`;
        const params = [value];
        if (excludeId) {
            query += ` AND ID_cliente != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(query, params);
        return rows[0].count === 0;
    }
    
    static async getAll() {
    const [rows] = await pool.query('SELECT ID_cliente, nombre FROM clientes WHERE deleted_at IS NULL ORDER BY nombre');
    return rows;
    }
}

module.exports = Cliente;