/**
 * Hook personalizado: useClientes
 *
 * Maneja el estado reactivo y operaciones CRUD de clientes.
 * Se conecta con clienteService.
 */

import { useState, useEffect, useCallback } from 'react';
import * as clienteService from '../services/clienteService';

const useClientes = () => {
  const [clientes, setClientes]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Auto-limpiar mensaje de éxito
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  /**
   * Carga los clientes desde la API.
   */
  const cargarClientes = useCallback(async (busqueda = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteService.obtenerClientes(busqueda);
      setClientes(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  /**
   * Registrar cliente.
   */
  const crearCliente = useCallback(async (datos) => {
    setLoading(true);
    setError(null);
    try {
      const nuevo = await clienteService.crearCliente(datos);
      setClientes((prev) => [nuevo, ...prev]);
      setSuccessMsg(`Cliente "${nuevo.nombre} ${nuevo.apellido}".trim() registrado con éxito`);
      return nuevo;
    } catch (err) {
      setError(err.message || 'Error al registrar el cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar cliente.
   */
  const actualizarCliente = useCallback(async (id, datos) => {
    setLoading(true);
    setError(null);
    try {
      const actualizado = await clienteService.actualizarCliente(id, datos);
      setClientes((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
      setSuccessMsg(`Cliente "${actualizado.nombre}" actualizado correctamente`);
      return actualizado;
    } catch (err) {
      setError(err.message || 'Error al actualizar el cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar cliente.
   */
  const eliminarCliente = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await clienteService.eliminarCliente(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
      setSuccessMsg('Cliente eliminado del sistema con éxito');
      return true;
    } catch (err) {
      setError(err.message || 'Error al eliminar el cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clientes,
    loading,
    error,
    successMsg,
    cargarClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    limpiarError: () => setError(null),
    limpiarSuccess: () => setSuccessMsg(null),
  };
};

export default useClientes;
