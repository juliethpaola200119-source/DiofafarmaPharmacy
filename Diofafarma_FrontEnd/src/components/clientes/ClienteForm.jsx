/**
 * Componente: ClienteForm
 *
 * Formulario modal para Crear o Editar un cliente en DioFaFarma.
 * Valida documento y nombre antes del envío a la API REST.
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const TIPOS_DOC = [
  { value: 'CC',  label: 'Cédula de Ciudadanía (CC)' },
  { value: 'TI',  label: 'Tarjeta de Identidad (TI)' },
  { value: 'CE',  label: 'Cédula de Extranjería (CE)' },
  { value: 'NIT', label: 'NIT / Empresa' },
  { value: 'PAS', label: 'Pasaporte' },
];

const estadoInicial = {
  tipoDocumento: 'CC',
  documento:     '',
  nombre:        '',
  apellido:      '',
  telefono:      '',
  email:         '',
  direccion:     '',
  estado:        true,
};

const ClienteForm = ({ isOpen, onClose, onSubmit, clienteEditar, isLoading }) => {
  const modoEdicion = !!clienteEditar;
  const [form, setForm]       = useState(estadoInicial);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (modoEdicion && clienteEditar) {
        setForm({
          tipoDocumento: clienteEditar.tipoDocumento || 'CC',
          documento:     clienteEditar.documento     || '',
          nombre:        clienteEditar.nombre        || '',
          apellido:      clienteEditar.apellido      || '',
          telefono:      clienteEditar.telefono      || '',
          email:         clienteEditar.email         || '',
          direccion:     clienteEditar.direccion     || '',
          estado:        clienteEditar.estado !== false,
        });
      } else {
        setForm(estadoInicial);
      }
      setErrores({});
    }
  }, [isOpen, clienteEditar, modoEdicion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validar = () => {
    const errs = {};
    if (!form.documento.trim()) {
      errs.documento = 'El número de documento es obligatorio';
    }
    if (!form.nombre.trim()) {
      errs.nombre = 'El nombre o razón social es obligatorio';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Ingrese un correo electrónico válido';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validar();
    if (Object.keys(validationErrors).length > 0) {
      setErrores(validationErrors);
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modoEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Fila: Tipo Doc y Número Doc */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
          <div>
            <label
              htmlFor="tipoDocumento"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '0.35rem',
                color: 'var(--text-main)',
              }}
            >
              Tipo Doc. *
            </label>
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            >
              {TIPOS_DOC.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Número de Documento *"
            name="documento"
            value={form.documento}
            onChange={handleChange}
            placeholder="Ej: 1020304050"
            error={errores.documento}
          />
        </div>

        {/* Fila: Nombre y Apellido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Nombre / Razón Social *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Carlos"
            error={errores.nombre}
          />
          <Input
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Ej: Gómez Pérez"
          />
        </div>

        {/* Fila: Teléfono y Correo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Teléfono / Celular"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ej: 3001234567"
          />
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="cliente@correo.com"
            error={errores.email}
          />
        </div>

        {/* Dirección */}
        <Input
          label="Dirección"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          placeholder="Ej: Calle 45 # 12-34, Barrio Centro"
        />

        {/* Estado activo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <input
            type="checkbox"
            id="clienteEstado"
            name="estado"
            checked={form.estado}
            onChange={handleChange}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="clienteEstado" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)' }}>
            Cliente Activo (habilitado para registrar ventas y facturación)
          </label>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Guardando...' : modoEdicion ? 'Actualizar Cliente' : 'Guardar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClienteForm;
