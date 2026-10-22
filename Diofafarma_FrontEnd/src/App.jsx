/**
 * App.jsx: Enrutador Principal de DioFaFarma
 *
 * Configura las rutas del sistema mediante React Router:
 * /login                → Login (pública)
 * /                     → Home (Dashboard) [protegida]
 * /productos            → Productos (Catálogo) [protegida]
 * /productos/nuevo      → ProductoNuevo (Alta) [protegida]
 * /productos/editar/:id → ProductoEditar (Modificación) [protegida]
 * /usuarios             → Usuarios (Gestión de Personal) [protegida]
 * /reportes             → Reportes (Centro de Reportes) [protegida]
 * *                     → Redirección a /
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Productos from './pages/Productos';
import ProductoNuevo from './pages/ProductoNuevo';
import ProductoEditar from './pages/ProductoEditar';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Ruta pública: Login ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Rutas protegidas: requieren sesión activa ── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Inicio */}
            <Route index element={<Home />} />

            {/* Módulo de Productos */}
            <Route path="productos" element={<Productos />} />
            <Route path="productos/nuevo" element={<ProductoNuevo />} />
            <Route path="productos/editar/:id" element={<ProductoEditar />} />

            {/* Módulo de Gestión de Usuarios */}
            <Route path="usuarios" element={<Usuarios />} />

            {/* Módulo de Reportes */}
            <Route path="reportes" element={<Reportes />} />

            {/* Módulo de Gestión de Clientes */}
            <Route path="clientes" element={<Clientes />} />

            {/* Módulo de Ventas */}
            <Route path="ventas" element={<Ventas />} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Ruta raíz fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
