/**
 * Middleware de Autenticación JWT
 * Módulo: Middleware / AuthMiddleware
 *
 * Verifica que la petición entrante lleve un token JWT válido
 * en el header Authorization: Bearer <token>.
 * Si el token es válido, adjunta los datos del usuario a req.user.
 * Si no es válido o no existe, responde con 401 Unauthorized.
 */

require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "diofafarma_secret_key_2024";

/**
 * Middleware de verificación de token JWT.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado: se requiere token de autorización"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, usuario, rol }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado"
    });
  }
};

module.exports = authMiddleware;
