// backend/models/DetalleMaterial.js
const pool = require('../config/db');

class DetalleMaterial {
    static async create(cotizacionId, abastecimientoId, cantidad) {
        const [result] = await pool.query(`
            INSERT INTO detallecotizacion_abastecimiento (fk_id_cotizacion, fk_id_abastecimiento, cantidad)
            VALUES (?, ?, ?)
        `, [cotizacionId, abastecimientoId, cantidad]);
        return result.insertId;
    }

    static async deleteByCotizacion(cotizacionId) {
        await pool.query(`UPDATE detallecotizacion_abastecimiento SET deleted_at = NOW() WHERE fk_id_cotizacion = ?`, [cotizacionId]);
    }
}

module.exports = DetalleMaterial;