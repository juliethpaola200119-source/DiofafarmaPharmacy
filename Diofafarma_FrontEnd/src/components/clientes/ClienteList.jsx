/**
 * Componente: ClienteList
 *
 * Tabla interactiva de gestión de clientes para DioFaFarma.
 * Búsqueda en tiempo real, creación, edición y eliminación de clientes.
 */

import React, { useState } from 'react';
import useClientes from '../../hooks/useClientes';
import ClienteForm from './ClienteForm';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Alert from '../common/Alert';

const ClienteList = () => {
  const {
    clientes,
    loading,
    error,
    successMsg,
    cargarClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    limpiarError,
    limpiarSuccess,
  } = useClientes();

  // Estados de modales y formularios
  const [formOpen, setFormOpen]                 = useState(false);
  const [clienteEditar, setClienteEditar]       = useState(null);
  const [formLoading, setFormLoading]           = useState(false);
  const [formError, setFormError]               = useState(null);

  const [confirmOpen, setConfirmOpen]           = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [deleteLoading, setDeleteLoading]       = useState(false);

  const [busqueda, setBusqueda]                 = useState('');

  // ── Abrir modal nuevo ──
  const handleNuevo = () => {
    setClienteEditar(null);
    setFormError(null);
    setFormOpen(true);
  };

  // ── Abrir modal editar ──
  const handleEditar = (cli) => {
    setClienteEditar(cli);
    setFormError(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setClienteEditar(null);
    setFormError(null);
  };

  // ── Guardar cliente (crear o editar) ──
  const handleSubmitForm = async (datos) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (clienteEditar) {
        await actualizarCliente(clienteEditar.id, datos);
      } else {
        await crearCliente(datos);
      }
      handleCloseForm();
    } catch (err) {
      setFormError(err.message || 'Error al guardar el cliente');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Confirmar eliminación ──
  const handleSolicitarEliminar = (cli) => {
    setClienteAEliminar(cli);
    setConfirmOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!clienteAEliminar) return;
    setDeleteLoading(true);
    try {
      await eliminarCliente(clienteAEliminar.id);
      setConfirmOpen(false);
      setClienteAEliminar(null);
    } catch (err) {
      // Error manejado en hook
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Filtrado local por término de búsqueda ──
  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      c.documento?.toLowerCase().includes(q) ||
      c.nombre?.toLowerCase().includes(q) ||
      c.apellido?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* ── Mensajes de alerta ── */}
      {error && <Alert type="error" message={error} onClose={limpiarError} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={limpiarSuccess} />}

      {/* ── Barra de acciones y búsqueda ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ flex: '1 1 320px', maxWidth: '450px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por documento, nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        <Button variant="primary" onClick={handleNuevo}>
          + Registrar Cliente
        </Button>
      </div>

      {/* ── Tabla de Clientes ── */}
      {loading ? (
        <Loading text="Cargando listado de clientes..." />
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {clientesFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                {busqueda ? 'No se encontraron clientes que coincidan con la búsqueda.' : 'No hay clientes registrados en el sistema.'}
              </p>
              {!busqueda && (
                <Button variant="primary" size="sm" onClick={handleNuevo} style={{ marginTop: '0.75rem' }}>
                  Registrar primer cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="table-main">
                <thead>
                  <tr>
                    <th>Tipo / Documento</th>
                    <th>Nombre Completo</th>
                    <th>Teléfono</th>
                    <th>Correo Electrónico</th>
                    <th>Dirección</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map((cli) => (
                    <tr key={cli.id}>
                      <td>
                        <span style={{ fontWeight: '600', color: 'var(--color-primary)', marginRight: '6px' }}>
                          [{cli.tipoDocumento}]
                        </span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                          {cli.documento}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {cli.nombre} {cli.apellido}
                      </td>
                      <td>{cli.telefono || '—'}</td>
                      <td>{cli.email || '—'}</td>
                      <td>{cli.direccion || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${cli.estado ? 'badge-active' : 'badge-inactive'}`}>
                          <span className="badge-dot" />
                          {cli.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditar(cli)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleSolicitarEliminar(cli)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Formulario (Crear / Editar) ── */}
      {formOpen && (
        <ClienteForm
          isOpen={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          clienteEditar={clienteEditar}
          isLoading={formLoading}
        />
      )}

      {/* ── Modal Confirmación Eliminación ── */}
      {confirmOpen && (
        <Modal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirmar Eliminación"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              ¿Está seguro de que desea eliminar al cliente{' '}
              <strong>
                {clienteAEliminar?.nombre} {clienteAEliminar?.apellido}
              </strong>{' '}
              con documento <strong>{clienteAEliminar?.documento}</strong>?
            </p>
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Esta acción no se puede deshacer si el cliente ya no tiene transacciones asociadas.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                variant="secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmarEliminar}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Sí, Eliminar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClienteList;
