/**
 * Custom Hook: useProductos
 * 
 * Centraliza el estado y las operaciones del módulo de productos en React.
 * Gestiona el ciclo de vida, estados de carga y errores mediante productoService.js.
 */

import { useState, useEffect, useCallback } from 'react';
import * as productoService from '../services/productoService';

export const useProductos = (autoCargar = true) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga la lista de productos desde el servicio
   */
  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productoService.obtenerProductos();
      setProductos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el catálogo de productos');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo producto y actualiza el estado local
   */
  const crearProducto = async (productoData) => {
    setLoading(true);
    setError(null);
    try {
      const nuevo = await productoService.crearProducto(productoData);
      setProductos((prev) => [nuevo, ...prev]);
      return nuevo;
    } catch (err) {
      const msg = err.message || 'Error al registrar el producto';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza un producto existente y sincroniza el estado local
   */
  const actualizarProducto = async (id, productoData) => {
    setLoading(true);
    setError(null);
    try {
      const actualizado = await productoService.actualizarProducto(id, productoData);
      setProductos((prev) =>
        prev.map((p) => (Number(p.id) === Number(id) ? actualizado : p))
      );
      return actualizado;
    } catch (err) {
      const msg = err.message || 'Error al actualizar el producto';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un producto y lo retira del estado local
   */
  const eliminarProducto = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productoService.eliminarProducto(id);
      setProductos((prev) => prev.filter((p) => Number(p.id) !== Number(id)));
      return true;
    } catch (err) {
      const msg = err.message || 'Error al eliminar el producto';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carga automática inicial si autoCargar es true
  useEffect(() => {
    if (autoCargar) {
      cargarProductos();
    }
  }, [autoCargar, cargarProductos]);

  return {
    productos,
    loading,
    error,
    cargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    setError
  };
};

export default useProductos;
