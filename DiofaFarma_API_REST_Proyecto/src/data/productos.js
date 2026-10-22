/**
 * Archivo de Datos en Memoria: Productos
 * Módulo: Data / Productos
 * 
 * Contiene el inventario inicial de productos farmacéuticos de DioFaFarma.
 * Los datos residen temporalmente en la memoria RAM del servidor.
 * Las operaciones CRUD (creación, edición, eliminación) modificarán este arreglo directamente.
 * 
 * Estructura del modelo de producto:
 * - id: number (Identificador único autoincremental)
 * - codigo: string (Código SKU/código único de barras o farmacia)
 * - nombre: string (Nombre comercial y concentración del medicamento)
 * - descripcion: string (Descripción farmacológica o presentación)
 * - laboratorio: string (Nombre del laboratorio fabricante o distribuidor)
 * - precioCompra: number (Precio unitario de adquisición)
 * - precioVenta: number (Precio unitario al público)
 * - stock: number (Existencias actuales en inventario)
 * - estado: boolean (true = activo/disponible, false = inactivo)
 */

const productos = [
  {
    id: 1,
    codigo: "MED001",
    nombre: "Acetaminofén 500mg",
    descripcion: "Analgésico",
    laboratorio: "Laboratorio Demo",
    precioCompra: 2000,
    precioVenta: 3500,
    stock: 50,
    estado: true
  },
  {
    id: 2,
    codigo: "MED002",
    nombre: "Ibuprofeno 400mg",
    descripcion: "Antiinflamatorio",
    laboratorio: "Laboratorio Demo",
    precioCompra: 2500,
    precioVenta: 4500,
    stock: 30,
    estado: true
  }
];

module.exports = productos;
