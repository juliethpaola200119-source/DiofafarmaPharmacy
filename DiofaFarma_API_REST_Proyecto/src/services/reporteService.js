/**
 * Servicio: Módulo de Reportes
 *
 * Lógica de negocio y consultas SQL para el módulo de reportes de DioFaFarma.
 * Cada función ejecuta una query directa contra la base de datos MySQL.
 *
 * Métodos:
 *   getResumen()            → Totales generales del sistema
 *   getStockBajo(umbral)    → Productos con stock ≤ umbral
 *   getProductosActivos()   → Catálogo de productos activos con precios
 */

const { pool } = require('../database/db');

/**
 * Resumen general del sistema.
 * Devuelve: totalProductos, productosActivos, productosStockBajo, totalUsuarios.
 */
const getResumen = async () => {
  const [[resProductos]] = await pool.query(`
    SELECT
      COUNT(*)                                      AS totalProductos,
      SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END)  AS productosActivos,
      SUM(CASE WHEN stock <= 10 AND estado = 1 THEN 1 ELSE 0 END) AS productosStockBajo
    FROM productos
  `);

  const [[resUsuarios]] = await pool.query(`
    SELECT COUNT(*) AS totalUsuarios FROM usuarios WHERE estado = 1
  `);

  return {
    totalProductos:      Number(resProductos.totalProductos),
    productosActivos:    Number(resProductos.productosActivos),
    productosStockBajo:  Number(resProductos.productosStockBajo),
    totalUsuarios:       Number(resUsuarios.totalUsuarios),
  };
};

/**
 * Productos con stock ≤ umbral (por defecto 10).
 * @param {number} umbral
 */
const getStockBajo = async (umbral = 10) => {
  const [rows] = await pool.query(
    `SELECT id, codigo, nombre, laboratorio, stock, precio_venta
     FROM productos
     WHERE stock <= ? AND estado = 1
     ORDER BY stock ASC, nombre ASC`,
    [Number(umbral)]
  );
  return rows;
};

/**
 * Catálogo completo de productos con código, nombre, laboratorio,
 * precio_compra, precio_venta, stock y estado.
 */
const getProductosActivos = async () => {
  const [rows] = await pool.query(`
    SELECT id, codigo, nombre, laboratorio, precio_compra, precio_venta, stock, estado
    FROM productos
    ORDER BY nombre ASC
  `);
  return rows;
};

module.exports = {
  getResumen,
  getStockBajo,
  getProductosActivos,
};
