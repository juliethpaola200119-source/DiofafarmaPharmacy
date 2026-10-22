/**
 * Componente: ProductoItem
 * 
 * Representa un producto individual dentro de la tabla o listado.
 * Recibe el producto mediante props y muestra su información y acciones.
 */

import React from 'react';
import Button from '../common/Button';
import {
  formatCurrency,
  getStockBadgeInfo,
  getEstadoBadgeInfo
} from '../../utils/formatters';

const ProductoItem = ({ producto, onVer, onEditar, onEliminar }) => {
  const stockBadge = getStockBadgeInfo(producto.stock);
  const estadoBadge = getEstadoBadgeInfo(producto.estado);

  return (
    <tr key={producto.id}>
      {/* Código */}
      <td>
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: '600',
            color: 'var(--color-primary-dark)',
            backgroundColor: 'var(--color-primary-light)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem'
          }}
        >
          {producto.codigo}
        </span>
      </td>

      {/* Nombre y Descripción */}
      <td>
        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
          {producto.nombre}
        </div>
        {producto.descripcion && (
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              maxWidth: '260px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={producto.descripcion}
          >
            {producto.descripcion}
          </div>
        )}
      </td>

      {/* Laboratorio */}
      <td>
        <span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
          {producto.laboratorio || 'N/A'}
        </span>
      </td>

      {/* Precio de Compra */}
      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {formatCurrency(producto.precioCompra)}
      </td>

      {/* Precio de Venta */}
      <td style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>
        {formatCurrency(producto.precioVenta)}
      </td>

      {/* Stock */}
      <td>
        <span className={`badge ${stockBadge.className}`}>
          <span className="badge-dot" />
          {stockBadge.label}
        </span>
      </td>

      {/* Estado */}
      <td>
        <span className={`badge ${estadoBadge.className}`}>
          <span className="badge-dot" />
          {estadoBadge.label}
        </span>
      </td>

      {/* Acciones */}
      <td>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {onVer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVer(producto)}
              title="Ver detalle del producto"
            >
              Ver
            </Button>
          )}

          {onEditar && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEditar(producto)}
              title="Editar información del producto"
            >
              Editar
            </Button>
          )}

          {onEliminar && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onEliminar(producto)}
              title="Eliminar producto"
            >
              Eliminar
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductoItem;
