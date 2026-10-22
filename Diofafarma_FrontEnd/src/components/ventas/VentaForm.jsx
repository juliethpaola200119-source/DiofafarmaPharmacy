/**
 * Componente: VentaForm
 * Módulo: Componentes / Ventas / VentaForm
 *
 * Formulario interactivo para registrar ventas de medicamentos en tiempo real.
 * Permite seleccionar cliente, agregar múltiples productos, validar stock disponible
 * y calcula automáticamente precio, cantidad, IVA (19%), subtotal y total.
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { obtenerClientes } from '../../services/clienteService';
import { obtenerProductos } from '../../services/productoService';
import { formatCurrency } from '../../utils/formatters';

const TASA_IVA = 0.19;

const VentaForm = ({ isOpen, onClose, onVentaExitosa, isLoading }) => {
  const [clientes, setClientes]               = useState([]);
  const [productos, setProductos]             = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // Datos de encabezado de venta
  const [clienteId, setClienteId]             = useState('');
  const [tipoPago, setTipoPago]               = useState('Efectivo');
  const [observaciones, setObservaciones]     = useState('');

  // Selector de producto a agregar
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
  const [cantidadInput, setCantidadInput]     = useState(1);
  const [errorItem, setErrorItem]             = useState(null);

  // Carrito de items
  const [items, setItems]                     = useState([]);
  const [errorGeneral, setErrorGeneral]       = useState(null);

  // Cargar clientes y productos activos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const cargarDatos = async () => {
        try {
          setLoadingCatalogos(true);
          const [clis, prods] = await Promise.all([
            obtenerClientes(),
            obtenerProductos(),
          ]);
          setClientes(clis.filter((c) => c.estado !== false));
          setProductos(prods.filter((p) => p.estado !== false && Number(p.stock) > 0));
        } catch (err) {
          setErrorGeneral('Error al cargar la lista de productos y clientes');
        } finally {
          setLoadingCatalogos(false);
        }
      };

      cargarDatos();
      setItems([]);
      setClienteId('');
      setTipoPago('Efectivo');
      setObservaciones('');
      setProductoSeleccionadoId('');
      setCantidadInput(1);
      setErrorItem(null);
      setErrorGeneral(null);
    }
  }, [isOpen]);

  const productoActual = productos.find((p) => String(p.id) === String(productoSeleccionadoId));

  // ── Agregar producto a la lista de venta ──
  const handleAgregarItem = (e) => {
    e.preventDefault();
    setErrorItem(null);

    if (!productoActual) {
      setErrorItem('Por favor seleccione un medicamento de la lista');
      return;
    }

    const cant = Number(cantidadInput);
    if (isNaN(cant) || cant <= 0) {
      setErrorItem('La cantidad debe ser mayor a 0');
      return;
    }

    // Verificar si ya está en la lista para sumar cantidades
    const itemExistente = items.find((i) => i.productoId === productoActual.id);
    const cantidadTotal = (itemExistente ? itemExistente.cantidad : 0) + cant;

    if (cantidadTotal > Number(productoActual.stock)) {
      setErrorItem(`Stock insuficiente. Solo hay ${productoActual.stock} unidades disponibles.`);
      return;
    }

    const precioUnitario = Number(productoActual.precioVenta);
    const subtotal = precioUnitario * cant;
    const iva = Math.round(subtotal * TASA_IVA);
    const total = subtotal + iva;

    if (itemExistente) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.productoId === productoActual.id) {
            const nuevaCant = i.cantidad + cant;
            const nuevoSub = precioUnitario * nuevaCant;
            const nuevoIva = Math.round(nuevoSub * TASA_IVA);
            return {
              ...i,
              cantidad: nuevaCant,
              subtotal: nuevoSub,
              iva: nuevoIva,
              total: nuevoSub + nuevoIva,
            };
          }
          return i;
        })
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productoId:     productoActual.id,
          codigoProducto: productoActual.codigo,
          nombreProducto: productoActual.nombre,
          precioUnitario,
          cantidad:       cant,
          tasaIva:        TASA_IVA,
          iva,
          subtotal,
          total,
        },
      ]);
    }

    setProductoSeleccionadoId('');
    setCantidadInput(1);
  };

  // ── Quitar item de la lista ──
  const handleQuitarItem = (pId) => {
    setItems((prev) => prev.filter((i) => i.productoId !== pId));
  };

  // ── Totales consolidados ──
  const subtotalGeneral = items.reduce((acc, i) => acc + i.subtotal, 0);
  const ivaGeneral      = items.reduce((acc, i) => acc + i.iva, 0);
  const totalGeneral    = items.reduce((acc, i) => acc + i.total, 0);

  // ── Registrar venta ──
  const handleSubmitVenta = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);

    if (items.length === 0) {
      setErrorGeneral('Debe agregar al menos un producto a la venta');
      return;
    }

    try {
      await onVentaExitosa({
        clienteId: clienteId || null,
        tipoPago,
        observaciones,
        items: items.map((i) => ({
          productoId:     i.productoId,
          cantidad:       i.cantidad,
          precioUnitario: i.precioUnitario,
          tasaIva:        i.tasaIva,
        })),
      });
      onClose();
    } catch (err) {
      setErrorGeneral(err.message || 'Error al procesar la venta');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛒 Registrar Nueva Venta">
      <form onSubmit={handleSubmitVenta} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {errorGeneral && (
          <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', backgroundColor: '#fee2e2', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
            ⚠ {errorGeneral}
          </div>
        )}

        {/* Fila: Cliente y Método de Pago */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Cliente
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              disabled={loadingCatalogos}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            >
              <option value="">Cliente Ocasional / Mostrador</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellido} ({c.tipoDocumento}: {c.documento})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Método de Pago
            </label>
            <select
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            >
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Tarjeta">💳 Tarjeta Débito/Crédito</option>
              <option value="Transferencia">📱 Transferencia / Nequi / Daviplata</option>
            </select>
          </div>
        </div>

        {/* ── Sección de Selección de Productos ── */}
        <div
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            Agregar Medicamentos al Pedido
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px auto', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Medicamento {productoActual ? `(Stock: ${productoActual.stock} | Precio: ${formatCurrency(productoActual.precioVenta)})` : ''}
              </label>
              <select
                value={productoSeleccionadoId}
                onChange={(e) => setProductoSeleccionadoId(e.target.value)}
                disabled={loadingCatalogos}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              >
                <option value="">— Seleccionar medicamento —</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre} ({formatCurrency(p.precioVenta)} - {p.stock} disp.)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Cant.
              </label>
              <input
                type="number"
                min="1"
                max={productoActual ? productoActual.stock : 999}
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.5rem',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAgregarItem}
              disabled={!productoSeleccionadoId}
            >
              + Agregar
            </Button>
          </div>

          {errorItem && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              ⚠ {errorItem}
            </div>
          )}
        </div>

        {/* ── Tabla de Items Seleccionados ── */}
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
              No has agregado productos a la venta aún.
            </p>
          ) : (
            <table className="table-main" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Medicamento</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Precio</th>
                  <th style={{ textAlign: 'right' }}>IVA (19%)</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.productoId}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{i.codigoProducto}</td>
                    <td style={{ fontWeight: '600' }}>{i.nombreProducto}</td>
                    <td style={{ textAlign: 'center' }}>{i.cantidad}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(i.precioUnitario)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(i.iva)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(i.total)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleQuitarItem(i.productoId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-danger)',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Resumen de Totales ── */}
        <div
          style={{
            backgroundColor: 'var(--bg-base)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '2rem',
            borderTop: '2px solid var(--border-color)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Subtotal:</span>
            <strong style={{ fontSize: '0.95rem' }}>{formatCurrency(subtotalGeneral)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>IVA (19%):</span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-warning)' }}>{formatCurrency(ivaGeneral)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total a Pagar:</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{formatCurrency(totalGeneral)}</strong>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || items.length === 0}>
            {isLoading ? 'Procesando...' : 'Confirmar y Guardar Venta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VentaForm;
