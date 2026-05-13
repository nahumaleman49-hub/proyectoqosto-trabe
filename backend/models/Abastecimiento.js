const pool = require('../config/db');

class Abastecimiento {
    // Vincular o actualizar precio de un proveedor para un material (UPSERT)
    static async upsert(materialId, proveedorId, precio) {
        const [existing] = await pool.query(`
            SELECT ID_prod FROM abastecimiento
            WHERE fk_id_material = ? AND fk_id_proveedor = ? AND deleted_at IS NULL
        `, [materialId, proveedorId]);
        if (existing.length > 0) {
            await pool.query(`
                UPDATE abastecimiento SET precio = ?, updated_at = NOW()
                WHERE ID_prod = ?
            `, [precio, existing[0].ID_prod]);
            return { updated: true };
        } else {
            const [result] = await pool.query(`
                INSERT INTO abastecimiento (fk_id_material, fk_id_proveedor, precio, created_at, updated_at)
                VALUES (?, ?, ?, NOW(), NOW())
            `, [materialId, proveedorId, precio]);
            return { created: true, id: result.insertId };
        }
    }

    static async delete(materialId, proveedorId) {
        const [result] = await pool.query(`
            UPDATE abastecimiento SET deleted_at = NOW()
            WHERE fk_id_material = ? AND fk_id_proveedor = ? AND deleted_at IS NULL
        `, [materialId, proveedorId]);
        return result.affectedRows > 0;
    }
}

module.exports = Abastecimiento;