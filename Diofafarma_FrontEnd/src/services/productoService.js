/**
 * Servicio exclusivo para las operaciones de Productos en DioFaFarma.
 *
 * Centraliza las llamadas HTTP al endpoint /api/productos de la REST API Node.js → MySQL.
 * NO contiene JSX, componentes ni lógica visual.
 * Todos los datos persisten directamente en la base de datos MySQL.
 *
 * La API responde con el formato estándar:
 *   { success: boolean, message: string, data: Object|Array }
 *
 * NOTA DE MAPEO:
 *   MySQL usa snake_case  (precio_compra, precio_venta) → backend lo convierte a camelCase
 *   React  usa camelCase  (precioCompra,  precioVenta)
 */

import { httpClient } from './api';

/**
 * Normaliza un producto proveniente de la API REST Node.js.
 * La API ya devuelve camelCase desde el mapper del backend,
 * pero mantenemos compatibilidad con snake_case por si acaso.
 */
const mapFromBackend = (item) => ({
  id:           item.id,
  codigo:       item.codigo,
  nombre:       item.nombre,
  descripcion:  item.descripcion  || '',
  laboratorio:  item.laboratorio  || '',
  precioCompra: Number(item.precioCompra ?? item.precio_compra ?? 0),
  precioVenta:  Number(item.precioVenta  ?? item.precio_venta  ?? 0),
  stock:        Number(item.stock ?? 0),
  estado:       item.estado === true || item.estado === 'true' || item.estado === 1 || item.estado === '1'
});

/**
 * Normaliza un producto de React para enviar a la REST API.
 * La API Node.js acepta camelCase.
 */
const mapToBackend = (producto) => ({
  codigo:       producto.codigo,
  nombre:       producto.nombre,
  descripcion:  producto.descripcion,
  laboratorio:  producto.laboratorio,
  precioCompra: Number(producto.precioCompra),
  precioVenta:  Number(producto.precioVenta),
  stock:        Number(producto.stock),
  estado:       Boolean(producto.estado)
});

/**
 * Obtiene la lista completa de productos desde la API REST → MySQL
 * @returns {Promise<Array>}
 */
export const obtenerProductos = async () => {
  const response = await httpClient('/productos', { method: 'GET' });
  const lista = response?.data ?? response;
  return Array.isArray(lista) ? lista.map(mapFromBackend) : [];
};

/**
 * Obtiene un producto individual por su ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const obtenerProductoPorId = async (id) => {
  const response = await httpClient(`/productos/${id}`, { method: 'GET' });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Registra un nuevo producto en el sistema
 * @param {Object} producto
 * @returns {Promise<Object>} Producto creado con su ID generado
 */
export const crearProducto = async (producto) => {
  const payload = mapToBackend(producto);
  const response = await httpClient('/productos', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Actualiza los datos de un producto existente
 * @param {number|string} id
 * @param {Object} producto
 * @returns {Promise<Object>}
 */
export const actualizarProducto = async (id, producto) => {
  const numericId = Number(id);
  const payload = mapToBackend({ ...producto, id: numericId });
  const response = await httpClient(`/productos/${numericId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Elimina un producto por su ID
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export const eliminarProducto = async (id) => {
  const numericId = Number(id);
  await httpClient(`/productos/${numericId}`, { method: 'DELETE' });
  return true;
};
