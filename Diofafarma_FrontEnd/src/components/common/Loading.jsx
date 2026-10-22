/**
 * Componente Reutilizable: Loading
 * 
 * Indicador visual de espera para operaciones asíncronas y llamadas HTTP.
 */

import React from 'react';

const Loading = ({ text = 'Cargando información farmacéutica...', fullHeight = false }) => {
  return (
    <div
      className="loading-container"
      style={{ minHeight: fullHeight ? '60vh' : '200px' }}
      role="status"
    >
      <div className="spinner" aria-hidden="true"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default Loading;
