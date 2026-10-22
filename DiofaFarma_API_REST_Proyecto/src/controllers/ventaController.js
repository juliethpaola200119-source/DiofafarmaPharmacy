/**
 * Controlador de Ventas
 * Módulo: Controllers / VentaController
 *
 * Expone endpoints REST para:
 *   GET    /api/ventas             → listar ventas (opcional ?busqueda=...)
 *   GET    /api/ventas/:id         → detalle de venta por ID
 *   GET    /api/ventas/codigo/:cod → detalle de venta por código (para Reportes)
 *   POST   /api/ventas             → registrar venta
 *   PUT    /api/ventas/:id/anular  → anular venta y retornar stock
 *   DELETE /api/ventas/:id         → eliminar registro de venta
 */

const ventaService = require("../services/ventaService");

class VentaController {
  async obtenerVentas(req, res, next) {
    try {
      const { busqueda } = req.query;
      const ventas = await ventaService.listarVentas(busqueda);
      return res.status(200).json({
        success: true,
        message: "Ventas obtenidas correctamente",
        total: ventas.length,
        data: ventas
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async obtenerVentaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const venta = await ventaService.obtenerVentaPorId(id);
      return res.status(200).json({
        success: true,
        message: "Venta encontrada",
        data: venta
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async obtenerVentaPorCodigo(req, res, next) {
    try {
      const { codigo } = req.params;
      const venta = await ventaService.obtenerVentaPorCodigo(codigo);
      return res.status(200).json({
        success: true,
        message: "Venta recuperada por código",
        data: venta
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async crearVenta(req, res, next) {
    try {
      const usuarioId = req.user ? req.user.id : null;
      const nuevaVenta = await ventaService.crearVenta(req.body, usuarioId);
      return res.status(201).json({
        success: true,
        message: `Venta ${nuevaVenta.codigo} registrada con éxito`,
        data: nuevaVenta
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async anularVenta(req, res, next) {
    try {
      const { id } = req.params;
      const ventaAnulada = await ventaService.anularVenta(id);
      return res.status(200).json({
        success: true,
        message: `Venta ${ventaAnulada.codigo} anulada y stock devuelto a inventario`,
        data: ventaAnulada
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async eliminarVenta(req, res, next) {
    try {
      const { id } = req.params;
      await ventaService.eliminarVenta(id);
      return res.status(200).json({
        success: true,
        message: "Registro de venta eliminado correctamente"
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new VentaController();
