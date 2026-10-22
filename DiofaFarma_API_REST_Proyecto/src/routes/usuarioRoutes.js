/**
 * Rutas de Usuarios
 * Módulo: Routes / UsuarioRoutes
 *
 * Define los endpoints REST para la gestión de usuarios (CRUD completo).
 * Todas las rutas están protegidas con el middleware de autenticación JWT.
 * Mapea las operaciones HTTP a los métodos del UsuarioController.
 *
 * Base path: /api/usuarios
 */

const express           = require("express");
const router            = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authMiddleware    = require("../middleware/authMiddleware");

// Proteger todas las rutas de usuarios con JWT
router.use(authMiddleware);

// GET /api/usuarios        - Listar todos los usuarios
router.get("/", (req, res, next) => usuarioController.obtenerUsuarios(req, res, next));

// GET /api/usuarios/:id    - Obtener un usuario por ID
router.get("/:id", (req, res, next) => usuarioController.obtenerUsuarioPorId(req, res, next));

// POST /api/usuarios       - Crear un nuevo usuario
router.post("/", (req, res, next) => usuarioController.crearUsuario(req, res, next));

// PUT /api/usuarios/:id    - Actualizar un usuario existente
router.put("/:id", (req, res, next) => usuarioController.actualizarUsuario(req, res, next));

// DELETE /api/usuarios/:id - Eliminar un usuario por ID
router.delete("/:id", (req, res, next) => usuarioController.eliminarUsuario(req, res, next));

module.exports = router;
