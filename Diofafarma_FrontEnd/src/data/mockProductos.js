/**
 * Datos iniciales simulados (Mock Data) para DioFaFarma.
 * Permiten probar completamente la interfaz mientras el backend Java se desarrolla.
 */

export const MOCK_PRODUCTOS = [
  {
    id: 1,
    codigo: 'MED001',
    nombre: 'Acetaminofén 500mg',
    descripcion: 'Analgésico y antipirético para alivio de dolores leves a moderados.',
    laboratorio: 'Laboratorio Genéricos S.A.',
    precioCompra: 2000,
    precioVenta: 3500,
    stock: 50,
    estado: true
  },
  {
    id: 2,
    codigo: 'MED002',
    nombre: 'Amoxicilina 500mg Cápsulas',
    descripcion: 'Antibiótico de amplio espectro para infecciones respiratorias.',
    laboratorio: 'Farmacéutica Andina',
    precioCompra: 8500,
    precioVenta: 14000,
    stock: 8, // Stock bajo
    estado: true
  },
  {
    id: 3,
    codigo: 'MED003',
    nombre: 'Ibuprofeno 400mg',
    descripcion: 'Antiinflamatorio no esteroideo (AINE) para inflamación y dolor.',
    laboratorio: 'Laboratorios Sanitas',
    precioCompra: 3200,
    precioVenta: 5800,
    stock: 35,
    estado: true
  },
  {
    id: 4,
    codigo: 'MED004',
    nombre: 'Loratadina 10mg',
    descripcion: 'Antihistamínico para alergias estacionales y rinitis alérgica.',
    laboratorio: 'BioFarma Global',
    precioCompra: 1800,
    precioVenta: 3200,
    stock: 0, // Sin stock
    estado: true
  },
  {
    id: 5,
    codigo: 'MED005',
    nombre: 'Omeprazol 20mg Cápsulas',
    descripcion: 'Inhibidor de la bomba de protones para reflujo gástrico y acidez.',
    laboratorio: 'Farmacéutica Andina',
    precioCompra: 4500,
    precioVenta: 7500,
    stock: 22,
    estado: true
  },
  {
    id: 6,
    codigo: 'MED006',
    nombre: 'Losartán Potásico 50mg',
    descripcion: 'Antihipertensivo indicado para el tratamiento de la hipertensión arterial.',
    laboratorio: 'Laboratorio Genéricos S.A.',
    precioCompra: 6000,
    precioVenta: 10500,
    stock: 5, // Stock bajo
    estado: true
  },
  {
    id: 7,
    codigo: 'MED007',
    nombre: 'Jarabe para la Tos con Hedera Helix',
    descripcion: 'Expectorante natural para el alivio de la tos con flema.',
    laboratorio: 'NaturSalud Pharma',
    precioCompra: 11000,
    precioVenta: 18900,
    stock: 14,
    estado: false // Inactivo
  }
];
