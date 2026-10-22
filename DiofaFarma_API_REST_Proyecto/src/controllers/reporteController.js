/**
 * Controlador: Módulo de Reportes
 *
 * Maneja las solicitudes HTTP para los endpoints del módulo de reportes.
 * Delega la lógica de negocio al reporteService y unifica el formato de respuesta.
 *
 * Endpoints:
 *   GET /api/reportes/resumen           → getResumen
 *   GET /api/reportes/stock-bajo        → getStockBajo   (query: ?umbral=10)
 *   GET /api/reportes/productos-activos → getProductosActivos
 */

const reporteService = require('../services/reporteService');

/**
 * GET /api/reportes/resumen
 * Devuelve un objeto con los totales generales del sistema.
 */
const getResumen = async (req, res, next) => {
  try {
    const data = await reporteService.getResumen();
    return res.status(200).json({
      success: true,
      message: 'Resumen generado correctamente',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reportes/stock-bajo?umbral=10
 * Devuelve los productos con stock menor o igual al umbral indicado.
 */
const getStockBajo = async (req, res, next) => {
  try {
    const umbral = parseInt(req.query.umbral, 10) || 10;
    const data   = await reporteService.getStockBajo(umbral);
    return res.status(200).json({
      success: true,
      message: `Reporte de stock crítico (umbral ≤ ${umbral}) generado correctamente`,
      total: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reportes/productos-activos
 * Devuelve el catálogo de productos activos con precios de compra y venta.
 */
const getProductosActivos = async (req, res, next) => {
  try {
    const data = await reporteService.getProductosActivos();
    return res.status(200).json({
      success: true,
      message: 'Catálogo de productos activos generado correctamente',
      total: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResumen,
  getStockBajo,
  getProductosActivos,
};
