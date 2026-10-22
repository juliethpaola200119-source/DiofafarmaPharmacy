/**
 * Página: Reportes
 * Módulo: Pages / Reportes
 *
 * Centro de reportes y exportación en PDF para DioFaFarma.
 * Tipos de reporte:
 *   - productos   → Catálogo general de medicamentos
 *   - stock-bajo  → Medicamentos con stock crítico o agotado
 *   - ventas      → Reporte detallado de venta por código (precio, cantidad, IVA, subtotal, total)
 */

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import { reporteService } from '../services/reporteService';
import { ventaService } from '../services/ventaService';
import { formatCurrency } from '../utils/formatters';

// ──────────────────────────────────────────────
// Tipos de reporte disponibles
// ──────────────────────────────────────────────
const TIPOS_REPORTE = [
  { value: '',           label: '— Selecciona un tipo de reporte —' },
  { value: 'productos',  label: '💊 Reporte de Productos'           },
  { value: 'stock-bajo', label: '⚠ Reporte de Stock Crítico'        },
  { value: 'ventas',     label: '🛒 Reporte de Ventas'              },
];

// ──────────────────────────────────────────────
// Helpers de PDF
// ──────────────────────────────────────────────

/** Cabecera corporativa común */
const agregarCabeceraPDF = (doc, titulo) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(22, 93, 64); // verde corporativo farmacéutico
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DioFaFarma', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Sistema de Gestión Farmacéutica', 14, 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(titulo, pageWidth - 14, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const fecha = new Date().toLocaleString('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  doc.text(`Generado: ${fecha}`, pageWidth - 14, 19, { align: 'right' });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, 32, pageWidth - 14, 32);
};

/** Pie de página común */
const agregarPiePDF = (doc) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Página ${i} de ${totalPaginas}  ·  DioFaFarma © ${new Date().getFullYear()}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }
};

// ──────────────────────────────────────────────
// Generadores PDF
// ──────────────────────────────────────────────

const generarPDFProductos = (datos) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  agregarCabeceraPDF(doc, 'Reporte de Productos');

  autoTable(doc, {
    startY: 36,
    head: [['Código', 'Nombre', 'Laboratorio', 'Precio Compra', 'Precio Venta', 'Stock', 'Estado']],
    body: datos.map((p) => [
      p.codigo,
      p.nombre,
      p.laboratorio || 'N/A',
      formatCurrency(p.precio_compra),
      formatCurrency(p.precio_venta),
      Number(p.stock) === 0 ? '0 (Agotado)' : String(p.stock),
      Number(p.estado) === 1 ? 'Activo' : 'Inactivo',
    ]),
    headStyles: {
      fillColor: [22, 93, 64],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 250, 247] },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 60 },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 26, halign: 'center' },
      6: { cellWidth: 24, halign: 'center' },
    },
    margin: { top: 36, left: 14, right: 14, bottom: 16 },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.1,
  });

  agregarPiePDF(doc);
  doc.save(`DioFaFarma_Productos_${Date.now()}.pdf`);
};

const generarPDFStockBajo = (datos) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  agregarCabeceraPDF(doc, 'Reporte de Stock Crítico');

  autoTable(doc, {
    startY: 36,
    head: [['Código', 'Nombre', 'Laboratorio', 'Stock Actual', 'Precio Venta']],
    body: datos.map((p) => [
      p.codigo,
      p.nombre,
      p.laboratorio || 'N/A',
      Number(p.stock) === 0 ? 'AGOTADO' : `${p.stock} uds`,
      formatCurrency(p.precio_venta),
    ]),
    headStyles: {
      fillColor: [180, 60, 30],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [255, 248, 245] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.text[0] === 'AGOTADO') {
          data.cell.styles.textColor = [200, 30, 30];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 50 },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' },
    },
    margin: { top: 36, left: 14, right: 14, bottom: 16 },
  });

  agregarPiePDF(doc);
  doc.save(`DioFaFarma_StockCritico_${Date.now()}.pdf`);
};

/**
 * Genera el PDF detallado de Venta con estructura:
 * Código, Fecha, Cliente, Items (Código, Nombre, Precio, Cantidad, IVA, Subtotal, Total) y Resumen.
 */
