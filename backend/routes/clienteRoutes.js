const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación (JWT)
router.use(authMiddleware);

router.get('/', clienteController.index);
router.get('/:id', clienteController.show);
router.post('/', clienteController.store);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.destroy);

module.exports = router;