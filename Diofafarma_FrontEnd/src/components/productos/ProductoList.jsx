/**
 * Componente: ProductoList
 * 
 * Lista y gestiona la visualización del catálogo de productos de DioFaFarma.
 * Utiliza:
 * - ProductoItem para la vista en tabla
 * - ProductoCard para la vista en cuadrícula y detalle modal
 * - Loading para estados de espera
 * - Alert para mensajes de error o información
 * - Modal para confirmación segura de eliminación y vista de detalle
 * - useProductos para la gestión de datos sin llamadas HTTP directas
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProductos from '../../hooks/useProductos';
import ProductoItem from './ProductoItem';
import ProductoCard from './ProductoCard';
import Loading from '../common/Loading';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const ProductoList = () => {
  const navigate = useNavigate();
  const { productos, loading, error, eliminarProducto } = useProductos();

  // Estados locales para filtros y vista
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos'); // 'todos' | 'activos' | 'inactivos' | 'stockBajo'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Estados para modales
  const [productoParaEliminar, setProductoParaEliminar] = useState(null);
  const [productoParaVer, setProductoParaVer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Filtrado de productos
  const productosFiltrados = productos.filter((p) => {
    const matchSearch =
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.laboratorio?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filterEstado === 'activos') return p.estado === true;
    if (filterEstado === 'inactivos') return p.estado === false;
    if (filterEstado === 'stockBajo') return Number(p.stock) <= 10;

    return true;
  });

  // Manejadores de acciones
  const handleVer = (producto) => {
    setProductoParaVer(producto);
  };

  const handleEditar = (producto) => {
    navigate(`/productos/editar/${producto.id}`);
  };

  const handleSolicitarEliminar = (producto) => {
    setProductoParaEliminar(producto);
  };

  const handleConfirmarEliminar = async () => {
    if (!productoParaEliminar) return;
    setIsDeleting(true);
    try {
      await eliminarProducto(productoParaEliminar.id);
      setActionMessage({
        type: 'success',
        text: `El producto "${productoParaEliminar.nombre}" fue eliminado exitosamente.`
      });
      setProductoParaEliminar(null);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'No fue posible eliminar el producto.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="producto-list-wrapper">
      {/* Alerta de acción (éxito/error) */}
      {actionMessage && (
        <Alert
          type={actionMessage.type}
          message={actionMessage.text}
          onClose={() => setActionMessage(null)}
        />
      )}

      {/* Alerta de error proveniente del hook */}
      {error && <Alert type="error" message={error} />}

      {/* Barra de Filtros y Controles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Campo de búsqueda */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <Input
            name="search"
            placeholder="Buscar por código, nombre o laboratorio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros por estado/stock y selector de vista */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{ width: 'auto', padding: '0.625rem 1rem' }}
          >
            <option value="todos">Todos los Estados</option>
            <option value="activos">Solo Activos</option>
            <option value="inactivos">Solo Inactivos</option>
            <option value="stockBajo">Stock Bajo (≤ 10)</option>
          </select>

          {/* Toggle de Vista Tabla / Cuadrícula */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.55rem 0.85rem',
                border: 'none',
                background: viewMode === 'table' ? 'var(--color-primary)' : 'var(--bg-surface)',
                color: viewMode === 'table' ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.8rem'
              }}
              title="Vista de Tabla"
            >
              ☰ Tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.55rem 0.85rem',
                border: 'none',
                background: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--bg-surface)',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.8rem'
              }}
              title="Vista de Tarjetas"
            >
              ▦ Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* Estado de Carga */}
      {loading && <Loading text="Consultando productos farmacéuticos..." />}

      {/* Contenido Principal sin carga */}
      {!loading && productosFiltrados.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)'
          }}
        >
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
            No se encontraron productos
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            {searchTerm || filterEstado !== 'todos'
              ? 'Intenta ajustar los criterios de búsqueda o filtros.'
              : 'Aún no hay productos registrados en el sistema DioFaFarma.'}
          </p>
        </div>
      )}

      {/* Vista Tabla utilizando ProductoItem */}
      {!loading && productosFiltrados.length > 0 && viewMode === 'table' && (
        <div className="table-container">
          <table className="table-main">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre / Descripción</th>
                <th>Laboratorio</th>
                <th>P. Compra</th>
                <th>P. Venta</th>
                <th>Stock</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <ProductoItem
                  key={producto.id}
                  producto={producto}
                  onVer={handleVer}
                  onEditar={handleEditar}
                  onEliminar={handleSolicitarEliminar}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista Cuadrícula utilizando ProductoCard */}
      {!loading && productosFiltrados.length > 0 && viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onVer={handleVer}
              onEditar={handleEditar}
              onEliminar={handleSolicitarEliminar}
            />
          ))}
        </div>
      )}

      {/* Modal para Confirmar Eliminación (Requisito estricto: confirmación previa) */}
      <Modal
        isOpen={Boolean(productoParaEliminar)}
        onClose={() => setProductoParaEliminar(null)}
        title="Confirmar Eliminación"
        confirmText="Sí, Eliminar"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmarEliminar}
      >
        <p>
          ¿Está seguro de eliminar el producto{' '}
          <strong>"{productoParaEliminar?.nombre}"</strong> (Código:{' '}
          {productoParaEliminar?.codigo})?
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--color-danger-text)' }}>
          Esta acción removerá el registro del inventario y no podrá deshacerse.
        </p>
      </Modal>

      {/* Modal para Ver Detalles del Producto utilizando ProductoCard */}
      <Modal
        isOpen={Boolean(productoParaVer)}
        onClose={() => setProductoParaVer(null)}
        title="Detalle del Medicamento"
        showFooter={false}
      >
        {productoParaVer && (
          <div>
            <ProductoCard producto={productoParaVer} showActions={false} />
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                variant="secondary"
                onClick={() => setProductoParaVer(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const id = productoParaVer.id;
                  setProductoParaVer(null);
                  navigate(`/productos/editar/${id}`);
                }}
              >
                Editar Producto
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductoList;
