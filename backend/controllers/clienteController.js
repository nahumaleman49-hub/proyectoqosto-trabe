const Cliente = require('../models/Cliente');

// Listar todos los clientes
const index = async (req, res) => {
    try {
        const clientes = await Cliente.getAll();
        res.json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

// Obtener un cliente por ID
const show = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.getById(id);
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cliente' });
    }
};

// Crear nuevo cliente
const store = async (req, res) => {
    try {
        const { nombre, telefono, direccion, email } = req.body;
        // Validaciones de presencia
       if (!nombre || !telefono || !direccion || !email) {
    return res.status(400).json({
        message: 'Todos los campos son requeridos'
    });
}

// Nombre solo letras
if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
    return res.status(400).json({
        message: 'El nombre solo puede contener letras'
    });
}

// Teléfono exactamente 10 dígitos
if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({
        message: 'El teléfono debe tener exactamente 10 dígitos'
    });
}  //modificado fin

        // Validaciones de unicidad
        const nameUnique = await Cliente.checkUnique('nombre', nombre);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre ya existe' });
        const phoneUnique = await Cliente.checkUnique('telefono', telefono);
        if (!phoneUnique) return res.status(409).json({ message: 'El teléfono ya está registrado' });
        const emailUnique = await Cliente.checkUnique('email', email);
        if (!emailUnique) return res.status(409).json({ message: 'El email ya existe' });

        const newId = await Cliente.create({ nombre, telefono, direccion, email });
        const newCliente = await Cliente.getById(newId);
        res.status(201).json(newCliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};

// Actualizar cliente
const update = async (req, res) => {
    try {
        const { id } = req.params;
       const { nombre, telefono, direccion, email } = req.body;

// Validaciones de presencia
if (!nombre || !telefono || !direccion || !email) {
    return res.status(400).json({
        message: 'Todos los campos son requeridos'
    });
}

// Nombre solo letras
if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
    return res.status(400).json({
        message: 'El nombre solo puede contener letras'
    });
}

// Teléfono exactamente 10 dígitos
if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({
        message: 'El teléfono debe tener exactamente 10 dígitos'
    });
}

const existing = await Cliente.getById(id);
if (!existing) return res.status(404).json({ message: 'Cliente no encontrado' });

        // Validaciones de unicidad excluyendo el propio ID
        const nameUnique = await Cliente.checkUnique('nombre', nombre, id);
        if (!nameUnique) return res.status(409).json({ message: 'El nombre ya existe' });
        const phoneUnique = await Cliente.checkUnique('telefono', telefono, id);
        if (!phoneUnique) return res.status(409).json({ message: 'El teléfono ya está registrado' });
        const emailUnique = await Cliente.checkUnique('email', email, id);
        if (!emailUnique) return res.status(409).json({ message: 'El email ya existe' });

        const updated = await Cliente.update(id, { nombre, telefono, direccion, email });
        if (!updated) return res.status(400).json({ message: 'No se pudo actualizar' });
        const updatedCliente = await Cliente.getById(id);
        res.json(updatedCliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

// Eliminar (soft delete)
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Cliente.getById(id);
        if (!existing) return res.status(404).json({ message: 'Cliente no encontrado' });
        // (Opcional) Verificar si tiene proyectos activos y no permitir eliminación
        const deleted = await Cliente.delete(id);
        if (!deleted) return res.status(400).json({ message: 'No se pudo eliminar' });
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar cliente' });
    }
};

module.exports = { index, show, store, update, destroy };