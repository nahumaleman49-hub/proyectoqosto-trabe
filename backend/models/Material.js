const pool = require('../config/db');

class Material {
    // Obtener todos los materiales (con soft delete) y opcionalmente buscar
    static async getAll(searchTerm = null) {
        let query = `
            SELECT m.*, c.nombre as categoria_nombre
            FROM materiales m
            LEFT JOIN categoria c ON m.fk_id_categoria = c.ID_Categoria AND c.deleted_at IS NULL
            WHERE m.deleted_at IS NULL
        `;
        const params = [];
        if (searchTerm && searchTerm.trim() !== '') {
            query += ` AND (m.nombre LIKE ? OR m.codigo LIKE ?)`;
            const like = `%${searchTerm}%`;
            params.push(like, like);
        }
        query += ` ORDER BY m.nombre ASC`;
        const [rows] = await pool.query(query, params);
        return rows;
    }

    // Obtener un material por ID con sus proveedores vinculados (abastecimiento)
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT m.*, c.nombre as categoria_nombre
            FROM materiales m
            LEFT JOIN categoria c ON m.fk_id_categoria = c.ID_Categoria AND c.deleted_at IS NULL
            WHERE m.ID_Material = ? AND m.deleted_at IS NULL
        `, [id]);
        if (!rows[0]) return null;
        const material = rows[0];

        // Obtener proveedores vinculados (con sus precios)
        const [proveedores] = await pool.query(`
            SELECT a.ID_prod, a.precio, p.ID_proveedor, p.nombre, p.nombre_contacto, p.telefono
            FROM abastecimiento a
            JOIN proveedores p ON a.fk_id_proveedor = p.ID_proveedor AND p.deleted_at IS NULL
            WHERE a.fk_id_material = ? AND a.deleted_at IS NULL
        `, [id]);
        material.proveedores = proveedores;
        return material;
    }

    // Crear material
    static async create(data) {
        const { nombre, codigo, medidas, fk_id_categoria } = data;
        const [result] = await pool.query(`
            INSERT INTO materiales (nombre, codigo, medidas, fk_id_categoria)
            VALUES (?, ?, ?, ?)
        `, [nombre, codigo, medidas, fk_id_categoria]);
        return result.insertId;
    }

    // Actualizar material
    static async update(id, data) {
        const { nombre, codigo, medidas, fk_id_categoria } = data;
        const [result] = await pool.query(`
            UPDATE materiales
            SET nombre=?, codigo=?, medidas=?, fk_id_categoria=?
            WHERE ID_Material = ? AND deleted_at IS NULL
        `, [nombre, codigo, medidas, fk_id_categoria, id]);
        return result.affectedRows > 0;
    }

    // Soft delete
    static async delete(id) {
        // Primero eliminar vínculos en abastecimiento (soft delete)
        await pool.query(`UPDATE abastecimiento SET deleted_at = NOW() WHERE fk_id_material = ?`, [id]);
        const [result] = await pool.query(`UPDATE materiales SET deleted_at = NOW() WHERE ID_Material = ?`, [id]);
        return result.affectedRows > 0;
    }

    // Verificar unicidad de nombre y código
    static async checkUnique(field, value, excludeId = null) {
        let query = `SELECT COUNT(*) as count FROM materiales WHERE ${field} = ? AND deleted_at IS NULL`;
        const params = [value];
        if (excludeId) {
            query += ` AND ID_Material != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(query, params);
        return rows[0].count === 0;
    }
}

module.exports = Material;
