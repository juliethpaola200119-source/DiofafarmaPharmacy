/**
 * Rutas de la API de Clientes
 * Módulo: Routes / ClienteRoutes
 *
 * Base path: /api/clientes
 *
 * GET    /          → Listar clientes
 * GET    /:id       → Obtener cliente por ID
 * POST   /          → Crear cliente
 * PUT    /:id       → Actualizar cliente
 * DELETE /:id       → Eliminar cliente
 *
 * Requiere autenticación JWT en todas las rutas.
 */

const express           = require("express");
const router            = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware    = require("../middleware/authMiddleware");

// Protección con token JWT
router.use(authMiddleware);

router.get("/",     clienteController.obtenerClientes.bind(clienteController));
router.get("/:id",  clienteController.obtenerClientePorId.bind(clienteController));
router.post("/",    clienteController.crearCliente.bind(clienteController));
router.put("/:id",  clienteController.actualizarCliente.bind(clienteController));
router.delete("/:id", clienteController.eliminarCliente.bind(clienteController));

module.exports = router;
