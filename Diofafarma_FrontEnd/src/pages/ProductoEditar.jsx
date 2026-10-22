/**
 * Página: ProductoEditar
 * 
 * Página para la edición de productos existentes en DioFaFarma.
 * - Obtiene el ID desde React Router (useParams).
 * - Consulta el producto mediante productoService.js.
 * - Carga los datos en ProductoForm en modo edición.
 * - Actualiza y redirecciona al listado con mensaje de éxito.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductoForm from '../components/productos/ProductoForm';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import * as productoService from '../services/productoService';
import { useAppContext } from '../context/AppContext';

const ProductoEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAppContext();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Consulta del producto por ID mediante productoService.js
  useEffect(() => {
    let isMounted = true;

    const cargarProducto = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productoService.obtenerProductoPorId(id);
        if (isMounted) {
          setProducto(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `No fue posible cargar el medicamento con ID ${id}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    cargarProducto();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Actualización del producto mediante productoService.js
  const handleSubmit = async (formData) => {
    setSaving(true);
    setError(null);
    try {
      await productoService.actualizarProducto(id, formData);
      showAlert(`Medicamento "${formData.nombre}" actualizado correctamente en DioFaFarma.`, 'success');
      navigate('/productos');
    } catch (err) {
      setError(err.message || 'Error al actualizar los datos del medicamento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="producto-editar-page" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/productos')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}
        >
          ← Regresar al catálogo de productos
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
          Editar Medicamento {producto ? `- ${producto.nombre}` : ''}
        </h1>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {loading ? (
        <Loading text={`Consultando información del producto #${id}...`} />
      ) : producto ? (
        <ProductoForm
          initialValues={producto}
          onSubmit={handleSubmit}
          modoEdicion={true}
          isLoading={saving}
          onCancel={() => navigate('/productos')}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>El producto solicitado no existe o fue eliminado.</p>
        </div>
      )}
    </div>
  );
};

export default ProductoEditar;
