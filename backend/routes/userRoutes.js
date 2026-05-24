const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de perfil (para cualquier usuario autenticado)
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Rutas de administración (solo admin)
router.use(authorize('admin'));
router.get('/', userController.index);
router.post('/', userController.store);
router.put('/:id', userController.update);
router.delete('/:id', userController.destroy);

module.exports = router;