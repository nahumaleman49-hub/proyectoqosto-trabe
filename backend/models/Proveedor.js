const pool = require('../config/db');

class Proveedor {
    // Obtener todos los proveedores (no eliminados)
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT * FROM proveedores 
            WHERE deleted_at IS NULL 
            ORDER BY nombre
        `);
        return rows;
    }

    // Obtener proveedor por ID con sus materiales y servicios vinculados
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT * FROM proveedores 
            WHERE ID_proveedor = ? AND deleted_at IS NULL
        `, [id]);
        if (!rows[0]) return null;

        const proveedor = rows[0];

        // Obtener materiales vinculados (abastecimiento)
        const [materiales] = await pool.query(`
            SELECT a.ID_prod, a.precio, m.ID_Material, m.nombre, m.codigo, m.medidas
            FROM abastecimiento a
            JOIN materiales m ON a.fk_id_material = m.ID_Material
            WHERE a.fk_id_proveedor = ? AND a.deleted_at IS NULL
        `, [id]);
        proveedor.materiales = materiales;

        // Obtener servicios vinculados (manoobra)
        const [servicios] = await pool.query(`
            SELECT mo.ID_mano_obra, mo.precio, mo.unidad, s.ID_servicio, s.nombre
            FROM manoobra mo
            JOIN servicio s ON mo.fk_id_servicio = s.ID_servicio
            WHERE mo.fk_id_proveedor = ? AND mo.deleted_at IS NULL
        `, [id]);
        proveedor.servicios = servicios;

        return proveedor;
    }

    // Crear nuevo proveedor
    static async create(data) {
        const { nombre, nombre_contacto, telefono, correo_e, direccion, tipo } = data;
        const [result] = await pool.query(`
            INSERT INTO proveedores (nombre, nombre_contacto, telefono, correo_e, direccion, tipo)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [nombre, nombre_contacto, telefono, correo_e, direccion, tipo]);
        return result.insertId;
    }

    // Actualizar proveedor
    static async update(id, data) {
        const { nombre, nombre_contacto, telefono, correo_e, direccion, tipo } = data;
        const [result] = await pool.query(`
            UPDATE proveedores 
            SET nombre=?, nombre_contacto=?, telefono=?, correo_e=?, direccion=?, tipo=?
            WHERE ID_proveedor = ? AND deleted_at IS NULL
        `, [nombre, nombre_contacto, telefono, correo_e, direccion, tipo, id]);
        return result.affectedRows > 0;
    }

    // Soft delete
    static async delete(id) {
        // Primero eliminar vínculos (borrado físico, como en Laravel)
        await pool.query(`UPDATE abastecimiento SET deleted_at = NOW() WHERE fk_id_proveedor = ?`, [id]);
        await pool.query(`UPDATE manoobra SET deleted_at = NOW() WHERE fk_id_proveedor = ?`, [id]);
        const [result] = await pool.query(`UPDATE proveedores SET deleted_at = NOW() WHERE ID_proveedor = ?`, [id]);
        return result.affectedRows > 0;
    }

    // Verificar unicidad (nombre, teléfono, correo)
    static async checkUnique(field, value, excludeId = null) {
        let query = `SELECT COUNT(*) as count FROM proveedores WHERE ${field} = ? AND deleted_at IS NULL`;
        const params = [value];
        if (excludeId) {
            query += ` AND ID_proveedor != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(query, params);
        return rows[0].count === 0;
    }
}

module.exports = Proveedor;