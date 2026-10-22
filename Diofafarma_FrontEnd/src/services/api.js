/**
 * Configuración centralizada del cliente HTTP para DioFaFarma.
 *
 * Apunta a la REST API Node.js/Express en http://localhost:3000/api
 * Maneja automáticamente el token JWT almacenado en sessionStorage.
 */

// URL base del backend Node.js / Express
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Clave de sesión en sessionStorage (debe coincidir con AppContext)
const SESSION_KEY = 'diofafarma_session';

/**
 * Obtiene el token JWT de la sesión activa.
 * @returns {string|null}
 */
export const getToken = () => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const sesion = JSON.parse(stored);
      return sesion?.token || null;
    }
  } catch {
    // Silenciar error de parseo
  }
  return null;
};

/**
 * Cliente HTTP base para realizar peticiones JSON a la REST API Node.js.
 * Inyecta automáticamente el header Authorization si hay sesión activa.
 *
 * @param {string} endpoint - Ruta relativa, ej: '/usuarios'
 * @param {RequestInit} options - Opciones de fetch (method, headers, body)
 * @returns {Promise<any>} Respuesta JSON parseada
 */
export const httpClient = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        // Respuesta sin cuerpo JSON
      }
      throw new Error(errorMessage);
    }

    // Si la respuesta no tiene contenido (ej. HTTP 204 No Content)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${url}:`, error);
    throw error;
  }
};
