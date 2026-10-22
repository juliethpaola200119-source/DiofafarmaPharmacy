/**
 * Componente: UsuarioList
 *
 * Tabla interactiva de gestión de usuarios del sistema DioFaFarma.
 * Muestra todos los usuarios con opciones de editar y eliminar.
 * Se conecta a la REST API → MySQL a través del hook useUsuarios.
 */

import React, { useState } from 'react';
import useUsuarios from '../../hooks/useUsuarios';
import UsuarioForm from './UsuarioForm';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Alert from '../common/Alert';

const UsuarioList = () => {
  const {
    usuarios,
    loading,
    error,
    successMsg,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    limpiarError
  } = useUsuarios();

  // Estado para formulario (crear/editar)
  const [formOpen, setFormOpen]               = useState(false);
  const [usuarioEditar, setUsuarioEditar]     = useState(null);
  const [formLoading, setFormLoading]         = useState(false);
  const [formError, setFormError]             = useState(null);

  // Estado para confirmación de eliminación
  const [confirmOpen, setConfirmOpen]         = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  // ── Abrir formulario de creación ────────────────────────────────────────
  const handleNuevoUsuario = () => {
    setUsuarioEditar(null);
    setFormError(null);
    setFormOpen(true);
  };

  // ── Abrir formulario de edición ─────────────────────────────────────────
  const handleEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setFormError(null);
    setFormOpen(true);
  };

  // ── Cerrar formulario ───────────────────────────────────────────────────
  const handleCloseForm = () => {
    setFormOpen(false);
    setUsuarioEditar(null);
    setFormError(null);
  };

  // ── Enviar formulario (crear o editar) ──────────────────────────────────
  const handleSubmitForm = async (datos) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (usuarioEditar) {
        await actualizarUsuario(usuarioEditar.id, datos);
      } else {
        await crearUsuario(datos);
      }
      handleCloseForm();
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Confirmar eliminación ────────────────────────────────────────────────
  const handleConfirmarEliminar = (usuario) => {
    setUsuarioAEliminar(usuario);
    setConfirmOpen(true);
  };

  const handleCerrarConfirm = () => {
    setConfirmOpen(false);
    setUsuarioAEliminar(null);
  };

  const handleEliminar = async () => {
    if (!usuarioAEliminar) return;
    setDeleteLoading(true);
    try {
      await eliminarUsuario(usuarioAEliminar.id);
      handleCerrarConfirm();
    } catch {
      handleCerrarConfirm();
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render de badge de rol ───────────────────────────────────────────────
  const rolStyle = {
    Administrador:  { background: '#ede9fe', color: '#6d28d9', fontWeight: 600 },
    Farmacéutico:   { background: '#dbeafe', color: '#1d4ed8', fontWeight: 600 },
    Cajero:         { background: '#f0fdf4', color: '#166534', fontWeight: 600 }
  };

  // ── Carga inicial ────────────────────────────────────────────────────────
  if (loading && usuarios.length === 0) {
    return <Loading text="Cargando usuarios..." />;
  }

  return (
    <div>
      {/* Alertas globales del módulo */}
      {error && (
        <Alert type="error" message={error} onClose={limpiarError} style={{ marginBottom: '1rem' }} />
      )}
      {successMsg && (
        <Alert type="success" message={successMsg} style={{ marginBottom: '1rem' }} />
      )}
      {formError && (
        <Alert type="error" message={formError} onClose={() => setFormError(null)} style={{ marginBottom: '1rem' }} />
      )}

      {/* Encabezado con botón de creación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            Personal del Sistema ({usuarios.length})
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
            Administre los usuarios con acceso a DioFaFarma
          </p>
        </div>
        <Button variant="primary" onClick={handleNuevoUsuario} disabled={loading}>
          + Nuevo Usuario
        </Button>
      </div>

      {/* Tabla de usuarios */}
      {usuarios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '2.5rem' }}>👤</span>
          <p style={{ marginTop: '0.75rem', fontWeight: 500 }}>No hay usuarios registrados aún.</p>
          <Button variant="primary" onClick={handleNuevoUsuario} style={{ marginTop: '1rem' }}>
            Registrar el primer usuario
          </Button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table-main">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    #{u.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: '34px', height: '34px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), #0284c7)',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: '700', flexShrink: 0
                      }}>
                        {u.usuario.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.usuario}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {u.email || <em style={{ opacity: 0.5 }}>Sin email</em>}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={rolStyle[u.rol] || { background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.estado ? 'badge-active' : 'badge-inactive'}`}>
                      <span className="badge-dot" />
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditar(u)}
                        title="Editar usuario"
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleConfirmarEliminar(u)}
                        title="Eliminar usuario"
                      >
                        🗑 Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Formulario Crear / Editar */}
      <UsuarioForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        usuarioEditar={usuarioEditar}
        isLoading={formLoading}
      />

      {/* Modal Confirmación Eliminar */}
      <Modal
        isOpen={confirmOpen}
        onClose={handleCerrarConfirm}
        title="⚠️ Eliminar Usuario"
        onConfirm={handleEliminar}
        confirmText="Sí, eliminar"
        confirmVariant="danger"
        isLoading={deleteLoading}
      >
        {usuarioAEliminar && (
          <div>
            <p>
              ¿Está seguro de que desea eliminar al usuario{' '}
              <strong>"{usuarioAEliminar.usuario}"</strong>?
            </p>
            <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              ⚠️ Esta acción no se puede deshacer.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsuarioList;
