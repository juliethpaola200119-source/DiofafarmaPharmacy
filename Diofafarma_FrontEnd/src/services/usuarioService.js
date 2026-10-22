/**
 * Servicio de Gestión de Usuarios
 * Módulo: Services / usuarioService
 *
 * Centraliza las llamadas HTTP al endpoint /api/usuarios de la REST API Node.js.
 * NO contiene JSX, componentes ni lógica visual.
 * Todos los datos provienen directamente de la base de datos MySQL.
 *
 * La API responde con el formato estándar:
 *   { success: boolean, message: string, data: Object|Array }
 */

import { httpClient } from './api';

/**
 * Mapea un usuario proveniente del backend al formato esperado por React.
 * @param {Object} item - Objeto usuario del backend
 * @returns {Object} Usuario normalizado
 */
const mapFromBackend = (item) => ({
  id:        item.id,
  usuario:   item.usuario   || '',
  email:     item.email     || '',
  rol:       item.rol       || 'Cajero',
  estado:    item.estado === true || item.estado === 1 || item.estado === '1',
  creadoEn:  item.creadoEn  || null
});

/**
 * Obtiene la lista completa de usuarios desde la API.
 * @returns {Promise<Array>} Lista de usuarios
 */
export const obtenerUsuarios = async () => {
  const response = await httpClient('/usuarios', { method: 'GET' });
  const lista = response?.data ?? response;
  return Array.isArray(lista) ? lista.map(mapFromBackend) : [];
};

/**
 * Obtiene un usuario individual por su ID.
 * @param {number|string} id
 * @returns {Promise<Object>} Usuario encontrado
 */
export const obtenerUsuarioPorId = async (id) => {
  const response = await httpClient(`/usuarios/${id}`, { method: 'GET' });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Crea un nuevo usuario en el sistema.
 * @param {Object} usuario - { usuario, email, password, rol, estado }
 * @returns {Promise<Object>} Usuario creado con su ID generado
 */
export const crearUsuario = async (usuario) => {
  const response = await httpClient('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      usuario:  usuario.usuario,
      email:    usuario.email    || '',
      password: usuario.password,
      rol:      usuario.rol      || 'Cajero',
      estado:   usuario.estado !== false ? true : false
    })
  });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Actualiza los datos de un usuario existente.
 * Si se proporciona password, se enviará para ser hasheada en el backend.
 * @param {number|string} id
 * @param {Object} usuario - { usuario, email, password?, rol, estado }
 * @returns {Promise<Object>} Usuario actualizado
 */
export const actualizarUsuario = async (id, usuario) => {
  const payload = {
    usuario:  usuario.usuario,
    email:    usuario.email    || '',
    rol:      usuario.rol      || 'Cajero',
    estado:   usuario.estado !== false ? true : false
  };

  // Solo incluir password si se proporcionó una nueva
  if (usuario.password && usuario.password.trim() !== '') {
    payload.password = usuario.password;
  }

  const response = await httpClient(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  const item = response?.data ?? response;
  return mapFromBackend(item);
};

/**
 * Elimina un usuario por su ID.
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export const eliminarUsuario = async (id) => {
  await httpClient(`/usuarios/${id}`, { method: 'DELETE' });
  return true;
};
