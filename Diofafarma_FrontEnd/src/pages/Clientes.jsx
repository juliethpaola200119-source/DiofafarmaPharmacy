/**
 * Página: Clientes
 *
 * Módulo de Gestión de Clientes de DioFaFarma.
 * Permite registrar, buscar, editar y gestionar el estado de clientes.
 */

import React from 'react';
import ClienteList from '../components/clientes/ClienteList';

const Clientes = () => {
  return (
    <div className="clientes-page">
      {/* Encabezado */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
          👥 Gestión de Clientes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Registro y administración de clientes de <strong>DioFaFarma</strong> para ventas y facturación.
        </p>
      </div>

      <ClienteList />
    </div>
  );
};

export default Clientes;
