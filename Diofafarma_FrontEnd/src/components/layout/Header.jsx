/**
 * Componente de Layout: Header
 *
 * Cabecera superior del sistema DioFaFarma.
 * Muestra el nombre del usuario autenticado y permite cerrar sesión.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';

const Header = () => {
  const { usuario, sistemaNombre, toggleSidebar, cerrarSesion } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  // Inicial del nombre del usuario para el avatar
  const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Botón menú responsive para móviles */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Abrir menú de navegación"
        >
          ☰
        </button>

        <div>
          <span className="header-title-badge">Gestión Farmacéutica</span>
        </div>
      </div>

      <div className="header-right">
        {/* Perfil del usuario autenticado */}
        <div className="user-profile-widget">
          <div className="user-avatar" title={usuario?.nombre}>
            {inicial}
          </div>
          <div className="user-info">
            <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
            <span className="user-role">{usuario?.rol || 'Personal Farmacia'}</span>
          </div>
        </div>

        {/* Botón cerrar sesión */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
};

export default Header;
