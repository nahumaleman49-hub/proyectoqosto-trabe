const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// CRUD servicios
router.get('/', servicioController.index);
router.get('/categorias', servicioController.getCategorias);
router.get('/proveedores', servicioController.getProveedoresServicios);
router.post('/', servicioController.store);
router.get('/:id', servicioController.show);
router.put('/:id', servicioController.update);
router.delete('/:id', servicioController.destroy);

// Vinculación con proveedores
router.post('/vincular-proveedor', servicioController.vincularProveedor);
router.delete('/desvincular-proveedor/:servicioId/:proveedorId', servicioController.desvincularProveedor);

module.exports = router;