const generarPDFVenta = (venta) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  agregarCabeceraPDF(doc, `Comprobante de Venta: ${venta.codigo}`);

  // Bloque con metadatos de la venta
  doc.setFillColor(248, 250, 248);
  doc.roundedRect(14, 36, pageWidth - 28, 24, 2, 2, 'F');
  doc.setDrawColor(220, 225, 220);
  doc.roundedRect(14, 36, pageWidth - 28, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  doc.text(`Código de Venta:`, 18, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(`${venta.codigo}`, 46, 43);

  doc.setFont('helvetica', 'bold');
  doc.text(`Fecha y Hora:`, 18, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${venta.fecha ? new Date(venta.fecha).toLocaleString('es-CO') : 'N/A'}`,
    46, 50
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`Cliente:`, 105, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(`${venta.clienteNombre} ${venta.clienteDoc ? `(${venta.clienteDoc})` : ''}`, 125, 43);

  doc.setFont('helvetica', 'bold');
  doc.text(`Método Pago:`, 105, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`${venta.tipoPago}  |  Estado: ${venta.estado}`, 125, 50);

  // Tabla con detalles: Precio, Cantidad, IVA, Subtotal y Total
  const items = venta.items || [];
  autoTable(doc, {
    startY: 64,
    head: [['Código', 'Medicamento', 'Precio Unit.', 'Cant.', 'IVA (19%)', 'Subtotal', 'Total']],
    body: items.map((i) => [
      i.codigoProducto,
      i.nombreProducto,
      formatCurrency(i.precioUnitario),
      String(i.cantidad),
      formatCurrency(i.iva),
      formatCurrency(i.subtotal),
      formatCurrency(i.total),
    ]),
    headStyles: {
      fillColor: [22, 93, 64],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 253, 251] },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14, bottom: 35 },
    tableLineColor: [225, 230, 225],
    tableLineWidth: 0.1,
  });

  // Resumen de totales
  const finalY = doc.lastAutoTable.finalY + 6;
  const resumenX = pageWidth - 80;

  doc.setFillColor(245, 248, 245);
  doc.roundedRect(resumenX - 4, finalY, 70, 26, 2, 2, 'F');
  doc.setDrawColor(210, 220, 210);
  doc.roundedRect(resumenX - 4, finalY, 70, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  doc.text(`Subtotal:`, resumenX, finalY + 6);
  doc.text(`${formatCurrency(venta.subtotal)}`, pageWidth - 18, finalY + 6, { align: 'right' });

  doc.text(`IVA (19%):`, resumenX, finalY + 13);
  doc.text(`${formatCurrency(venta.iva)}`, pageWidth - 18, finalY + 13, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(22, 93, 64);
  doc.text(`TOTAL:`, resumenX, finalY + 21);
  doc.text(`${formatCurrency(venta.total)}`, pageWidth - 18, finalY + 21, { align: 'right' });

  agregarPiePDF(doc);
  doc.save(`DioFaFarma_Venta_${venta.codigo}_${Date.now()}.pdf`);
};

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
const Reportes = () => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [datos, setDatos]                       = useState([]);
  const [ventaDetalle, setVentaDetalle]         = useState(null);
  const [loading, setLoading]                   = useState(false);
  const [generandoPDF, setGenerandoPDF]         = useState(false);
  const [error, setError]                       = useState(null);
  const [reporteCargado, setReporteCargado]     = useState(false);

  // Estados específicos para reporte de ventas
  const [listaCodigosVentas, setListaCodigosVentas] = useState([]);
  const [codigoVentaInput, setCodigoVentaInput]     = useState('');

  // Cargar lista de ventas cuando se selecciona el tipo 'ventas'
  useEffect(() => {
    if (tipoSeleccionado === 'ventas') {
      const cargarVentasDisponibles = async () => {
        try {
          const vtas = await ventaService.obtenerVentas();
          setListaCodigosVentas(vtas);
          if (vtas.length > 0 && !codigoVentaInput) {
            setCodigoVentaInput(vtas[0].codigo);
          }
        } catch {
          // Ignorar error inicial
        }
      };
      cargarVentasDisponibles();
    }
  }, [tipoSeleccionado]);

  // Carga los datos del reporte seleccionado
  const handleGenerarVista = async () => {
    if (!tipoSeleccionado) return;
    try {
      setLoading(true);
      setError(null);
      setReporteCargado(false);
      setDatos([]);
      setVentaDetalle(null);

      if (tipoSeleccionado === 'productos') {
        const resultado = await reporteService.getProductosActivos();
        setDatos(Array.isArray(resultado) ? resultado : []);
      } else if (tipoSeleccionado === 'stock-bajo') {
        const resultado = await reporteService.getStockBajo();
        setDatos(Array.isArray(resultado) ? resultado : []);
      } else if (tipoSeleccionado === 'ventas') {
        if (!codigoVentaInput.trim()) {
          throw new Error('Por favor ingrese o seleccione un código de venta');
        }
        const vta = await ventaService.obtenerVentaPorCodigo(codigoVentaInput.trim());
        setVentaDetalle(vta);
        setDatos(vta.items || []);
      }

      setReporteCargado(true);
    } catch (err) {
      setError(err.message || 'Error al cargar el reporte. Verifique los datos o la conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Genera y descarga el PDF
  const handleExportarPDF = () => {
    setGenerandoPDF(true);
    try {
      if (tipoSeleccionado === 'productos' && datos.length > 0) {
        generarPDFProductos(datos);
      } else if (tipoSeleccionado === 'stock-bajo' && datos.length > 0) {
        generarPDFStockBajo(datos);
      } else if (tipoSeleccionado === 'ventas' && ventaDetalle) {
        generarPDFVenta(ventaDetalle);
      }
    } finally {
      setGenerandoPDF(false);
    }
  };

  const labelTipo = TIPOS_REPORTE.find((t) => t.value === tipoSeleccionado)?.label ?? '';

  return (
    <div className="home-page">
      {/* ── Encabezado ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
          📊 Centro de Reportes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Selecciona el tipo de reporte que deseas generar, visualiza los datos en pantalla y expórtalos en PDF.
        </p>
      </div>

      {/* ── Panel de selección ── */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Dropdown de tipo de reporte */}
        <div style={{ flex: '1 1 260px' }}>
          <label
            htmlFor="tipo-reporte"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--text-main)',
              marginBottom: '0.4rem',
            }}
          >
            Tipo de Reporte
          </label>
          <select
            id="tipo-reporte"
            value={tipoSeleccionado}
            onChange={(e) => {
              setTipoSeleccionado(e.target.value);
              setReporteCargado(false);
              setDatos([]);
              setVentaDetalle(null);
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem',
              fontSize: '0.9rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-base)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {TIPOS_REPORTE.map((t) => (
              <option key={t.value} value={t.value} disabled={t.value === ''}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campo adicional cuando se selecciona Reporte de Ventas: Selección por código */}
        {tipoSeleccionado === 'ventas' && (
          <div style={{ flex: '1 1 280px' }}>
            <label
              htmlFor="codigo-venta"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                marginBottom: '0.4rem',
              }}
            >
              Código de Venta
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="codigo-venta"
                type="text"
                placeholder="Ej: VTA-2026-0001"
                value={codigoVentaInput}
                onChange={(e) => setCodigoVentaInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
              {listaCodigosVentas.length > 0 && (
                <select
                  value={codigoVentaInput}
                  onChange={(e) => setCodigoVentaInput(e.target.value)}
                  style={{
                    maxWidth: '130px',
                    padding: '0.55rem 0.5rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                  title="Seleccionar de la lista de ventas registradas"
                >
                  <option value="">Recientes...</option>
                  {listaCodigosVentas.map((v) => (
                    <option key={v.id} value={v.codigo}>
                      {v.codigo}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={handleGenerarVista}
            disabled={!tipoSeleccionado || loading}
          >
            {loading ? 'Cargando...' : '🔍 Generar Vista'}
          </Button>

          {reporteCargado && (datos.length > 0 || ventaDetalle) && (
            <Button
              variant="success"
              onClick={handleExportarPDF}
              disabled={generandoPDF}
            >
              {generandoPDF ? 'Generando...' : '📄 Exportar PDF'}
            </Button>
          )}
        </div>
      </div>

      {/* ── Mensajes de estado ── */}
      {error && <Alert type="error" message={error} />}
      {loading && <Loading text="Cargando datos del reporte..." />}

      {/* ── Contenedor de Resultados ── */}
      {!loading && reporteCargado && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Cabecera del reporte */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {labelTipo} {ventaDetalle ? `— ${ventaDetalle.codigo}` : ''}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {tipoSeleccionado === 'ventas'
                  ? `Comprobante de venta emitida el ${ventaDetalle?.fecha ? new Date(ventaDetalle.fecha).toLocaleString('es-CO') : '—'}`
                  : `${datos.length} registro${datos.length !== 1 ? 's' : ''} encontrado${datos.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {(datos.length > 0 || ventaDetalle) && (
              <Button variant="success" size="sm" onClick={handleExportarPDF} disabled={generandoPDF}>
                {generandoPDF ? 'Generando...' : '📄 Exportar PDF'}
              </Button>
            )}
          </div>

          {/* ── VISTA REPORTE: VENTAS (POR CÓDIGO) ── */}
          {tipoSeleccionado === 'ventas' && ventaDetalle && (
            <div>
              {/* Tarjeta de información de la venta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-base)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Código Venta:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{ventaDetalle.codigo}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Cliente:</span>
                  <strong>{ventaDetalle.clienteNombre}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Documento:</span>
                  <strong>{ventaDetalle.clienteDoc || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Método de Pago:</span>
                  <strong>{ventaDetalle.tipoPago}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Estado:</span>
                  <span className={`badge ${ventaDetalle.estado === 'Completada' ? 'badge-active' : 'badge-inactive'}`}>
                    <span className="badge-dot" />
                    {ventaDetalle.estado}
                  </span>
                </div>
              </div>

              {/* Tabla de items con: Precio, Cantidad, IVA, Subtotal y Total */}
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="table-main">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Medicamento</th>
                      <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                      <th style={{ textAlign: 'center' }}>Cantidad</th>
                      <th style={{ textAlign: 'right' }}>IVA (19%)</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.codigoProducto}</td>
                        <td style={{ fontWeight: '600' }}>{item.nombreProducto}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.precioUnitario)}</td>
                        <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(item.iva)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Desglose financiero al pie */}
              <div
                style={{
                  backgroundColor: 'var(--bg-base)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '2rem',
                  marginTop: '1.25rem',
                  borderTop: '2px solid var(--border-color)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Subtotal:</span>
                  <strong style={{ fontSize: '0.95rem' }}>{formatCurrency(ventaDetalle.subtotal)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>IVA (19%):</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-warning)' }}>{formatCurrency(ventaDetalle.iva)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total de Venta:</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{formatCurrency(ventaDetalle.total)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ── VISTA REPORTE: PRODUCTOS ── */}
          {tipoSeleccionado === 'productos' && (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="table-main">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Laboratorio</th>
                    <th style={{ textAlign: 'right' }}>Precio Compra</th>
                    <th style={{ textAlign: 'right' }}>Precio Venta</th>
                    <th style={{ textAlign: 'center' }}>Stock</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{p.codigo}</td>
                      <td style={{ fontWeight: '600' }}>{p.nombre}</td>
                      <td>{p.laboratorio || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(p.precio_compra)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(p.precio_venta)}</td>
                      <td style={{ textAlign: 'center' }}>{p.stock}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${Number(p.estado) === 1 ? 'badge-active' : 'badge-inactive'}`}>
                          <span className="badge-dot" />
                          {Number(p.estado) === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── VISTA REPORTE: STOCK CRÍTICO ── */}
          {tipoSeleccionado === 'stock-bajo' && (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="table-main">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Laboratorio</th>
                    <th style={{ textAlign: 'center' }}>Stock Actual</th>
                    <th style={{ textAlign: 'right' }}>Precio Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{p.codigo}</td>
                      <td style={{ fontWeight: '600' }}>{p.nombre}</td>
                      <td>{p.laboratorio || 'N/A'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${Number(p.stock) === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          <span className="badge-dot" />
                          {Number(p.stock) === 0 ? 'Agotado' : `${p.stock} uds`}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(p.precio_venta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reportes;
