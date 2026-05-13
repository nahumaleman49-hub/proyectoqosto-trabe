const pool = require('../config/db');

class ManoObra {
    // Vincular o actualizar precio/unidad de un proveedor para un servicio (UPSERT)
    static async upsert(servicioId, proveedorId, unidad, precio) {
        const [existing] = await pool.query(`
            SELECT ID_mano_obra FROM manoobra
            WHERE fk_id_servicio = ? AND fk_id_proveedor = ? AND deleted_at IS NULL
        `, [servicioId, proveedorId]);
        if (existing.length > 0) {
            await pool.query(`
                UPDATE manoobra SET precio = ?, unidad = ?, updated_at = NOW()
                WHERE ID_mano_obra = ?
            `, [precio, unidad, existing[0].ID_mano_obra]);
            return { updated: true };
        } else {
            const [result] = await pool.query(`
                INSERT INTO manoobra (fk_id_servicio, fk_id_proveedor, unidad, precio, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `, [servicioId, proveedorId, unidad, precio]);
            return { created: true, id: result.insertId };
        }
    }

    static async delete(servicioId, proveedorId) {
        const [result] = await pool.query(`
            UPDATE manoobra SET deleted_at = NOW()
            WHERE fk_id_servicio = ? AND fk_id_proveedor = ? AND deleted_at IS NULL
        `, [servicioId, proveedorId]);
        return result.affectedRows > 0;
    }
}

module.exports = ManoObra;