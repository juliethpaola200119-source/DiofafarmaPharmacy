/**
 * Controlador de Clientes
 * Módulo: Controllers / ClienteController
 *
 * Maneja las peticiones HTTP para el ciclo de vida CRUD de clientes.
 * Respuestas estándar: { success: boolean, message: string, data?: any }
 */

const clienteService = require("../services/clienteService");

class ClienteController {
  /**
   * GET /api/clientes
   */
  async obtenerClientes(req, res, next) {
    try {
      const { busqueda } = req.query;
      const clientes = await clienteService.listarClientes(busqueda);

      return res.status(200).json({
        success: true,
        message: "Clientes obtenidos correctamente",
        total: clientes.length,
        data: clientes
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
   * GET /api/clientes/:id
   */
  async obtenerClientePorId(req, res, next) {
    try {
      const { id } = req.params;
      const cliente = await clienteService.obtenerClientePorId(id);

      return res.status(200).json({
        success: true,
        message: "Cliente encontrado",
        data: cliente
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
   * POST /api/clientes
   */
  async crearCliente(req, res, next) {
    try {
      const nuevoCliente = await clienteService.crearCliente(req.body);

      return res.status(201).json({
        success: true,
        message: "Cliente registrado con éxito",
        data: nuevoCliente
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
   * PUT /api/clientes/:id
   */
  async actualizarCliente(req, res, next) {
    try {
      const { id } = req.params;
      const clienteActualizado = await clienteService.actualizarCliente(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Cliente actualizado con éxito",
        data: clienteActualizado
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
   * DELETE /api/clientes/:id
   */
  async eliminarCliente(req, res, next) {
    try {
      const { id } = req.params;
      await clienteService.eliminarCliente(id);

      return res.status(200).json({
        success: true,
        message: "Cliente eliminado correctamente"
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

module.exports = new ClienteController();
