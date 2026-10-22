/**
 * Componente de Layout: MainLayout
 * 
 * Estructura general de la aplicación DioFaFarma:
 * - Sidebar
 * - Header
 * - Contenido principal gestionado por React Router (<Outlet />)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Alert from '../common/Alert';
import { useAppContext } from '../../context/AppContext';

const MainLayout = () => {
  const { globalAlert, clearAlert } = useAppContext();

  return (
    <div className="app-container">
      {/* Barra lateral de navegación */}
      <Sidebar />

      {/* Contenedor principal */}
      <div className="main-content-wrapper">
        {/* Cabecera superior */}
        <Header />

        {/* Alerta global si existe */}
        {globalAlert && (
          <div style={{ padding: '1rem 2rem 0 2rem' }}>
            <Alert
              type={globalAlert.type}
              message={globalAlert.message}
              onClose={clearAlert}
            />
          </div>
        )}

        {/* Área de páginas renderizadas por React Router */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
