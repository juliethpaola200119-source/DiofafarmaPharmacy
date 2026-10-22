/**
 * Controlador de Usuarios
 * Módulo: Controllers / UsuarioController
 *
 * Gestiona las peticiones HTTP entrantes para el ciclo de vida CRUD de usuarios.
 * Valida parámetros de la solicitud y delega la lógica de negocio al UsuarioService.
 * Utiliza async/await porque UsuarioService opera sobre MySQL.
 * Las respuestas siempre siguen el formato estándar: { success, message, data? }
 */

const usuarioService = require("../services/usuarioService");

class UsuarioController {
  /**
   * Endpoint: GET /api/usuarios
   * Retorna el listado completo de usuarios (sin campo password).
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async obtenerUsuarios(req, res, next) {
    try {
      const usuarios = await usuarioService.listarUsuarios();

      return res.status(200).json({
        success: true,
        message: "Usuarios obtenidos correctamente",
        data: usuarios
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
   * Endpoint: GET /api/usuarios/:id
   * Retorna un usuario específico por su ID (sin campo password).
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async obtenerUsuarioPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.obtenerUsuarioPorId(id);

      return res.status(200).json({
        success: true,
        message: "Usuario encontrado",
        data: usuario
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
   * Endpoint: POST /api/usuarios
   * Registra un nuevo usuario con los datos del body JSON.
   *
   * Body esperado: { usuario, email, password, rol, estado }
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async crearUsuario(req, res, next) {
    try {
      const datosUsuario = req.body;
      const nuevoUsuario = await usuarioService.crearUsuario(datosUsuario);

      return res.status(201).json({
        success: true,
        message: "Usuario creado correctamente",
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
   * Endpoint: PUT /api/usuarios/:id
   * Actualiza los datos de un usuario existente.
   * Si se incluye `password` en el body, se hashea y reemplaza.
   *
   * Body esperado: { usuario, email, password?, rol, estado }
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async actualizarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const datosUsuario = req.body;
      const usuarioActualizado = await usuarioService.actualizarUsuario(id, datosUsuario);

      return res.status(200).json({
        success: true,
        message: "Usuario actualizado correctamente",
        data: usuarioActualizado
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
   * Endpoint: DELETE /api/usuarios/:id
   * Elimina un usuario de la base de datos por su ID.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async eliminarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      await usuarioService.eliminarUsuario(id);

      return res.status(200).json({
        success: true,
        message: "Usuario eliminado correctamente"
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

module.exports = new UsuarioController();
