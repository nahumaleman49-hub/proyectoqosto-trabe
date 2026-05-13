const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// CRUD materiales
router.get('/', materialController.index);
router.get('/categorias', materialController.getCategorias);
router.get('/proveedores', materialController.getProveedoresMateriales);
router.post('/', materialController.store);
router.get('/:id', materialController.show);
router.put('/:id', materialController.update);
router.delete('/:id', materialController.destroy);

// Vinculación con proveedores
router.post('/vincular-proveedor', materialController.vincularProveedor);
router.delete('/desvincular-proveedor/:materialId/:proveedorId', materialController.desvincularProveedor);

// Creación rápida (AJAX)
router.post('/guardar-rapido', materialController.storeRapido);

module.exports = router;