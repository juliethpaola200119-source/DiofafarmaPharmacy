/**
 * Página: Ventas
 * Módulo: Pages / Ventas
 *
 * Módulo principal de Ventas y Facturación de DioFaFarma.
 */

import React from 'react';
import VentaList from '../components/ventas/VentaList';

const Ventas = () => {
  return (
    <div className="ventas-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
          🛒 Módulo de Ventas
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Registro de ventas farmacéuticas, control de stock y emisión de comprobantes de <strong>DioFaFarma</strong>.
        </p>
      </div>

      <VentaList />
    </div>
  );
};

export default Ventas;
