const Proyecto = require('../models/Proyecto');
const Cliente = require('../models/Cliente');

const index = async (req, res) => {
    try {
        const { search } = req.query;
        const proyectos = await Proyecto.getAll(search);
        res.json(proyectos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
};

const show = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await Proyecto.getById(id);
        if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado' });
        res.json(proyecto);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proyecto' });
    }
};

const store = async (req, res) => {
    try {
        const { nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto } = req.body;
        if (!nombre || !fk_id_cliente || estado === undefined || !fecha_ini || presupuesto === undefined) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        const cliente = await Cliente.getById(fk_id_cliente);
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

        const newId = await Proyecto.create({ nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto });
        const newProyecto = await Proyecto.getById(newId);
        res.status(201).json(newProyecto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear proyecto' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto } = req.body;
        const existing = await Proyecto.getById(id);
        if (!existing) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const cliente = await Cliente.getById(fk_id_cliente);
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

        const updated = await Proyecto.update(id, { nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto });
        if (!updated) return res.status(400).json({ message: 'No se pudo actualizar' });
        const updatedProyecto = await Proyecto.getById(id);
        res.json(updatedProyecto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar proyecto' });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Proyecto.getById(id);
        if (!existing) return res.status(404).json({ message: 'Proyecto no encontrado' });
        const deleted = await Proyecto.delete(id);
        if (!deleted) return res.status(400).json({ message: 'No se pudo eliminar' });
        res.json({ message: 'Proyecto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar proyecto' });
    }
};

const getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.getAll();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

module.exports = { index, show, store, update, destroy, getClientes };