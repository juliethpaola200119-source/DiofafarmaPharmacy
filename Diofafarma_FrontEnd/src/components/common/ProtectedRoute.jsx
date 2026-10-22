/**
 * Componente: ProtectedRoute
 *
 * Guard de rutas que verifica si el usuario tiene sesión activa.
 * Si no está autenticado, redirige al /login guardando la ruta original
 * para devolverlo ahí después del ingreso exitoso.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { estaAutenticado, authLoading } = useAppContext();
  const location = useLocation();

  // Mientras se restaura la sesión desde sessionStorage, muestra un spinner
  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-app)'
        }}
      >
        <Loading message="Verificando sesión..." />
      </div>
    );
  }

  if (!estaAutenticado) {
    // Guarda la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
