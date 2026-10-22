/**
 * Componente Reutilizable: Alert
 * 
 * Permite mostrar mensajes de notificación: success, error, warning, info
 */

import React from 'react';

const Alert = ({
  type = 'info',
  message,
  children,
  onClose = null,
  className = ''
}) => {
  const content = message || children;
  if (!content) return null;

  // Iconos simples para no depender de nada externo
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`alert alert-${type} ${className}`.trim()} role="alert">
      <span className="alert-icon" style={{ fontWeight: 'bold' }}>
        {getIcon()}
      </span>
      <div className="alert-content">{content}</div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Cerrar alerta"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
