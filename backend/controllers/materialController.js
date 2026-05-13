const Material = require('../models/Material');
const Categoria = require('../models/Categoria');
const Proveedor = require('../models/Proveedor'); // ya existe
const Abastecimiento = require('../models/Abastecimiento');

// Listado con búsqueda
const index = async (req, res) => {
    try {
        const { buscar } = req.query;
        const materiales = await Material.getAll(buscar);
        res.json(materiales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener materiales' });
    }
};

// Obtener un material (incluye proveedores vinculados)
const show = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await Material.getById(id);
        if (!material) return res.status(404).json({ message: 'Material no encontrado' });
        res.json(material);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener material' });
    }
};

// Crear material
const store = async (req, res) => {
    try {
        const { nombre, codigo, medidas, fk_id_categoria } = req.body;
        if (!nombre || !codigo || !medidas || !fk_id_categoria) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        // Validación de unicidad
        const nameUnique = await Material.checkUnique('nombre', nombre);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre ya existe' });
        const codeUnique = await Material.checkUnique('codigo', codigo);
        if (!codeUnique) return res.status(409).json({ message: 'El código ya existe' });

        const newId = await Material.create(req.body);
        const newMaterial = await Material.getById(newId);
        res.status(201).json(newMaterial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear material' });
    }
};

// Actualizar material
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Material.getById(id);
        if (!existing) return res.status(404).json({ message: 'Material no encontrado' });

        const { nombre, codigo, medidas, fk_id_categoria } = req.body;
        const nameUnique = await Material.checkUnique('nombre', nombre, id);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre ya existe' });
        const codeUnique = await Material.checkUnique('codigo', codigo, id);
        if (!codeUnique) return res.status(409).json({ message: 'El código ya existe' });

        const updated = await Material.update(id, { nombre, codigo, medidas, fk_id_categoria });
        if (!updated) return res.status(400).json({ message: 'No se pudo actualizar' });
        const updatedMaterial = await Material.getById(id);
        res.json(updatedMaterial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar material' });
    }
};

// Eliminar (soft delete)
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Material.getById(id);
        if (!existing) return res.status(404).json({ message: 'Material no encontrado' });
        const deleted = await Material.delete(id);
        if (!deleted) return res.status(400).json({ message: 'No se pudo eliminar' });
        res.json({ message: 'Material eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar material' });
    }
};

// ===================== Vinculación con proveedores =====================
const vincularProveedor = async (req, res) => {
    try {
        const { fk_id_material, fk_id_proveedor, precio } = req.body;
        if (!fk_id_material || !fk_id_proveedor || precio === undefined) {
            return res.status(400).json({ message: 'Faltan datos' });
        }
        const material = await Material.getById(fk_id_material);
        if (!material) return res.status(404).json({ message: 'Material no existe' });
        const proveedor = await Proveedor.getById(fk_id_proveedor);
        if (!proveedor) return res.status(404).json({ message: 'Proveedor no existe' });
        const result = await Abastecimiento.upsert(fk_id_material, fk_id_proveedor, precio);
        const mensaje = result.updated ? 'Precio actualizado' : 'Proveedor vinculado al material';
        res.json({ message: mensaje });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al vincular proveedor' });
    }
};

const desvincularProveedor = async (req, res) => {
    try {
        const { materialId, proveedorId } = req.params;
        const deleted = await Abastecimiento.delete(materialId, proveedorId);
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

const getProveedoresMateriales = async (req, res) => {
    try {
        // Proveedores que pueden surtir materiales (tipo 'Materiales' o 'Ambos')
        const allProveedores = await Proveedor.getAll(); // asumiendo que getAll devuelve todos
        const proveedores = allProveedores.filter(p => p.tipo === 'Materiales' || p.tipo === 'Ambos');
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proveedores' });
    }
};

// Creación rápida (para modal) - igual que guardar pero para uso AJAX
const storeRapido = async (req, res) => {
    try {
        const { nombre, codigo, medidas, fk_id_categoria } = req.body;
        if (!nombre || !codigo || !medidas || !fk_id_categoria) {
            return res.status(400).json({ success: false, mensaje: 'Faltan campos' });
        }
        const nameUnique = await Material.checkUnique('nombre', nombre);
        if (!nameUnique) return res.status(409).json({ success: false, mensaje: 'El nombre ya existe' });
        const codeUnique = await Material.checkUnique('codigo', codigo);
        if (!codeUnique) return res.status(409).json({ success: false, mensaje: 'El código ya existe' });

        const newId = await Material.create(req.body);
        const newMaterial = await Material.getById(newId);
        res.json({
            success: true,
            material: { id: newMaterial.ID_Material, nombre: newMaterial.nombre },
            mensaje: 'Material creado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, mensaje: 'Error al guardar' });
    }
};

module.exports = {
    index, show, store, update, destroy,
    vincularProveedor, desvincularProveedor,
    getCategorias, getProveedoresMateriales,
    storeRapido
};