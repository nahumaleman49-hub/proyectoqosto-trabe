const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');

// const authMiddleware = require('../middleware/authMiddleware');
// router.use(authMiddleware);

// Datos para selects
router.get('/clientes', cotizacionController.getClientes);
router.get('/proyectos', cotizacionController.getProyectos);
router.get('/categorias-materiales', cotizacionController.getCategoriasMateriales);
router.get('/categorias-servicios', cotizacionController.getCategoriasServicios);
router.get('/materiales-por-categoria/:catId', cotizacionController.getMaterialesPorCategoria);
router.get('/proveedores-por-material/:matId', cotizacionController.getProveedoresPorMaterial);
router.get('/servicios-por-categoria/:catId', cotizacionController.getServiciosPorCategoria);
router.get('/proveedores-por-servicio/:servId', cotizacionController.getProveedoresPorServicio);


// CRUD
router.get('/', cotizacionController.index);
router.post('/', cotizacionController.store);
router.get('/:id', cotizacionController.show);
router.put('/:id', cotizacionController.update);
router.delete('/:id', cotizacionController.destroy);


module.exports = router;