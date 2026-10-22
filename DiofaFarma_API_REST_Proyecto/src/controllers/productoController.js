/**
 * Controlador de Productos
 * Módulo: Controllers / ProductoController
 *
 * Gestiona las peticiones HTTP entrantes para el ciclo de vida CRUD de productos.
 * Valida parámetros de la solicitud y delega la lógica de negocio al ProductoService.
 * Ahora utiliza async/await porque ProductoService opera sobre MySQL.
 */

const productoService = require("../services/productoService");

class ProductoController {
  /**
   * Endpoint: GET /api/productos
   * Retorna el listado completo de productos desde MySQL.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async listar(req, res, next) {
    try {
      const productos = await productoService.listarProductos();

      return res.status(200).json({
        success: true,
        message: "Productos obtenidos correctamente",
        data: productos
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
   * Endpoint: GET /api/productos/:id
   * Consulta un producto específico a partir de su ID.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await productoService.obtenerProductoPorId(id);

      return res.status(200).json({
        success: true,
        message: "Producto encontrado",
        data: producto
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
   * Endpoint: POST /api/productos
   * Crea un nuevo registro de producto con los datos del cuerpo JSON.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async crear(req, res, next) {
    try {
      const datosProducto = req.body;
      const nuevoProducto = await productoService.crearProducto(datosProducto);

      return res.status(201).json({
        success: true,
        message: "Producto creado correctamente",
        data: nuevoProducto
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
   * Endpoint: PUT /api/productos/:id
   * Actualiza los datos de un producto existente.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const datosProducto = req.body;
      const productoActualizado = await productoService.actualizarProducto(id, datosProducto);

      return res.status(200).json({
        success: true,
        message: "Producto actualizado correctamente",
        data: productoActualizado
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
   * Endpoint: DELETE /api/productos/:id
   * Elimina un producto por su ID.
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await productoService.eliminarProducto(id);

      return res.status(200).json({
        success: true,
        message: "Producto eliminado correctamente"
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

module.exports = new ProductoController();
