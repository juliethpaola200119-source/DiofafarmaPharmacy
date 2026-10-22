/**
 * Rutas de la API de Ventas
 * Módulo: Routes / VentaRoutes
 *
 * Base path: /api/ventas
 *
 * GET    /            → Listar ventas
 * GET    /codigo/:cod → Obtener venta por su código (para Reportes)
 * GET    /:id         → Obtener venta por su ID con items
 * POST   /            → Registrar nueva venta (con cálculo de IVA y decremento de stock)
 * PUT    /:id/anular  → Anular venta y reintegrar stock
 * DELETE /:id         → Eliminar registro de venta
 */

const express         = require("express");
const router          = express.Router();
const ventaController = require("../controllers/ventaController");
const authMiddleware  = require("../middleware/authMiddleware");

// Protección con token JWT en todas las rutas de ventas
router.use(authMiddleware);

router.get("/codigo/:codigo", ventaController.obtenerVentaPorCodigo.bind(ventaController));
router.get("/:id",            ventaController.obtenerVentaPorId.bind(ventaController));
router.get("/",               ventaController.obtenerVentas.bind(ventaController));
router.post("/",              ventaController.crearVenta.bind(ventaController));
router.put("/:id/anular",     ventaController.anularVenta.bind(ventaController));
router.delete("/:id",         ventaController.eliminarVenta.bind(ventaController));

module.exports = router;
