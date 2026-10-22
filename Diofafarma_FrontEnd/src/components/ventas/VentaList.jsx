/**
 * Componente: VentaList
 * Módulo: Componentes / Ventas / VentaList
 *
 * Tabla interactiva de ventas con buscador, registro de venta y visualización de detalle.
 */

import React, { useState } from 'react';
import useVentas from '../../hooks/useVentas';
import VentaForm from './VentaForm';
import VentaDetalleModal from './VentaDetalleModal';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Alert from '../common/Alert';
import { formatCurrency } from '../../utils/formatters';

const VentaList = () => {
  const {
    ventas,
    loading,
    error,
    successMsg,
    registrarVenta,
    anularVenta,
    limpiarError,
    limpiarSuccess,
  } = useVentas();

  // Estados de modales
  const [formOpen, setFormOpen]                 = useState(false);
  const [formLoading, setFormLoading]           = useState(false);
  const [detalleId, setDetalleId]               = useState(null);
  const [detalleOpen, setDetalleOpen]           = useState(false);

  const [confirmAnularOpen, setConfirmAnularOpen] = useState(false);
  const [ventaAAnular, setVentaAAnular]         = useState(null);
  const [anularLoading, setAnularLoading]       = useState(false);

  const [busqueda, setBusqueda]                 = useState('');

  // ── Registrar venta ──
  const handleVentaExitosa = async (datos) => {
    setFormLoading(true);
    try {
      await registrarVenta(datos);
      setFormOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Abrir detalle ──
  const handleVerDetalle = (id) => {
    setDetalleId(id);
    setDetalleOpen(true);
  };

  // ── Anular venta ──
  const handleSolicitarAnular = (venta) => {
    setVentaAAnular(venta);
    setConfirmAnularOpen(true);
  };

  const handleConfirmarAnular = async () => {
    if (!ventaAAnular) return;
    setAnularLoading(true);
    try {
      await anularVenta(ventaAAnular.id);
      setConfirmAnularOpen(false);
      setVentaAAnular(null);
    } finally {
      setAnularLoading(false);
    }
  };

  // ── Filtrado local ──
  const ventasFiltradas = ventas.filter((v) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      v.codigo?.toLowerCase().includes(q) ||
      v.clienteNombre?.toLowerCase().includes(q) ||
      v.clienteDoc?.toLowerCase().includes(q) ||
      v.tipoPago?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={limpiarError} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={limpiarSuccess} />}

      {/* ── Barra superior ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ flex: '1 1 320px', maxWidth: '450px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por código de venta, cliente o documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        <Button variant="primary" onClick={() => setFormOpen(true)}>
          + Nueva Venta
        </Button>
      </div>

      {/* ── Tabla de Ventas ── */}
      {loading ? (
        <Loading text="Cargando historial de ventas..." />
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {ventasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                {busqueda ? 'No se encontraron ventas para ese criterio de búsqueda.' : 'No hay ventas registradas aún.'}
              </p>
              {!busqueda && (
                <Button variant="primary" size="sm" onClick={() => setFormOpen(true)} style={{ marginTop: '0.75rem' }}>
                  Realizar primera venta
                </Button>
              )}
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="table-main">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Método Pago</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'right' }}>IVA (19%)</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary)' }}>
                        {v.codigo}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {v.fecha ? new Date(v.fecha).toLocaleDateString('es-CO', { dateStyle: 'short' }) : '—'}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {v.clienteNombre}
                        {v.clienteDoc ? <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Doc: {v.clienteDoc}</span> : null}
                      </td>
                      <td>{v.tipoPago}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(v.subtotal)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(v.iva)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatCurrency(v.total)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${v.estado === 'Completada' ? 'badge-active' : 'badge-inactive'}`}>
                          <span className="badge-dot" />
                          {v.estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleVerDetalle(v.id)}
                          >
                            👁 Ver
                          </Button>
                          {v.estado === 'Completada' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleSolicitarAnular(v)}
                            >
                              Anular
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Nueva Venta ── */}
      {formOpen && (
        <VentaForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onVentaExitosa={handleVentaExitosa}
          isLoading={formLoading}
        />
      )}

      {/* ── Modal Detalle de Venta ── */}
      {detalleOpen && (
        <VentaDetalleModal
          isOpen={detalleOpen}
          onClose={() => setDetalleOpen(false)}
          ventaId={detalleId}
        />
      )}

      {/* ── Modal Confirmar Anulación ── */}
      {confirmAnularOpen && (
        <Modal
          isOpen={confirmAnularOpen}
          onClose={() => setConfirmAnularOpen(false)}
          title="Confirmar Anulación de Venta"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              ¿Está seguro de que desea anular la venta con código <strong>{ventaAAnular?.codigo}</strong> por un total de <strong>{formatCurrency(ventaAAnular?.total)}</strong>?
            </p>
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ⚠ Los medicamentos de esta venta serán devueltos automáticamente al inventario aumentando su stock.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                variant="secondary"
                onClick={() => setConfirmAnularOpen(false)}
                disabled={anularLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmarAnular}
                disabled={anularLoading}
              >
                {anularLoading ? 'Anulando...' : 'Sí, Anular Venta'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VentaList;
