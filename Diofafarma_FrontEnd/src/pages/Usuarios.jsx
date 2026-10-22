/**
 * Página: Usuarios
 *
 * Página principal del módulo de gestión de usuarios de DioFaFarma.
 * Accesible desde el Sidebar → "Usuarios".
 * Requiere autenticación (ruta protegida).
 *
 * Renderiza: UsuarioList (tabla interactiva con CRUD completo)
 */

import React from 'react';
import UsuarioList from '../components/usuarios/UsuarioList';

const Usuarios = () => {
  return (
    <div className="usuarios-page">
      {/* Encabezado del Módulo */}
      <div
        style={{
          marginBottom: '2rem'
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
          Gestión de Usuarios
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Administre el personal con acceso al sistema{' '}
          <strong>DioFaFarma</strong>. Asigne roles y gestione estados de cuenta.
        </p>
      </div>

      {/* Componente principal del módulo */}
      <UsuarioList />
    </div>
  );
};

export default Usuarios;
