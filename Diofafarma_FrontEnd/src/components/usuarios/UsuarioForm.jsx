/**
 * Componente: UsuarioForm
 *
 * Formulario modal para Crear o Editar un usuario del sistema DioFaFarma.
 * Valida campos obligatorios antes de enviar al backend.
 * Si `usuarioEditar` viene con datos, opera en modo edición.
 * Si `usuarioEditar` es null, opera en modo creación.
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';

const ROLES = ['Administrador', 'Farmacéutico', 'Cajero'];

const estadoInicial = {
  usuario:         '',
  email:           '',
  password:        '',
  confirmarPassword: '',
  rol:             'Cajero',
  estado:          true
};

const UsuarioForm = ({ isOpen, onClose, onSubmit, usuarioEditar, isLoading }) => {
  const modoEdicion = !!usuarioEditar;

  const [form, setForm]     = useState(estadoInicial);
  const [errores, setErrores] = useState({});

  // Llenar el formulario cuando se edita
  useEffect(() => {
    if (isOpen) {
      if (modoEdicion && usuarioEditar) {
        setForm({
          usuario:           usuarioEditar.usuario   || '',
          email:             usuarioEditar.email     || '',
          password:          '',         // No mostrar la contraseña actual
          confirmarPassword: '',
          rol:               usuarioEditar.rol       || 'Cajero',
          estado:            usuarioEditar.estado !== false
        });
      } else {
        setForm(estadoInicial);
      }
      setErrores({});
    }
  }, [isOpen, usuarioEditar, modoEdicion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.usuario.trim()) {
      nuevosErrores.usuario = 'El nombre de usuario es obligatorio';
    } else if (form.usuario.trim().length < 3) {
      nuevosErrores.usuario = 'El usuario debe tener al menos 3 caracteres';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nuevosErrores.email = 'Ingrese un email válido';
    }

    // En creación, la contraseña es obligatoria
    if (!modoEdicion) {
      if (!form.password.trim()) {
        nuevosErrores.password = 'La contraseña es obligatoria';
      } else if (form.password.trim().length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    // Si se proporciona contraseña en edición, validar también
    if (modoEdicion && form.password.trim()) {
      if (form.password.trim().length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    // Confirmar contraseña (solo si se introdujo una)
    if (form.password.trim() && form.password !== form.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    if (!ROLES.includes(form.rol)) {
      nuevosErrores.rol = 'Seleccione un rol válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validar()) return;

    const datos = {
      usuario: form.usuario.trim(),
      email:   form.email.trim(),
      rol:     form.rol,
      estado:  form.estado
    };

    // Solo incluir password si se proporcionó
    if (form.password.trim()) {
      datos.password = form.password.trim();
    }

    await onSubmit(datos);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modoEdicion ? '✏️ Editar Usuario' : '➕ Registrar Nuevo Usuario'}
      onConfirm={handleSubmit}
      confirmText={modoEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
      confirmVariant="primary"
      isLoading={isLoading}
      showFooter={true}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Usuario */}
        <div className="form-group">
          <label className="form-label" htmlFor="usuario">
            Usuario <span className="form-required-star">*</span>
          </label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            className={`form-input${errores.usuario ? ' has-error' : ''}`}
            value={form.usuario}
            onChange={handleChange}
            placeholder="ej. jperez"
            autoComplete="username"
            disabled={isLoading}
          />
          {errores.usuario && <span className="form-error-text">{errores.usuario}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-input${errores.email ? ' has-error' : ''}`}
            value={form.email}
            onChange={handleChange}
            placeholder="ej. jperez@diofafarma.com"
            autoComplete="email"
            disabled={isLoading}
          />
          {errores.email && <span className="form-error-text">{errores.email}</span>}
        </div>

        {/* Contraseña */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Contraseña {!modoEdicion && <span className="form-required-star">*</span>}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={`form-input${errores.password ? ' has-error' : ''}`}
            value={form.password}
            onChange={handleChange}
            placeholder={modoEdicion ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
            autoComplete="new-password"
            disabled={isLoading}
          />
          {errores.password && <span className="form-error-text">{errores.password}</span>}
          {modoEdicion && !errores.password && (
            <span className="form-helper-text">Solo complete si desea cambiar la contraseña</span>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirmarPassword">
            Confirmar Contraseña {form.password && <span className="form-required-star">*</span>}
          </label>
          <input
            id="confirmarPassword"
            name="confirmarPassword"
            type="password"
            className={`form-input${errores.confirmarPassword ? ' has-error' : ''}`}
            value={form.confirmarPassword}
            onChange={handleChange}
            placeholder="Repita la contraseña"
            autoComplete="new-password"
            disabled={isLoading}
          />
          {errores.confirmarPassword && <span className="form-error-text">{errores.confirmarPassword}</span>}
        </div>

        {/* Rol */}
        <div className="form-group">
          <label className="form-label" htmlFor="rol">
            Rol <span className="form-required-star">*</span>
          </label>
          <select
            id="rol"
            name="rol"
            className={`form-select${errores.rol ? ' has-error' : ''}`}
            value={form.rol}
            onChange={handleChange}
            disabled={isLoading}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errores.rol && <span className="form-error-text">{errores.rol}</span>}
        </div>

        {/* Estado */}
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
          <label className="form-label" style={{ margin: 0 }} htmlFor="estado">
            Estado
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              id="estado"
              name="estado"
              type="checkbox"
              checked={form.estado}
              onChange={handleChange}
              disabled={isLoading}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', color: form.estado ? 'var(--color-success)' : 'var(--text-muted)' }}>
              {form.estado ? '● Activo' : '○ Inactivo'}
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default UsuarioForm;
