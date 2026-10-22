/**
 * Hook: useVentas
 * Módulo: Hooks / useVentas
 *
 * Administra el estado reactivo del listado y operaciones de ventas.
 */

import { useState, useEffect, useCallback } from 'react';
import { ventaService } from '../services/ventaService';

const useVentas = () => {
  const [ventas, setVentas]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const cargarVentas = useCallback(async (busqueda = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await ventaService.obtenerVentas(busqueda);
      setVentas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const registrarVenta = useCallback(async (datosVenta) => {
    setLoading(true);
    setError(null);
    try {
      const nueva = await ventaService.crearVenta(datosVenta);
      setVentas((prev) => [nueva, ...prev]);
      setSuccessMsg(`Venta ${nueva.codigo} registrada con éxito`);
      return nueva;
    } catch (err) {
      setError(err.message || 'Error al registrar la venta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const anularVenta = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const anulada = await ventaService.anularVenta(id);
      setVentas((prev) => prev.map((v) => (v.id === id ? anulada : v)));
      setSuccessMsg(`Venta ${anulada.codigo} ha sido anulada`);
      return anulada;
    } catch (err) {
      setError(err.message || 'Error al anular la venta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ventas,
    loading,
    error,
    successMsg,
    cargarVentas,
    registrarVenta,
    anularVenta,
    limpiarError: () => setError(null),
    limpiarSuccess: () => setSuccessMsg(null),
  };
};

export default useVentas;
