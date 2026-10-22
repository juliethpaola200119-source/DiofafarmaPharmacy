/**
 * Página: Productos
 * 
 * Página principal del módulo de gestión de productos de DioFaFarma.
 * Utiliza:
 * - ProductoList
 * - useProductos
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductoList from '../components/productos/ProductoList';
import Button from '../components/common/Button';

const Productos = () => {
  const navigate = useNavigate();

  return (
    <div className="productos-page">
      {/* Encabezado del Módulo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Gestión de Productos e Inventario
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Consulte, registre y controle las existencias de medicamentos en <strong>DioFaFarma</strong>.
          </p>
        </div>

        {/* Botón para dar de alta nuevo producto */}
        <Button
          variant="primary"
          onClick={() => navigate('/productos/nuevo')}
        >
          + Registrar Nuevo Producto
        </Button>
      </div>

      {/* Componente principal de listado */}
      <ProductoList />
    </div>
  );
};

export default Productos;
