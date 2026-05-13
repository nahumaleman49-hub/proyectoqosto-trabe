// backend/controllers/cotizacionController.js
const Cotizacion = require('../models/Cotizacion');
const Proyecto = require('../models/Proyecto');
const Cliente = require('../models/Cliente');
const DetalleMaterial = require('../models/DetalleMaterial');
const DetalleServicio = require('../models/DetalleServicio');
const pool = require('../config/db');

// Listar cotizaciones
const index = async (req, res) => {
    try {
        const cotizaciones = await Cotizacion.getAll();
        res.json(cotizaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener cotizaciones' });
    }
};

// Obtener una cotización (incluye materiales y servicios)
const show = async (req, res) => {
    try {
        const { id } = req.params;
        const cotizacion = await Cotizacion.getById(id);
        if (!cotizacion) return res.status(404).json({ message: 'Cotización no encontrada' });
        
        // Asignar valores por defecto si las columnas no existen o son null
        cotizacion.costo_equipo = cotizacion.costo_equipo ?? 0;
        cotizacion.gastos_generales = cotizacion.gastos_generales ?? 0;
        cotizacion.margen_ganancia = cotizacion.margen_ganancia ?? 0;
        
        res.json(cotizacion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener cotización' });
    }
};

// Crear cotización (con proyecto nuevo o existente)
const store = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const {
            usarProyectoExistente,
            proyecto_id,
            nombre_proyecto,
            cliente_id,
            costo_equipo,
            gastos_generales,
            margen_ganancia,
            materiales_json,
            servicios_json
        } = req.body;

        let proyectoFinalId;
        let clienteAsociadoId;

        if (usarProyectoExistente && proyecto_id) {
            // Usar proyecto existente
            const proyecto = await Proyecto.getById(proyecto_id);
            if (!proyecto) throw new Error('Proyecto no encontrado');
            proyectoFinalId = proyecto_id;
            clienteAsociadoId = proyecto.fk_id_cliente;
        } else {
            // Crear nuevo proyecto
            if (!nombre_proyecto || !cliente_id) {
                throw new Error('Datos de nuevo proyecto incompletos');
            }
            const clienteExists = await Cliente.getById(cliente_id);
            if (!clienteExists) throw new Error('Cliente no encontrado');
            const newProyectoId = await Proyecto.create({
                nombre: nombre_proyecto,
                fk_id_cliente: cliente_id,
                estado: 1,
                fecha_ini: new Date(),
                presupuesto: 0
            });
            proyectoFinalId = newProyectoId;
            clienteAsociadoId = cliente_id;
        }

        // Crear cotización
        const fecha = new Date();
        const cotizacionId = await Cotizacion.create({
            fk_id_proyecto: proyectoFinalId,
            fecha: new Date(),
            estado: 0,
            total: 0,
            costo_equipo: parseFloat(costo_equipo) || 0,
            gastos_generales: parseFloat(gastos_generales) || 0,
            margen_ganancia: parseFloat(margen_ganancia) || 0
        });

        // Procesar materiales
        const materiales = JSON.parse(materiales_json || '[]');
        let totalMateriales = 0;
        for (const mat of materiales) {
            // mat: { id_prod, cantidad }
            // Obtener precio del abastecimiento
            const [rows] = await connection.query(
                `SELECT precio FROM abastecimiento WHERE ID_prod = ? AND deleted_at IS NULL`,
                [mat.id_prod]
            );
            if (rows.length === 0) continue;
            const precio = rows[0].precio;
            await DetalleMaterial.create(cotizacionId, mat.id_prod, mat.cantidad);
            totalMateriales += mat.cantidad * precio;
        }

        // Procesar servicios
        const servicios = JSON.parse(servicios_json || '[]');
        let totalServicios = 0;
        for (const serv of servicios) {
            // serv: { mano_obra_id, cantidad, precio_unitario }
            // Obtener precio de manoobra (validar)
            const [rows] = await connection.query(
                `SELECT precio FROM manoobra WHERE ID_mano_obra = ? AND deleted_at IS NULL`,
                [serv.mano_obra_id]
            );
            if (rows.length === 0) continue;
            const precio = rows[0].precio;
            await DetalleServicio.create(cotizacionId, serv.mano_obra_id, serv.cantidad);
            totalServicios += serv.cantidad * precio;
        }

        // Calcular totales
        const subtotalBase = totalMateriales + totalServicios + (parseFloat(costo_equipo) || 0);
        const gastosPorcentaje = parseFloat(gastos_generales) || 0;
        const margenPorcentaje = parseFloat(margen_ganancia) || 0;
        const conGastos = subtotalBase * (1 + gastosPorcentaje / 100);
        const totalFinal = conGastos * (1 + margenPorcentaje / 100);

        // Actualizar cotización y proyecto
        await Cotizacion.update(cotizacionId, totalFinal, 0);
        await Proyecto.updatePresupuesto(proyectoFinalId, totalFinal);

        await connection.commit();
        res.status(201).json({ message: 'Cotización creada', id: cotizacionId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al crear cotización' });
    } finally {
        connection.release();
    }
};

// Actualizar cotización (similar a store pero actualizando detalles)
const update = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const existing = await Cotizacion.getById(id);
        if (!existing) return res.status(404).json({ message: 'Cotización no encontrada' });

        const {
            usarProyectoExistente,
            proyecto_id,
            nombre_proyecto,
            cliente_id,
            costo_equipo,
            gastos_generales,
            margen_ganancia,
            materiales_json,
            servicios_json
        } = req.body;

        let proyectoFinalId;
        if (usarProyectoExistente && proyecto_id) {
            proyectoFinalId = proyecto_id;
        } else {
            // Si se cambia a nuevo proyecto, actualizar el proyecto existente (la cotización ya tiene uno)
            // O crear uno nuevo y reemplazar? Según la lógica de Laravel, la cotización tiene un proyecto asociado.
            // Aquí asumimos que se actualiza el proyecto asociado actual.
            if (nombre_proyecto && cliente_id) {
                await Proyecto.update(existing.fk_id_proyecto, {
                    nombre: nombre_proyecto,
                    fk_id_cliente: cliente_id
                });
                proyectoFinalId = existing.fk_id_proyecto;
            } else {
                proyectoFinalId = existing.fk_id_proyecto;
            }
        }

        // Eliminar detalles antiguos
        await DetalleMaterial.deleteByCotizacion(id);
        await DetalleServicio.deleteByCotizacion(id);

        // Recalcular totales
        const materiales = JSON.parse(materiales_json || '[]');
        let totalMateriales = 0;
        for (const mat of materiales) {
            const [rows] = await connection.query(`SELECT precio FROM abastecimiento WHERE ID_prod = ?`, [mat.id_prod]);
            if (rows.length) {
                await DetalleMaterial.create(id, mat.id_prod, mat.cantidad);
                totalMateriales += mat.cantidad * rows[0].precio;
            }
        }

        const servicios = JSON.parse(servicios_json || '[]');
        let totalServicios = 0;
        for (const serv of servicios) {
            const [rows] = await connection.query(`SELECT precio FROM manoobra WHERE ID_mano_obra = ?`, [serv.mano_obra_id]);
            if (rows.length) {
                await DetalleServicio.create(id, serv.mano_obra_id, serv.cantidad);
                totalServicios += serv.cantidad * rows[0].precio;
            }
        }

        const subtotalBase = totalMateriales + totalServicios + (parseFloat(costo_equipo) || 0);
        const gastosPorcentaje = parseFloat(gastos_generales) || 0;
        const margenPorcentaje = parseFloat(margen_ganancia) || 0;
        const conGastos = subtotalBase * (1 + gastosPorcentaje / 100);
        const totalFinal = conGastos * (1 + margenPorcentaje / 100);
        await Cotizacion.update(cotizacionId, totalFinal, 0, costo_equipo, gastos_generales, margen_ganancia);
        await Proyecto.updatePresupuesto(proyectoFinalId, totalFinal);

        await connection.commit();
        res.json({ message: 'Cotización actualizada' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al actualizar cotización' });
    } finally {
        connection.release();
    }
};

// Eliminar cotización
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Cotizacion.getById(id);
        if (!existing) return res.status(404).json({ message: 'Cotización no encontrada' });
        await Cotizacion.delete(id);
        res.json({ message: 'Cotización eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar cotización' });
    }
};

