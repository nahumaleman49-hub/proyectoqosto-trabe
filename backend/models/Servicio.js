const pool = require('../config/db');

class Servicio {
    // Obtener todos los servicios con sus proveedores vinculados
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT s.*, c.nombre as categoria_nombre
            FROM servicio s
            LEFT JOIN categoria c ON s.fk_id_categoria = c.ID_Categoria AND c.deleted_at IS NULL
            WHERE s.deleted_at IS NULL
            ORDER BY s.nombre
        `);
        return rows;
    }

    // Obtener un servicio por ID con sus proveedores (manoObra)
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT s.*, c.nombre as categoria_nombre
            FROM servicio s
            LEFT JOIN categoria c ON s.fk_id_categoria = c.ID_Categoria AND c.deleted_at IS NULL
            WHERE s.ID_servicio = ? AND s.deleted_at IS NULL
        `, [id]);
        if (!rows[0]) return null;
        const servicio = rows[0];

        // Obtener proveedores vinculados con sus precios
        const [proveedores] = await pool.query(`
            SELECT mo.ID_mano_obra, mo.unidad, mo.precio, p.ID_proveedor, p.nombre, p.nombre_contacto, p.telefono
            FROM manoobra mo
            JOIN proveedores p ON mo.fk_id_proveedor = p.ID_proveedor AND p.deleted_at IS NULL
            WHERE mo.fk_id_servicio = ? AND mo.deleted_at IS NULL
        `, [id]);
        servicio.proveedores = proveedores;
        return servicio;
    }

    // Crear servicio base
    static async create(data) {
        const { nombre, fk_id_categoria } = data;
        const [result] = await pool.query(`
            INSERT INTO servicio (nombre, fk_id_categoria)
            VALUES (?, ?)
        `, [nombre, fk_id_categoria]);
        return result.insertId;
    }

    // Actualizar servicio
    static async update(id, data) {
        const { nombre, fk_id_categoria } = data;
        const [result] = await pool.query(`
            UPDATE servicio SET nombre=?, fk_id_categoria=?
            WHERE ID_servicio = ? AND deleted_at IS NULL
        `, [nombre, fk_id_categoria, id]);
        return result.affectedRows > 0;
    }

    // Soft delete
    static async delete(id) {
        // Primero eliminar vínculos en manoobra (soft delete)
        await pool.query(`UPDATE manoobra SET deleted_at = NOW() WHERE fk_id_servicio = ?`, [id]);
        const [result] = await pool.query(`UPDATE servicio SET deleted_at = NOW() WHERE ID_servicio = ?`, [id]);
        return result.affectedRows > 0;
    }

    // Verificar unicidad del nombre (ignorando eliminados)
    static async checkUniqueNombre(nombre, excludeId = null) {
        let query = `SELECT COUNT(*) as count FROM servicio WHERE nombre = ? AND deleted_at IS NULL`;
        const params = [nombre];
        if (excludeId) {
            query += ` AND ID_servicio != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(query, params);
        return rows[0].count === 0;
    }
}

module.exports = Servicio;