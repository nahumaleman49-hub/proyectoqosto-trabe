const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// CRUD proveedores
router.get('/', proveedorController.index);
router.get('/materiales', proveedorController.getMateriales);   // para selects
router.get('/servicios', proveedorController.getServicios);     // para selects
router.post('/', proveedorController.store);
router.get('/:id', proveedorController.show);
router.put('/:id', proveedorController.update);
router.delete('/:id', proveedorController.destroy);

// Vinculaciones (siguiendo el estilo de Laravel)
router.post('/vincular-material', proveedorController.vincularMaterial);
router.delete('/desvincular-material/:proveedorId/:materialId', proveedorController.desvincularMaterial);
router.post('/vincular-servicio', proveedorController.vincularServicio);
router.delete('/desvincular-servicio/:proveedorId/:servicioId', proveedorController.desvincularServicio);

module.exports = router;