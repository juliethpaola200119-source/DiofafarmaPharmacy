/**
 * Componente: ProductoForm
 * 
 * Formulario reutilizable para Crear y Editar productos en DioFaFarma.
 * Utiliza Input.jsx y Button.jsx.
 * Implementa validaciones sin realizar llamadas HTTP directas.
 */

import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const ProductoForm = ({
  initialValues = null,
  onSubmit,
  modoEdicion = false,
  isLoading = false,
  onCancel = null
}) => {
  // Estado local del formulario respetando exactamente los nombres requeridos
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    laboratorio: '',
    precioCompra: '',
    precioVenta: '',
    stock: '',
    estado: true
  });

  // Estado de errores de validación por campo
  const [errors, setErrors] = useState({});

  // Cargar valores iniciales en modo edición o cuando cambian
  useEffect(() => {
    if (initialValues) {
      setFormData({
        id: initialValues.id,
        codigo: initialValues.codigo ?? '',
        nombre: initialValues.nombre ?? '',
        descripcion: initialValues.descripcion ?? '',
        laboratorio: initialValues.laboratorio ?? '',
        precioCompra: initialValues.precioCompra ?? '',
        precioVenta: initialValues.precioVenta ?? '',
        stock: initialValues.stock ?? '',
        estado: Boolean(initialValues.estado)
      });
    }
  }, [initialValues]);

  // Manejo de cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validaciones del formulario
  const validate = () => {
    const newErrors = {};

    // Código obligatorio
    if (!formData.codigo || !formData.codigo.trim()) {
      newErrors.codigo = 'El código del producto es obligatorio.';
    }

    // Nombre obligatorio
    if (!formData.nombre || !formData.nombre.trim()) {
      newErrors.nombre = 'El nombre comercial del producto es obligatorio.';
    }

    // Precio de compra válido (no negativo)
    const compra = Number(formData.precioCompra);
    if (formData.precioCompra === '' || isNaN(compra)) {
      newErrors.precioCompra = 'Ingrese un precio de compra numérico válido.';
    } else if (compra < 0) {
      newErrors.precioCompra = 'El precio de compra no puede ser negativo.';
    }

    // Precio de venta válido (no negativo)
    const venta = Number(formData.precioVenta);
    if (formData.precioVenta === '' || isNaN(venta)) {
      newErrors.precioVenta = 'Ingrese un precio de venta numérico válido.';
    } else if (venta < 0) {
      newErrors.precioVenta = 'El precio de venta no puede ser negativo.';
    } else if (compra >= 0 && venta < compra) {
      newErrors.precioVenta = 'El precio de venta no debería ser inferior al precio de compra.';
    }

    // Stock numérico y no negativo
    const stockNum = Number(formData.stock);
    if (formData.stock === '' || isNaN(stockNum)) {
      newErrors.stock = 'Ingrese una cantidad de stock válida.';
    } else if (!Number.isInteger(stockNum)) {
      newErrors.stock = 'El stock debe ser un número entero.';
    } else if (stockNum < 0) {
      newErrors.stock = 'El stock no puede ser un valor negativo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Entregar los datos normalizados a la página/hook
    onSubmit({
      ...formData,
      precioCompra: Number(formData.precioCompra),
      precioVenta: Number(formData.precioVenta),
      stock: Number(formData.stock),
      estado: Boolean(formData.estado)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
          {modoEdicion ? 'Modificar Producto Farmacéutico' : 'Registrar Nuevo Producto'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {modoEdicion
            ? 'Actualice los datos del medicamento en el inventario.'
            : 'Complete los campos obligatorios para dar de alta el medicamento en DioFaFarma.'}
        </p>
      </div>

      {/* Grid: Código y Nombre */}
      <div className="form-grid-2">
        <Input
          label="Código del Producto"
          name="codigo"
          placeholder="Ej: MED008"
          value={formData.codigo}
          onChange={handleChange}
          required
          error={errors.codigo}
          disabled={isLoading}
        />

        <Input
          label="Nombre del Producto"
          name="nombre"
          placeholder="Ej: Amoxicilina 500mg"
          value={formData.nombre}
          onChange={handleChange}
          required
          error={errors.nombre}
          disabled={isLoading}
        />
      </div>

      {/* Laboratorio y Descripción */}
      <div className="form-grid-2">
        <Input
          label="Laboratorio Fabricante"
          name="laboratorio"
          placeholder="Ej: Farmacéutica Andina"
          value={formData.laboratorio}
          onChange={handleChange}
          disabled={isLoading}
        />

        {/* Estado del Producto */}
        <div className="form-group">
          <label htmlFor="estado" className="form-label">
            Estado del Producto
          </label>
          <select
            id="estado"
            name="estado"
            className="form-select"
            value={formData.estado ? 'true' : 'false'}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                estado: e.target.value === 'true'
              }))
            }
            disabled={isLoading}
          >
            <option value="true">Activo (Disponible para comercialización)</option>
            <option value="false">Inactivo (Deshabilitado / Descontinuado)</option>
          </select>
          <span className="form-helper-text">
            Los productos inactivos no se ofrecen en ventas regulares.
          </span>
        </div>
      </div>

      {/* Descripción (TextArea) */}
      <Input
        label="Descripción / Indicaciones"
        name="descripcion"
        type="textarea"
        placeholder="Ej: Analgésico y antipirético para el alivio sintomático de dolores leves..."
        value={formData.descripcion}
        onChange={handleChange}
        disabled={isLoading}
      />

      {/* Grid: Precios y Stock */}
      <div className="form-grid-3" style={{ marginTop: '0.5rem' }}>
        <Input
          label="Precio de Compra ($)"
          name="precioCompra"
          type="number"
          step="any"
          min="0"
          placeholder="0"
          value={formData.precioCompra}
          onChange={handleChange}
          required
          error={errors.precioCompra}
          disabled={isLoading}
          helperText="Costo de adquisición"
        />

        <Input
          label="Precio de Venta ($)"
          name="precioVenta"
          type="number"
          step="any"
          min="0"
          placeholder="0"
          value={formData.precioVenta}
          onChange={handleChange}
          required
          error={errors.precioVenta}
          disabled={isLoading}
          helperText="Precio al público"
        />

        <Input
          label="Stock Inicial"
          name="stock"
          type="number"
          min="0"
          placeholder="0"
          value={formData.stock}
          onChange={handleChange}
          required
          error={errors.stock}
          disabled={isLoading}
          helperText="Unidades disponibles"
        />
      </div>

      {/* Acciones del Formulario */}
      <div className="form-actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading
            ? 'Guardando...'
            : modoEdicion
            ? 'Actualizar Producto'
            : 'Registrar Producto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductoForm;
