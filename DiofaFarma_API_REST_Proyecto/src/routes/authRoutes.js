/**
 * Rutas de Autenticación
 * Módulo: Routes / AuthRoutes
 * 
 * Define los endpoints para el registro y autenticación de usuarios.
 * Mapea las rutas HTTP a los métodos correspondientes del AuthController.
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", (req, res, next) => authController.register(req, res, next));

// POST /api/auth/login - Autenticar usuario existente
router.post("/login", (req, res, next) => authController.login(req, res, next));

module.exports = router;
