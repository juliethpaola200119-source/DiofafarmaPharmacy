/**
 * Componente: ProductoCard
 * 
 * Representa visualmente un producto en formato de tarjeta.
 * Reutilizable tanto en cuadrícula de catálogo como en modales de detalle.
 */

import React from 'react';
import Button from '../common/Button';
import {
  formatCurrency,
  getStockBadgeInfo,
  getEstadoBadgeInfo
} from '../../utils/formatters';

const ProductoCard = ({
  producto,
  onVer = null,
  onEditar = null,
  onEliminar = null,
  showActions = true
}) => {
  if (!producto) return null;

  const stockBadge = getStockBadgeInfo(producto.stock);
  const estadoBadge = getEstadoBadgeInfo(producto.estado);

  return (
    <div className="product-card">
      {/* Encabezado de la Tarjeta */}
      <div className="product-card-header">
        <div>
          <span className="product-card-code">{producto.codigo}</span>
          <h4 className="product-card-title">{producto.nombre}</h4>
          <span className="product-card-lab">
            {producto.laboratorio || 'Laboratorio no especificado'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <span className={`badge ${estadoBadge.className}`}>
            <span className="badge-dot" />
            {estadoBadge.label}
          </span>
          <span className={`badge ${stockBadge.className}`}>
            <span className="badge-dot" />
            {stockBadge.label}
          </span>
        </div>
      </div>

      {/* Cuerpo y Descripción */}
      <div className="product-card-body">
        {producto.descripcion ? (
          <p style={{ lineHeight: '1.4', color: 'var(--text-muted)' }}>
            {producto.descripcion}
          </p>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>
            Sin descripción adicional
          </p>
        )}

        {/* Precios de Compra y Venta */}
        <div className="product-card-prices">
          <div className="price-item">
            <span className="price-label">Precio Compra</span>
            <span className="price-val">{formatCurrency(producto.precioCompra)}</span>
          </div>
          <div className="price-item" style={{ textAlign: 'right' }}>
            <span className="price-label">Precio Venta</span>
            <span className="price-val price-sale">
              {formatCurrency(producto.precioVenta)}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones de la Tarjeta */}
      {showActions && (
        <div className="product-card-footer">
          {onVer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVer(producto)}
              title="Ver detalle completo"
            >
              Ver
            </Button>
          )}

          {onEditar && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEditar(producto)}
              title="Editar producto"
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
      )}
    </div>
  );
};

export default ProductoCard;
