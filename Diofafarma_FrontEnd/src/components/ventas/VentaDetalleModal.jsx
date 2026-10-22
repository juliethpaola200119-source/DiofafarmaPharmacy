/**
 * Componente: VentaDetalleModal
 * Módulo: Componentes / Ventas / VentaDetalleModal
 *
 * Muestra el recibo / detalle completo de una venta con todos sus productos.
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { ventaService } from '../../services/ventaService';
import { formatCurrency } from '../../utils/formatters';

const VentaDetalleModal = ({ isOpen, onClose, ventaId }) => {
  const [venta, setVenta]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (isOpen && ventaId) {
      const cargarDetalle = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await ventaService.obtenerVentaPorId(ventaId);
          setVenta(data);
        } catch (err) {
          setError(err.message || 'Error al obtener el detalle de la venta');
        } finally {
          setLoading(false);
        }
      };
      cargarDetalle();
    } else {
      setVenta(null);
    }
  }, [isOpen, ventaId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta: ${venta?.codigo || ''}`}
    >
      {loading ? (
        <Loading text="Cargando detalle de la venta..." />
      ) : error ? (
        <div style={{ color: 'var(--color-danger)', padding: '1rem 0' }}>⚠ {error}</div>
      ) : venta ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Datos del encabezado */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-base)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Cliente: </span>
              <strong>{venta.clienteNombre}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Documento: </span>
              <strong>{venta.clienteDoc || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Fecha: </span>
              <strong>
                {venta.fecha ? new Date(venta.fecha).toLocaleString('es-CO') : '—'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Método de Pago: </span>
              <strong>{venta.tipoPago}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Estado: </span>
              <span className={`badge ${venta.estado === 'Completada' ? 'badge-active' : 'badge-inactive'}`}>
                <span className="badge-dot" />
                {venta.estado}
              </span>
            </div>
          </div>

          {/* Tabla de items */}
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table className="table-main" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Medicamento</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ textAlign: 'right' }}>IVA</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {venta.items?.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.codigoProducto}</td>
                    <td style={{ fontWeight: '600' }}>{item.nombreProducto}</td>
                    <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.precioUnitario)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(item.iva)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales consolidados */}
          <div
            style={{
              backgroundColor: 'var(--bg-base)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1.75rem',
              borderTop: '2px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Subtotal:</span>
              <strong>{formatCurrency(venta.subtotal)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>IVA (19%):</span>
              <strong style={{ color: 'var(--color-warning)' }}>{formatCurrency(venta.iva)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Venta:</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>{formatCurrency(venta.total)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default VentaDetalleModal;
