// backend/models/Cotizacion.js
const pool = require('../config/db');

class Cotizacion {
    // Obtener todas las cotizaciones con proyecto y cliente
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT c.*, p.nombre as proyecto_nombre, cl.nombre as cliente_nombre
            FROM cotizacion c
            JOIN proyecto p ON c.fk_id_proyecto = p.ID_proyecto AND p.deleted_at IS NULL
            JOIN clientes cl ON p.fk_id_cliente = cl.ID_cliente AND cl.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
            ORDER BY c.ID_cotizacion DESC
        `);
        return rows;
    }

    // Obtener una cotización con todos sus detalles (materiales y servicios)
    static async getById(id) {
    // Temporalmente, quita costo_equipo, gastos_generales, margen_ganancia de la SELECT
        const [rows] = await pool.query(`
        SELECT c.*, p.nombre as proyecto_nombre, p.fk_id_cliente as cliente_id, 
               cl.nombre as cliente_nombre, cl.telefono, cl.email
        FROM cotizacion c
        JOIN proyecto p ON c.fk_id_proyecto = p.ID_proyecto AND p.deleted_at IS NULL
        JOIN clientes cl ON p.fk_id_cliente = cl.ID_cliente AND cl.deleted_at IS NULL
        WHERE c.ID_cotizacion = ? AND c.deleted_at IS NULL
    `, [id]);
        if (rows.length === 0) return null;
        const cotizacion = rows[0];

        // Detalles de materiales (abastecimiento)
        const [materiales] = await pool.query(`
            SELECT d.*, a.fk_id_material, a.fk_id_proveedor, a.precio as precio_unitario,
                   m.nombre as material_nombre, m.medidas, prov.nombre as proveedor_nombre
            FROM detallecotizacion_abastecimiento d
            JOIN abastecimiento a ON d.fk_id_abastecimiento = a.ID_prod
            JOIN materiales m ON a.fk_id_material = m.ID_Material
            JOIN proveedores prov ON a.fk_id_proveedor = prov.ID_proveedor
            WHERE d.fk_id_cotizacion = ? AND d.deleted_at IS NULL
        `, [id]);
        cotizacion.materiales = materiales;

        // Detalles de servicios (mano obra)
        const [servicios] = await pool.query(`
            SELECT d.*, mo.fk_id_servicio, mo.precio as precio_unitario, mo.unidad,
                   s.nombre as servicio_nombre, prov.nombre as proveedor_nombre
            FROM detallecotizacion d
            JOIN manoobra mo ON d.fk_id_mano_obra = mo.ID_mano_obra
            JOIN servicio s ON mo.fk_id_servicio = s.ID_servicio
            JOIN proveedores prov ON mo.fk_id_proveedor = prov.ID_proveedor
            WHERE d.fk_id_cotizacion = ? AND d.deleted_at IS NULL
        `, [id]);
        cotizacion.servicios = servicios;

        return cotizacion;
    }

    // create
    static async create(data) {
        const { fk_id_proyecto, fecha, estado, total, costo_equipo, gastos_generales, margen_ganancia } = data;
        const [result] = await pool.query(`
            INSERT INTO cotizacion (fk_id_proyecto, fecha, estado, total, costo_equipo, gastos_generales, margen_ganancia)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [fk_id_proyecto, fecha, estado, total, costo_equipo, gastos_generales, margen_ganancia]);
        return result.insertId;
    }

    // update
    static async update(id, total, estado, costo_equipo, gastos_generales, margen_ganancia) {
        console.log("🔍 Modelo update recibe:", { id, total, estado, costo_equipo, gastos_generales, margen_ganancia });
        const estadoParsed = parseInt(estado, 10);
        const estadoSanitizado = (estado !== undefined && estado !== null) ? parseInt(estado, 10) : 0;
        const [result] = await pool.query(`
        UPDATE cotizacion 
        SET total = ?, estado = ?, costo_equipo = ?, gastos_generales = ?, margen_ganancia = ?
        WHERE ID_cotizacion = ? AND deleted_at IS NULL
    `, [total, estadoSanitizado, costo_equipo, gastos_generales, margen_ganancia, id]);
    return result.affectedRows > 0;
    }

    // Soft delete
    static async delete(id) {
        await pool.query(`UPDATE detallecotizacion_abastecimiento SET deleted_at = NOW() WHERE fk_id_cotizacion = ?`, [id]);
        await pool.query(`UPDATE detallecotizacion SET deleted_at = NOW() WHERE fk_id_cotizacion = ?`, [id]);
        const [result] = await pool.query(`UPDATE cotizacion SET deleted_at = NOW() WHERE ID_cotizacion = ?`, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Cotizacion;