/**
 * AppContext: Contexto Global de la Aplicación DioFaFarma
 *
 * Gestiona el estado transversal del sistema mediante la Context API de React:
 * - Sesión y autenticación (conectada con la REST API + token JWT)
 * - Nombre oficial del sistema
 * - Notificaciones / Alertas globales
 * - Control del Sidebar responsive
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AppContext = createContext();

// Clave para persistir la sesión en sessionStorage (se borra al cerrar el navegador)
const SESSION_KEY = 'diofafarma_session';

export const AppProvider = ({ children }) => {
  // ── Estado de autenticación ──────────────────────────────────────────────
  const [usuario, setUsuario] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true mientras se restaura sesión

  // ── Estado de UI ─────────────────────────────────────────────────────────
  const sistemaNombre = 'DioFaFarma';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalAlert, setGlobalAlert] = useState(null);

  // ── Restaurar sesión al montar ───────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        setUsuario(JSON.parse(stored));
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ── Métodos de autenticación ─────────────────────────────────────────────
  /**
   * Inicia sesión contra la REST API → MySQL, obtiene token JWT y lo persiste.
   * @param {string} usuarioStr
   * @param {string} password
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  const iniciarSesion = useCallback(async (usuarioStr, password) => {
    const datos = await authService.login(usuarioStr, password);

    // Construir el objeto de sesión con todos los datos que devuelve la API (incluye token)
    const sesion = {
      id:     datos.id,
      nombre: datos.usuario,
      email:  datos.email   || `${datos.usuario}@diofafarma.com`,
      rol:    datos.rol     || 'Administrador Farmacéutico',
      estado: datos.estado  !== false,
      token:  datos.token   || null   // JWT para futuras peticiones protegidas
    };

    setUsuario(sesion);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    return sesion;
  }, []);

  /**
   * Cierra la sesión actual, limpia el estado y el sessionStorage
   */
  const cerrarSesion = useCallback(() => {
    setUsuario(null);
    sessionStorage.removeItem(SESSION_KEY);
    showAlert('Sesión cerrada correctamente', 'info');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Alertas globales ─────────────────────────────────────────────────────
  const showAlert = (message, type = 'success', timeout = 4000) => {
    setGlobalAlert({ message, type });
    if (timeout > 0) {
      setTimeout(() => setGlobalAlert(null), timeout);
    }
  };

  const clearAlert = () => setGlobalAlert(null);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Alias logout para mantener compatibilidad con Header.jsx
  const logout = cerrarSesion;

  const value = {
    // Sesión
    usuario,
    setUsuario,
    authLoading,
    iniciarSesion,
    cerrarSesion,
    logout,
    estaAutenticado: !!usuario,

    // Sistema
    sistemaNombre,

    // Sidebar
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,

    // Alertas
    globalAlert,
    showAlert,
    clearAlert
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook personalizado para consumir AppContext de forma sencilla
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe utilizarse dentro de un AppProvider');
  }
  return context;
};

export default AppContext;
