/**
 * Rutas de Productos
 * Módulo: Routes / ProductoRoutes
 * 
 * Define los endpoints REST para la gestión de productos (CRUD completo).
 * Mapea las operaciones HTTP a los métodos del ProductoController.
 */

const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");

// GET /api/productos - Listar todos los productos
router.get("/", (req, res, next) => productoController.listar(req, res, next));

// GET /api/productos/:id - Obtener un producto por ID
router.get("/:id", (req, res, next) => productoController.obtenerPorId(req, res, next));

// POST /api/productos - Crear un nuevo producto
router.post("/", (req, res, next) => productoController.crear(req, res, next));

// PUT /api/productos/:id - Actualizar un producto existente por ID
router.put("/:id", (req, res, next) => productoController.actualizar(req, res, next));

// DELETE /api/productos/:id - Eliminar un producto por ID
router.delete("/:id", (req, res, next) => productoController.eliminar(req, res, next));

module.exports = router;