// ========== ENDPOINTS AJAX ==========
// Obtener clientes (para select)
const getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.getAll();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

// Obtener proyectos existentes (para select)
const getProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.getAll(); // necesita método getAll
        res.json(proyectos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
};

// Obtener datos de un proyecto (para auto-llenar al seleccionar)
const getProyectoData = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.getById(id);
        if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado' });
        const cliente = await Cliente.getById(proyecto.fk_id_cliente);
        res.json({
            nombre_proyecto: proyecto.nombre,
            cliente: {
                id: cliente.ID_cliente,
                nombre: cliente.nombre,
                telefono: cliente.telefono,
                email: cliente.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos del proyecto' });
    }
};

// Obtener materiales por categoría
const getMaterialesPorCategoria = async (req, res) => {
    try {
        const { catId } = req.params;
        const [rows] = await pool.query(`
            SELECT ID_Material as id, nombre as text, medidas
            FROM materiales
            WHERE fk_id_categoria = ? AND deleted_at IS NULL
        `, [catId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener materiales' });
    }
};

// Obtener proveedores por material (con precio y ID_prod)
const getProveedoresPorMaterial = async (req, res) => {
    try {
        const { matId } = req.params;
        const [rows] = await pool.query(`
            SELECT a.ID_prod as id_prod, a.precio, p.ID_proveedor as id, p.nombre as text
            FROM abastecimiento a
            JOIN proveedores p ON a.fk_id_proveedor = p.ID_proveedor
            WHERE a.fk_id_material = ? AND a.deleted_at IS NULL AND p.deleted_at IS NULL
        `, [matId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

// Obtener servicios por categoría
const getServiciosPorCategoria = async (req, res) => {
    try {
        const { catId } = req.params;
        const [rows] = await pool.query(`
            SELECT s.ID_servicio as id, s.nombre as text
            FROM servicio s
            WHERE s.fk_id_categoria = ? AND s.deleted_at IS NULL
        `, [catId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

// Obtener proveedores por servicio (manoobra) con precio y unidad
const getProveedoresPorServicio = async (req, res) => {
    try {
        const { servId } = req.params;
        const [rows] = await pool.query(`
            SELECT mo.ID_mano_obra as id, mo.precio, mo.unidad, p.nombre as text, p.ID_proveedor as proveedor_id
            FROM manoobra mo
            JOIN proveedores p ON mo.fk_id_proveedor = p.ID_proveedor
            WHERE mo.fk_id_servicio = ? AND mo.deleted_at IS NULL AND p.deleted_at IS NULL
        `, [servId]);
        // Formatear text: nombre proveedor - $precio
        const result = rows.map(r => ({
            ...r,
            text: `${r.text} - $${r.precio}`
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

// Obtener categorías de materiales (las que tienen materiales)
const getCategoriasMateriales = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT c.ID_Categoria as id, c.nombre as text
            FROM categoria c
            JOIN materiales m ON c.ID_Categoria = m.fk_id_categoria AND m.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías de materiales' });
    }
};

// Obtener categorías de servicios (las que tienen servicios)
const getCategoriasServicios = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT c.ID_Categoria as id, c.nombre as text
            FROM categoria c
            JOIN servicio s ON c.ID_Categoria = s.fk_id_categoria AND s.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías de servicios' });
    }
};

module.exports = {
    index, show, store, update, destroy,
    getClientes, getProyectos, getProyectoData,
    getMaterialesPorCategoria, getProveedoresPorMaterial,
    getServiciosPorCategoria, getProveedoresPorServicio,
    getCategoriasMateriales, getCategoriasServicios
};