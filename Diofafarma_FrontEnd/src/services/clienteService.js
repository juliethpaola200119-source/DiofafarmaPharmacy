/**
 * Servicio de Gestión de Clientes
 * Módulo: Services / clienteService
 *
 * Centraliza las llamadas HTTP al endpoint /api/clientes de la REST API Node.js.
 * Utiliza httpClient (fetch nativo con JWT automático).
 *
 * La API responde con: { success, message, data? }
 */

import { httpClient } from './api';

/**
 * Mapea un cliente proveniente del backend (camelCase).
 * @param {Object} item
 * @returns {Object}
 */
const mapFromBackend = (item) => ({
  id:            item.id,
  tipoDocumento: item.tipoDocumento || 'CC',
  documento:     item.documento     || '',
  nombre:        item.nombre        || '',
  apellido:      item.apellido      || '',
  telefono:      item.telefono      || '',
  email:         item.email         || '',
  direccion:     item.direccion     || '',
  estado:        item.estado === true || item.estado === 1 || item.estado === '1',
  creadoEn:      item.creadoEn      || null,
  actualizadoEn: item.actualizadoEn || null,
});

/**
 * Obtiene la lista completa de clientes, opcionalmente filtrados.
 * @param {string} [busqueda]
 * @returns {Promise<Array>}
 */
export const obtenerClientes = async (busqueda = '') => {
  const query = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : '';
  const response = await httpClient(`/clientes${query}`, { method: 'GET' });
  const lista = response?.data ?? response;
  return Array.isArray(lista) ? lista.map(mapFromBackend) : [];
};

/**
 * Obtiene un cliente por su ID.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const obtenerClientePorId = async (id) => {
  const response = await httpClient(`/clientes/${id}`, { method: 'GET' });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Crea un nuevo cliente.
 * @param {Object} cliente
 * @returns {Promise<Object>}
 */
export const crearCliente = async (cliente) => {
  const response = await httpClient('/clientes', {
    method: 'POST',
    body: JSON.stringify(cliente),
  });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Actualiza un cliente existente.
 * @param {number|string} id
 * @param {Object} cliente
 * @returns {Promise<Object>}
 */
export const actualizarCliente = async (id, cliente) => {
  const response = await httpClient(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cliente),
  });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Elimina un cliente por su ID.
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export const eliminarCliente = async (id) => {
  await httpClient(`/clientes/${id}`, { method: 'DELETE' });
  return true;
};
