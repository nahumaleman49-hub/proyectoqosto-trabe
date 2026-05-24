// backend/controllers/userController.js
const User = require('../models/User');

const index = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

const store = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !password) return res.status(400).json({ message: 'Nombre y contraseña requeridos' });
        const existing = await User.findByName(name);
        if (existing) return res.status(409).json({ message: 'El nombre de usuario ya existe' });
        const newId = await User.create({ name, email, password, role });
        res.status(201).json({ id: newId, message: 'Usuario creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        await User.update(id, { name, email, role, password });
        res.json({ message: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;
        if (parseInt(id) === currentUserId) {
            return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
        }
        await User.delete(id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

const getProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, email, current_password, new_password } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        // Verificar contraseña actual si se cambia email o password
        if (email !== user.email || new_password) {
            const valid = await User.verifyPassword(current_password, user.password);
            if (!valid) return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }
        const updateData = { name, email, role: user.role };
        if (new_password) updateData.password = new_password;
        await User.update(id, updateData);
        res.json({ message: 'Perfil actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
};

module.exports = { index, store, update, destroy, getProfile, updateProfile };