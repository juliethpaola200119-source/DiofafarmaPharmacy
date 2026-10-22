/**
 * Controlador de Autenticación
 * Módulo: Controllers / AuthController
 *
 * Gestiona las peticiones HTTP entrantes para registro y autenticación de usuarios.
 * Recibe req y res, delega la lógica de negocio al AuthService y formatea la respuesta JSON estándar.
 * Ahora utiliza async/await porque AuthService opera sobre MySQL.
 */

const authService = require("../services/authService");

class AuthController {
  /**
   * Endpoint: POST /api/auth/register
   * Registra un nuevo usuario en el sistema.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async register(req, res, next) {
    try {
      const { usuario, password } = req.body;
      const nuevoUsuario = await authService.registrarUsuario({ usuario, password });

      return res.status(201).json({
        success: true,
        message: "Usuario registrado correctamente",
        data: nuevoUsuario
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Endpoint: POST /api/auth/login
   * Autentica las credenciales de un usuario existente.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async login(req, res, next) {
    try {
      const { usuario, password } = req.body;
      const usuarioAutenticado = await authService.autenticarUsuario({ usuario, password });

      return res.status(200).json({
        success: true,
        message: "Autenticación exitosa",
        data: usuarioAutenticado
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
