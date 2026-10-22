/**
 * Página: Login
 *
 * Formulario de inicio de sesión de DioFaFarma.
 * Consume la REST API → MySQL para autenticar al usuario.
 * Respeta el sistema de colores y componentes existentes.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { iniciarSesion, showAlert } = useAppContext();

  // Redirigir a la ruta que intentaba visitar, o al inicio por defecto
  const destino = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ usuario: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Manejadores ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errorLogin) setErrorLogin('');
  };

  const validar = () => {
    const errs = {};
    if (!form.usuario.trim()) errs.usuario = 'El nombre de usuario es obligatorio';
    if (!form.password.trim()) errs.password = 'La contraseña es obligatoria';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLogin('');

    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await iniciarSesion(form.usuario.trim(), form.password.trim());
      showAlert(`¡Bienvenido, ${form.usuario.trim()}! Sesión iniciada correctamente.`, 'success');
      navigate(destino, { replace: true });
    } catch (err) {
      // La API devuelve mensajes descriptivos en el campo message
      setErrorLogin(err.message || 'Usuario o contraseña incorrectos. Verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">

      {/* Panel izquierdo decorativo */}
      <div className="login-panel-left">
        <div className="login-brand">
          <div className="login-brand-icon">⚕</div>
          <div>
            <h1 className="login-brand-title">DioFaFarma</h1>
            <p className="login-brand-subtitle">Sistema de Gestión Farmacéutica</p>
          </div>
        </div>

        <div className="login-features">
          <div className="login-feature-item">
            <span className="login-feature-icon">💊</span>
            <div>
              <strong>Gestión de Inventario</strong>
              <p>Controla medicamentos y existencias en tiempo real.</p>
            </div>
          </div>
          <div className="login-feature-item">
            <span className="login-feature-icon">📊</span>
            <div>
              <strong>Reportes y Estadísticas</strong>
              <p>Análisis del movimiento de tu droguería.</p>
            </div>
          </div>
          <div className="login-feature-item">
            <span className="login-feature-icon">🔒</span>
            <div>
              <strong>Acceso Seguro</strong>
              <p>Autenticación protegida con cifrado bcrypt.</p>
            </div>
          </div>
        </div>

        <div className="login-panel-footer">
          © 2026 DioFaFarma · Todos los derechos reservados
        </div>
      </div>

      {/* Panel derecho – formulario */}
      <div className="login-panel-right">
        <div className="login-form-card">

          {/* Cabecera del formulario */}
          <div className="login-form-header">
            <div className="login-form-icon">⚕</div>
            <h2 className="login-form-title">Iniciar Sesión</h2>
            <p className="login-form-subtitle">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Error de autenticación */}
          {errorLogin && (
            <div className="login-error-banner">
              <span className="login-error-icon">⚠</span>
              <span>{errorLogin}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Usuario"
              name="usuario"
              type="text"
              value={form.usuario}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              required
              error={errors.usuario}
              disabled={loading}
              autoComplete="username"
              autoFocus
            />

            {/* Campo contraseña con toggle de visibilidad */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña <span className="form-required-star">*</span>
              </label>
              <div className="login-password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className={`form-input login-password-input ${errors.password ? 'has-error' : ''}`}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && (
                <span className="form-error-text">{errors.password}</span>
              )}
            </div>

            {/* Botón de ingreso */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Verificando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </Button>
          </form>

          {/* Credenciales de ayuda en desarrollo */}
          <div className="login-demo-hint">
            <span className="login-demo-hint-icon">ℹ</span>
            <span>
              Credencial por defecto:&nbsp;
              <strong>admin</strong> / <strong>123456</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
