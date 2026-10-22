/**
 * Servicio de Autenticación
 * Módulo: Services / authService
 *
 * Centraliza las llamadas HTTP al endpoint de autenticación de la REST API Node.js.
 * El login retorna { id, usuario, email, rol, estado, token } desde el backend.
 */

import { httpClient } from './api';

/**
 * Realiza el login contra la REST API → MySQL
 * @param {string} usuario
 * @param {string} password
 * @returns {Promise<Object>} { id, usuario, email, rol, estado, token }
 */
export const login = async (usuario, password) => {
  const response = await httpClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usuario, password })
  });
  // La API responde: { success: true, message: '...', data: { id, usuario, email, rol, estado, token } }
  return response?.data ?? response;
};

/**
 * Realiza el registro de un nuevo usuario contra la REST API → MySQL
 * @param {string} usuario
 * @param {string} password
 * @returns {Promise<Object>} { id, usuario }
 */
export const register = async (usuario, password) => {
  const response = await httpClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ usuario, password })
  });
  return response?.data ?? response;
};
