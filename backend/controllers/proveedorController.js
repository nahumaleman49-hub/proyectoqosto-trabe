const Proveedor = require('../models/Proveedor');
const Material = require('../models/Material');
const Servicio = require('../models/Servicio');
const Abastecimiento = require('../models/Abastecimiento');
const ManoObra = require('../models/ManoObra');

// ===================== CRUD Proveedor =====================
const index = async (req, res) => {
    try {
        const proveedores = await Proveedor.getAll();
        res.json(proveedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

const show = async (req, res) => {
    try {
        const { id } = req.params;
        const proveedor = await Proveedor.getById(id);
        if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
        res.json(proveedor);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedor' });
    }
};

const store = async (req, res) => {
    try {
        const { nombre, nombre_contacto, telefono, correo_e, direccion, tipo } = req.body;
        if (!nombre || !nombre_contacto || !telefono || !correo_e || !direccion || !tipo) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        // Validaciones de unicidad
        const nameUnique = await Proveedor.checkUnique('nombre', nombre);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre ya existe' });
        const phoneUnique = await Proveedor.checkUnique('telefono', telefono);
        if (!phoneUnique) return res.status(409).json({ message: 'El teléfono ya está registrado' });
        const emailUnique = await Proveedor.checkUnique('correo_e', correo_e);
        if (!emailUnique) return res.status(409).json({ message: 'El correo ya existe' });

        const newId = await Proveedor.create(req.body);
        const newProveedor = await Proveedor.getById(newId);
        res.status(201).json(newProveedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear proveedor' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Proveedor.getById(id);
        if (!existing) return res.status(404).json({ message: 'Proveedor no encontrado' });

        const { nombre, nombre_contacto, telefono, correo_e, direccion, tipo } = req.body;
        // Validaciones de unicidad excluyendo el propio ID
        const nameUnique = await Proveedor.checkUnique('nombre', nombre, id);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre ya existe' });
        const phoneUnique = await Proveedor.checkUnique('telefono', telefono, id);
        if (!phoneUnique) return res.status(409).json({ message: 'El teléfono ya está registrado' });
        const emailUnique = await Proveedor.checkUnique('correo_e', correo_e, id);
        if (!emailUnique) return res.status(409).json({ message: 'El correo ya existe' });

        const updated = await Proveedor.update(id, req.body);
        if (!updated) return res.status(400).json({ message: 'No se pudo actualizar' });
        const updatedProveedor = await Proveedor.getById(id);
        res.json(updatedProveedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar proveedor' });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Proveedor.getById(id);
        if (!existing) return res.status(404).json({ message: 'Proveedor no encontrado' });
        const deleted = await Proveedor.delete(id);
        if (!deleted) return res.status(400).json({ message: 'No se pudo eliminar' });
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar proveedor' });
    }
};

// ===================== Vinculación Materiales =====================
const vincularMaterial = async (req, res) => {
    try {
        const { fk_id_proveedor, fk_id_material, precio } = req.body;
        if (!fk_id_proveedor || !fk_id_material || precio === undefined) {
            return res.status(400).json({ message: 'Faltan datos' });
        }
        const proveedor = await Proveedor.getById(fk_id_proveedor);
        if (!proveedor) return res.status(404).json({ message: 'Proveedor no existe' });
        const result = await Abastecimiento.upsert(fk_id_proveedor, fk_id_material, precio);
        const mensaje = result.updated ? 'Precio actualizado' : 'Material vinculado';
        res.json({ message: mensaje });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al vincular material' });
    }
};

const desvincularMaterial = async (req, res) => {
    try {
        const { proveedorId, materialId } = req.params;
        const deleted = await Abastecimiento.delete(proveedorId, materialId);
        if (!deleted) return res.status(404).json({ message: 'Vínculo no encontrado' });
        res.json({ message: 'Material desvinculado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al desvincular material' });
    }
};

// ===================== Vinculación Servicios =====================
const vincularServicio = async (req, res) => {
    try {
        const { fk_id_proveedor, fk_id_servicio, unidad, precio } = req.body;
        if (!fk_id_proveedor || !fk_id_servicio || !unidad || precio === undefined) {
            return res.status(400).json({ message: 'Faltan datos' });
        }
        const proveedor = await Proveedor.getById(fk_id_proveedor);
        if (!proveedor) return res.status(404).json({ message: 'Proveedor no existe' });
        const result = await ManoObra.upsert(fk_id_proveedor, fk_id_servicio, unidad, precio);
        const mensaje = result.updated ? 'Servicio actualizado' : 'Servicio vinculado';
        res.json({ message: mensaje });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al vincular servicio' });
    }
};

const desvincularServicio = async (req, res) => {
    try {
        const { proveedorId, servicioId } = req.params;
        const deleted = await ManoObra.delete(proveedorId, servicioId);
        if (!deleted) return res.status(404).json({ message: 'Vínculo no encontrado' });
        res.json({ message: 'Servicio desvinculado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al desvincular servicio' });
    }
};

// ===================== Listas auxiliares (para selects) =====================
const getMateriales = async (req, res) => {
    try {
        const materiales = await Material.getAll();
        res.json(materiales);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener materiales' });
    }
};

const getServicios = async (req, res) => {
    try {
        const servicios = await Servicio.getAll();
        res.json(servicios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener servicios' });
    }
};

module.exports = {
    index, show, store, update, destroy,
    vincularMaterial, desvincularMaterial,
    vincularServicio, desvincularServicio,
    getMateriales, getServicios
};