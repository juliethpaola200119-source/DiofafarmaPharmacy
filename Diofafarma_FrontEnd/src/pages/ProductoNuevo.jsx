/**
 * Página: ProductoNuevo
 * 
 * Página para el alta de nuevos medicamentos en DioFaFarma.
 * Utiliza:
 * - ProductoForm
 * - useProductos
 * Muestra mensaje de éxito y redirecciona a /productos.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductoForm from '../components/productos/ProductoForm';
import useProductos from '../hooks/useProductos';
import Alert from '../components/common/Alert';
import { useAppContext } from '../context/AppContext';

const ProductoNuevo = () => {
  const navigate = useNavigate();
  const { crearProducto } = useProductos(false);
  const { showAlert } = useAppContext();

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (productoData) => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await crearProducto(productoData);
      showAlert(`Medicamento "${productoData.nombre}" registrado exitosamente en DioFaFarma.`, 'success');
      navigate('/productos');
    } catch (err) {
      setErrorMessage(err.message || 'Error al guardar el nuevo medicamento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="producto-nuevo-page" style={{ maxWidth: '850px', margin: '0 auto' }}>
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
          Alta de Medicamento
        </h1>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <ProductoForm
        onSubmit={handleSubmit}
        modoEdicion={false}
        isLoading={saving}
        onCancel={() => navigate('/productos')}
      />
    </div>
  );
};

export default ProductoNuevo;
