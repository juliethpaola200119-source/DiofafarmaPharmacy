/**
 * Servicio: reporteService
 *
 * Capa de acceso a datos para el Módulo de Reportes de DioFaFarma.
 * Usa httpClient (fetch nativo con JWT) igual que el resto de servicios del proyecto.
 *
 * Endpoints del backend:
 *   GET /api/reportes/resumen           → Resumen general del sistema
 *   GET /api/reportes/stock-bajo        → Productos con stock ≤ umbral (def. 10)
 *   GET /api/reportes/productos-activos → Catálogo de productos activos con precios
 */

import { httpClient } from './api';

export const reporteService = {
  /**
   * Obtiene el resumen general: totales de productos, usuarios, stock.
   * @returns {Promise<Object>} { totalProductos, productosActivos, productosStockBajo, totalUsuarios }
   */
  getResumen: async () => {
    const response = await httpClient('/reportes/resumen', { method: 'GET' });
    return response?.data ?? response;
  },

  /**
   * Obtiene los productos con stock bajo o agotado.
   * @param {number} umbral - Límite de stock para considerar crítico (por defecto 10).
   * @returns {Promise<Array>} Lista de productos con stock ≤ umbral.
   */
  getStockBajo: async (umbral = 10) => {
    const response = await httpClient(`/reportes/stock-bajo?umbral=${umbral}`, { method: 'GET' });
    return response?.data ?? [];
  },

  /**
   * Obtiene el catálogo completo de productos activos con precios de compra y venta.
   * @returns {Promise<Array>} Lista de productos activos.
   */
  getProductosActivos: async () => {
    const response = await httpClient('/reportes/productos-activos', { method: 'GET' });
    return response?.data ?? [];
  },
};

