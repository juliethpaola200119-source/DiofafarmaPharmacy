/**
 * Hook personalizado: useUsuarios
 *
 * Gestiona el estado y las operaciones CRUD de usuarios.
 * Consume el usuarioService que conecta con la REST API → MySQL.
 * Sigue el mismo patrón que useProductos.js.
 */

import { useState, useEffect, useCallback } from 'react';
import * as usuarioService from '../services/usuarioService';

/**
 * @returns {Object} Estado y métodos del módulo de usuarios
 */
const useUsuarios = () => {
  const [usuarios, setUsuarios]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Limpiar mensaje de éxito después de 4 segundos
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  /**
   * Carga todos los usuarios desde la API.
   */
  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el hook
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  /**
   * Crea un nuevo usuario.
   * @param {Object} datosUsuario
   * @returns {Promise<Object>} Usuario creado
   */
  const crearUsuario = useCallback(async (datosUsuario) => {
    setLoading(true);
    setError(null);
    try {
      const nuevo = await usuarioService.crearUsuario(datosUsuario);
      setUsuarios((prev) => [nuevo, ...prev]);
      setSuccessMsg('Usuario creado correctamente');
      return nuevo;
    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un usuario existente.
   * @param {number|string} id
   * @param {Object} datosUsuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  const actualizarUsuario = useCallback(async (id, datosUsuario) => {
    setLoading(true);
    setError(null);
    try {
      const actualizado = await usuarioService.actualizarUsuario(id, datosUsuario);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === Number(id) ? actualizado : u))
      );
      setSuccessMsg('Usuario actualizado correctamente');
      return actualizado;
    } catch (err) {
      setError(err.message || 'Error al actualizar el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un usuario por su ID.
   * @param {number|string} id
   */
  const eliminarUsuario = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await usuarioService.eliminarUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== Number(id)));
      setSuccessMsg('Usuario eliminado correctamente');
    } catch (err) {
      setError(err.message || 'Error al eliminar el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpia el mensaje de error manualmente.
   */
  const limpiarError = useCallback(() => setError(null), []);

  return {
    usuarios,
    loading,
    error,
    successMsg,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    limpiarError
  };
};

export default useUsuarios;
