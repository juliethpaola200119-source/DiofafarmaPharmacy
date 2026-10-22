/**
 * Página: Home
 * 
 * Dashboard principal del sistema de gestión farmacéutica DioFaFarma.
 * Muestra indicadores clave de inventario:
 * - Total de productos
 * - Productos activos
 * - Productos con stock bajo (<= 10)
 * - Productos sin stock (0)
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useProductos from '../hooks/useProductos';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import { formatCurrency, getStockBadgeInfo } from '../utils/formatters';

const Home = () => {
  const navigate = useNavigate();
  const { productos, loading, error } = useProductos();

  // Cálculo dinámico de indicadores
  const totalProductos = productos.length;
  const productosActivos = productos.filter((p) => p.estado === true).length;
  const productosStockBajo = productos.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) <= 10
  ).length;
  const productosSinStock = productos.filter((p) => Number(p.stock) === 0).length;

  // Productos con stock crítico para alertar
  const productosCriticos = productos.filter((p) => Number(p.stock) <= 10);

  return (
    <div className="home-page">
      {/* Encabezado del Dashboard */}
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
            Panel de Control Farmacéutico
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Bienvenido a <strong>DioFaFarma</strong>. Resumen del inventario y estado operativo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="primary"
            onClick={() => navigate('/productos/nuevo')}
          >
            + Nuevo Medicamento
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/productos')}
          >
            Ver Catálogo
          </Button>
        </div>
      </div>

      {/* Alerta si ocurre algún error de carga */}
      {error && <Alert type="error" message={error} />}

      {/* Indicador de Carga */}
      {loading ? (
        <Loading text="Cargando estadísticas de DioFaFarma..." />
      ) : (
        <>
          {/* Tarjetas de Estadísticas Principales */}
          <div className="dashboard-grid">
            {/* Total Productos */}
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-primary">
                <span style={{ fontSize: '1.5rem' }}>💊</span>
              </div>
              <div className="stat-data">
                <span className="stat-value">{totalProductos}</span>
                <span className="stat-title">Total de Productos</span>
              </div>
            </div>

            {/* Productos Activos */}
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-success">
                <span style={{ fontSize: '1.5rem' }}>✓</span>
              </div>
              <div className="stat-data">
                <span className="stat-value">{productosActivos}</span>
                <span className="stat-title">Productos Activos</span>
              </div>
            </div>

            {/* Stock Bajo */}
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-warning">
                <span style={{ fontSize: '1.5rem' }}>⚠</span>
              </div>
              <div className="stat-data">
                <span className="stat-value">{productosStockBajo}</span>
                <span className="stat-title">Stock Bajo (≤ 10 uds)</span>
              </div>
            </div>

            {/* Sin Stock */}
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-danger">
                <span style={{ fontSize: '1.5rem' }}>✕</span>
              </div>
              <div className="stat-data">
                <span className="stat-value">{productosSinStock}</span>
                <span className="stat-title">Agotados (0 uds)</span>
              </div>
            </div>
          </div>

          {/* Sección de Alertas de Stock Crítico */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.75rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Alertas de Reabastecimiento
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Medicamentos que requieren atención urgente por bajo inventario o agotamiento.
                </p>
              </div>
              <Link
                to="/productos"
                style={{
                  color: 'var(--color-primary)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Ver todos →
              </Link>
            </div>

            {productosCriticos.length === 0 ? (
              <p style={{ color: 'var(--color-success-text)', fontSize: '0.9rem', padding: '1rem 0' }}>
                ✓ No hay alertas críticas de inventario. Todos los productos cuentan con niveles adecuados de stock.
              </p>
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="table-main">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Medicamento</th>
                      <th>Laboratorio</th>
                      <th>Precio Venta</th>
                      <th>Stock Actual</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosCriticos.slice(0, 5).map((p) => {
                      const badge = getStockBadgeInfo(p.stock);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                            {p.codigo}
                          </td>
                          <td style={{ fontWeight: '600' }}>{p.nombre}</td>
                          <td>{p.laboratorio || 'N/A'}</td>
                          <td>{formatCurrency(p.precioVenta)}</td>
                          <td>
                            <span className={`badge ${badge.className}`}>
                              <span className="badge-dot" />
                              {badge.label}
                            </span>
                          </td>
                          <td>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/productos/editar/${p.id}`)}
                            >
                              Actualizar Stock
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
