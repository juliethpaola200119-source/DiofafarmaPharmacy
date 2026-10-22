/**
 * Rutas: Módulo de Reportes
 *
 * Base path: /api/reportes
 *
 * GET /resumen           → Resumen general del sistema (totales)
 * GET /stock-bajo        → Productos con stock ≤ ?umbral (default 10)
 * GET /productos-activos → Catálogo de productos activos con precios
 *
 * Todas las rutas requieren token JWT válido (verifyToken).
 */

const express        = require('express');
const router         = express.Router();
const reporteController = require('../controllers/reporteController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar autenticación JWT a todas las rutas de este módulo
router.use(authMiddleware);

router.get('/resumen',           reporteController.getResumen);
router.get('/stock-bajo',        reporteController.getStockBajo);
router.get('/productos-activos', reporteController.getProductosActivos);

module.exports = router;
