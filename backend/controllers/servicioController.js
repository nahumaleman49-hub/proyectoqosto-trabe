const Servicio = require('../models/Servicio');
const ManoObra = require('../models/ManoObra');
const Categoria = require('../models/Categoria'); // si no existe, créalo igual que en Materiales
const Proveedor = require('../models/Proveedor');

// Listado de servicios
const index = async (req, res) => {
    try {
        const servicios = await Servicio.getAll();
        // Para cada servicio, obtener sus proveedores con precios (opcional, pero lo hacemos en getById si es necesario)
        // Para el listado, podemos obtener también los proveedores en una segunda consulta o usar el método getAll que ya los trae?
        // En nuestra implementación de getAll no incluye proveedores. Para la vista de lista se necesitan los precios.
        // Mejor hacer una consulta separada o modificar getAll para que incluya un resumen.
        // Como en Blade original se muestran debajo de cada servicio los proveedores, vamos a enriquecer los datos:
        const serviciosConProveedores = await Promise.all(servicios.map(async s => {
            const completo = await Servicio.getById(s.ID_servicio);
            return completo;
        }));
        res.json(serviciosConProveedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

// Obtener un servicio (con proveedores)
const show = async (req, res) => {
    try {
        const { id } = req.params;
        const servicio = await Servicio.getById(id);
        if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });
        res.json(servicio);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener servicio' });
    }
};

// Crear servicio base
const store = async (req, res) => {
    try {
        const { nombre, fk_id_categoria } = req.body;
        if (!nombre || !fk_id_categoria) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        const nameUnique = await Servicio.checkUniqueNombre(nombre);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre del servicio ya existe' });

        const newId = await Servicio.create({ nombre, fk_id_categoria });
        const newServicio = await Servicio.getById(newId);
        res.status(201).json(newServicio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear servicio' });
    }
};

// Actualizar servicio
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Servicio.getById(id);
        if (!existing) return res.status(404).json({ message: 'Servicio no encontrado' });

        const { nombre, fk_id_categoria } = req.body;
        const nameUnique = await Servicio.checkUniqueNombre(nombre, id);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre ya existe' });

        const updated = await Servicio.update(id, { nombre, fk_id_categoria });
        if (!updated) return res.status(400).json({ message: 'No se pudo actualizar' });
        const updatedServicio = await Servicio.getById(id);
        res.json(updatedServicio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar servicio' });
    }
};

// Eliminar (soft delete)
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Servicio.getById(id);
        if (!existing) return res.status(404).json({ message: 'Servicio no encontrado' });
        const deleted = await Servicio.delete(id);
        if (!deleted) return res.status(400).json({ message: 'No se pudo eliminar' });
        res.json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar servicio' });
    }
};

// ===================== Vinculación con proveedores =====================
const vincularProveedor = async (req, res) => {
    try {
        const { fk_id_servicio, fk_id_proveedor, unidad, precio } = req.body;
        if (!fk_id_servicio || !fk_id_proveedor || !unidad || precio === undefined) {
            return res.status(400).json({ message: 'Faltan datos' });
        }
        const servicio = await Servicio.getById(fk_id_servicio);
        if (!servicio) return res.status(404).json({ message: 'Servicio no existe' });
        const proveedor = await Proveedor.getById(fk_id_proveedor);
        if (!proveedor) return res.status(404).json({ message: 'Proveedor no existe' });

        const result = await ManoObra.upsert(fk_id_servicio, fk_id_proveedor, unidad, precio);
        const mensaje = result.updated ? 'Información del proveedor actualizada' : 'Proveedor vinculado al servicio';
        res.json({ message: mensaje });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al vincular proveedor' });
    }
};

const desvincularProveedor = async (req, res) => {
    try {
        const { servicioId, proveedorId } = req.params;
        const deleted = await ManoObra.delete(servicioId, proveedorId);
        if (!deleted) return res.status(404).json({ message: 'Vínculo no encontrado' });
        res.json({ message: 'Proveedor desvinculado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al desvincular proveedor' });
    }
};

// ===================== Datos auxiliares para selects =====================
const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.getAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

const getProveedoresServicios = async (req, res) => {
    try {
        const allProveedores = await Proveedor.getAll();
        const proveedores = allProveedores.filter(p => p.tipo === 'Servicios' || p.tipo === 'Ambos');
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

module.exports = {
    index, show, store, update, destroy,
    vincularProveedor, desvincularProveedor,
    getCategorias, getProveedoresServicios
};