/**
 * Componente Reutilizable: Modal
 * 
 * Utilizado para confirmaciones de seguridad (ej. eliminar producto) y diálogos modales.
 */

import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title = 'Confirmación',
  children,
  onConfirm = null,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  isLoading = false,
  showFooter = true
}) => {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="modal-body">{children}</div>

        {/* Acciones */}
        {showFooter && (
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
