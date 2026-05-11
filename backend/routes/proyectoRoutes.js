const express = require('express');
const router = express.Router();
const proyectoController = require('../controllers/proyectoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', proyectoController.index);
router.get('/clientes', proyectoController.getClientes);
router.get('/:id', proyectoController.show);
router.post('/', proyectoController.store);
router.put('/:id', proyectoController.update);
router.delete('/:id', proyectoController.destroy);

module.exports = router;