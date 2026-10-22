/**
 * Servicio de Gestión de Ventas
 * Módulo: Services / ventaService
 *
 * Conecta con el endpoint /api/ventas del backend Node.js.
 */

import { httpClient } from './api';

export const ventaService = {
  /**
   * Obtiene la lista de ventas.
   * @param {string} [busqueda]
   */
  obtenerVentas: async (busqueda = '') => {
    const q = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : '';
    const response = await httpClient(`/ventas${q}`, { method: 'GET' });
    return response?.data ?? [];
  },

  /**
   * Obtiene el detalle de una venta por su ID.
   * @param {number|string} id
   */
  obtenerVentaPorId: async (id) => {
    const response = await httpClient(`/ventas/${id}`, { method: 'GET' });
    return response?.data ?? response;
  },

  /**
   * Obtiene el detalle de una venta por su CÓDIGO (usado por Reportes).
   * @param {string} codigo
   */
  obtenerVentaPorCodigo: async (codigo) => {
    const response = await httpClient(`/ventas/codigo/${encodeURIComponent(codigo)}`, { method: 'GET' });
    return response?.data ?? response;
  },

  /**
   * Registra una nueva venta.
   * @param {Object} venta - { clienteId, tipoPago, observaciones, items: [{ productoId, cantidad, precioUnitario, tasaIva }] }
   */
  crearVenta: async (venta) => {
    const response = await httpClient('/ventas', {
      method: 'POST',
      body: JSON.stringify(venta),
    });
    return response?.data ?? response;
  },

  /**
   * Anula una venta.
   * @param {number|string} id
   */
  anularVenta: async (id) => {
    const response = await httpClient(`/ventas/${id}/anular`, { method: 'PUT' });
    return response?.data ?? response;
  },

  /**
   * Elimina un registro de venta.
   * @param {number|string} id
   */
  eliminarVenta: async (id) => {
    await httpClient(`/ventas/${id}`, { method: 'DELETE' });
    return true;
  },
};
