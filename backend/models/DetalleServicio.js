// backend/models/DetalleServicio.js
const pool = require('../config/db');

class DetalleServicio {
    static async create(cotizacionId, manoObraId, cantidad) {
        const [result] = await pool.query(`
            INSERT INTO detallecotizacion (fk_id_cotizacion, fk_id_mano_obra, cantidad)
            VALUES (?, ?, ?)
        `, [cotizacionId, manoObraId, cantidad]);
        return result.insertId;
    }

    static async deleteByCotizacion(cotizacionId) {
        await pool.query(`UPDATE detallecotizacion SET deleted_at = NOW() WHERE fk_id_cotizacion = ?`, [cotizacionId]);
    }
}

module.exports = DetalleServicio;