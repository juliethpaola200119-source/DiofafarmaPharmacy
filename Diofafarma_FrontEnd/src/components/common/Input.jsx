/**
 * Componente Reutilizable: Input
 * 
 * Gestiona campos de entrada con etiquetas, validación visual y mensajes de error.
 */

import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = null,
  helperText = null,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="form-required-star">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-textarea ${error ? 'has-error' : ''}`}
          rows={3}
          {...props}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-input ${error ? 'has-error' : ''}`}
          {...props}
        />
      )}

      {error && <span className="form-error-text">{error}</span>}
      {!error && helperText && <span className="form-helper-text">{helperText}</span>}
    </div>
  );
};

export default Input;
