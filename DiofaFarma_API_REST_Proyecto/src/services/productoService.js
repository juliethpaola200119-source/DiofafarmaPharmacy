/**
 * Servicio de Productos
 * Módulo: Services / ProductoService
 *
 * Contiene la lógica de negocio para la gestión de productos farmacéuticos.
 * Opera sobre la tabla `productos` en MySQL mediante consultas parametrizadas.
 * Realiza validaciones estrictas de tipos de datos, valores numéricos,
 * obligatoriedad y unicidad del código de producto.
 *
 * NOTA DE MAPEO:
 *   MySQL usa snake_case  (precio_compra, precio_venta)
 *   React  usa camelCase  (precioCompra,  precioVenta)
 *   El mapeo se realiza aquí para no afectar al frontend ni a los controladores.
 */

require("dotenv").config();
const { pool } = require("../database/db");

/**
 * Convierte una fila de MySQL (snake_case) al formato esperado por React (camelCase).
 * @param {Object} row Fila de la base de datos
 * @returns {Object} Producto en formato camelCase
 */
function mapRowToProducto(row) {
  return {
    id:           row.id,
    codigo:       row.codigo,
    nombre:       row.nombre,
    descripcion:  row.descripcion  || "",
    laboratorio:  row.laboratorio  || "",
    precioCompra: Number(row.precio_compra),
    precioVenta:  Number(row.precio_venta),
    stock:        Number(row.stock),
    estado:       row.estado === 1 || row.estado === true
  };
}

class ProductoService {
  /**
   * Retorna todos los productos de la base de datos.
   * @returns {Promise<Array>} Lista completa de productos
   */
  async listarProductos() {
    const [rows] = await pool.execute(
      "SELECT id, codigo, nombre, descripcion, laboratorio, precio_compra, precio_venta, stock, estado FROM productos ORDER BY id ASC"
    );
    return rows.map(mapRowToProducto);
  }

  /**
   * Consulta un producto específico por su ID.
   * @param {number|string} id Identificador numérico del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  async obtenerProductoPorId(id) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
      const error = new Error("El ID proporcionado no es válido");
      error.status = 400;
      throw error;
    }

    const [rows] = await pool.execute(
      "SELECT id, codigo, nombre, descripcion, laboratorio, precio_compra, precio_venta, stock, estado FROM productos WHERE id = ?",
      [numId]
    );

    if (rows.length === 0) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    return mapRowToProducto(rows[0]);
  }

  /**
   * Valida y sanitiza los campos de un producto.
   * Acepta tanto camelCase (desde React) como snake_case (compatibilidad).
   *
   * @param {Object} datos Datos recibidos en la petición
   * @param {boolean} esActualizacion Indica si es una actualización
   * @param {number|null} idActual ID del producto que se está actualizando
   * @returns {Promise<Object>} Datos validados en snake_case para MySQL
   */
  async _validarDatosProducto(datos, esActualizacion = false, idActual = null) {
    if (!datos || typeof datos !== "object") {
      const error = new Error("Los datos del producto son obligatorios");
      error.status = 400;
      throw error;
    }

    const {
      codigo,
      nombre,
      descripcion,
      laboratorio,
      // Acepta tanto camelCase (React) como snake_case (compatibilidad)
      precioCompra,
      precioVenta,
      precio_compra,
      precio_venta,
      stock,
      estado
    } = datos;

    // Resolver precio usando camelCase primero, luego snake_case
    const compra = precioCompra !== undefined ? precioCompra : precio_compra;
    const venta  = precioVenta  !== undefined ? precioVenta  : precio_venta;

    // Validación de código
    if (!codigo || typeof codigo !== "string" || codigo.trim() === "") {
      const error = new Error("El código del producto es obligatorio");
      error.status = 400;
      throw error;
    }

    // Validación de nombre
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      const error = new Error("El nombre del producto es obligatorio");
      error.status = 400;
      throw error;
    }

    // Validación de precioCompra
    const numCompra = Number(compra);
    if (compra === undefined || compra === null || isNaN(numCompra) || numCompra < 0) {
      const error = new Error("El precio de compra debe ser un número válido mayor o igual a 0");
      error.status = 400;
      throw error;
    }

    // Validación de precioVenta
    const numVenta = Number(venta);
    if (venta === undefined || venta === null || isNaN(numVenta) || numVenta < 0) {
      const error = new Error("El precio de venta debe ser un número válido mayor o igual a 0");
      error.status = 400;
      throw error;
    }

    // Validación de stock
    const numStock = Number(stock);
    if (stock === undefined || stock === null || isNaN(numStock) || numStock < 0) {
      const error = new Error("El stock debe ser un número válido mayor o igual a 0");
      error.status = 400;
      throw error;
    }

    // Validación de estado
    const estadoBool =
      estado === true  || estado === "true"  || estado === 1 || estado === "1"  ? 1 :
      estado === false || estado === "false" || estado === 0 || estado === "0" ? 0 :
      null;

    if (estadoBool === null) {
      const error = new Error("El estado debe ser un valor booleano (true o false)");
      error.status = 400;
      throw error;
    }

    // Validación de unicidad de código en MySQL
    const codigoLimpio = codigo.trim().toUpperCase();

    let query = "SELECT id FROM productos WHERE UPPER(codigo) = ?";
    const params = [codigoLimpio];

    if (esActualizacion && idActual) {
      query += " AND id != ?";
      params.push(idActual);
    }

    const [rows] = await pool.execute(query, params);

    if (rows.length > 0) {
      const error = new Error("El código del producto ya existe");
      error.status = 409;
      throw error;
    }

    return {
      codigo:        codigo.trim(),
      nombre:        nombre.trim(),
      descripcion:   descripcion != null ? String(descripcion).trim() : "",
      laboratorio:   laboratorio != null ? String(laboratorio).trim() : "",
      precio_compra: numCompra,
      precio_venta:  numVenta,
      stock:         Math.floor(numStock),
      estado:        estadoBool
    };
  }

  /**
   * Crea un nuevo producto en la base de datos.
   * @param {Object} datosProducto Datos del producto a crear (camelCase o snake_case)
   * @returns {Promise<Object>} Producto creado con su ID generado
   */
  async crearProducto(datosProducto) {
    const datos = await this._validarDatosProducto(datosProducto, false);

    const [result] = await pool.execute(
      `INSERT INTO productos (codigo, nombre, descripcion, laboratorio, precio_compra, precio_venta, stock, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.codigo,
        datos.nombre,
        datos.descripcion,
        datos.laboratorio,
        datos.precio_compra,
        datos.precio_venta,
        datos.stock,
        datos.estado
      ]
    );

    // Retornar el producto recién creado con su ID
    return this.obtenerProductoPorId(result.insertId);
  }

  /**
   * Actualiza un producto existente en la base de datos.
   * @param {number|string} id Identificador del producto
   * @param {Object} datosProducto Datos a actualizar (camelCase o snake_case)
   * @returns {Promise<Object>} Producto actualizado
   */
  async actualizarProducto(id, datosProducto) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
      const error = new Error("El ID proporcionado no es válido");
      error.status = 400;
      throw error;
    }

    // Verificar que el producto existe
    const [existente] = await pool.execute(
      "SELECT id FROM productos WHERE id = ?",
      [numId]
    );

    if (existente.length === 0) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const datos = await this._validarDatosProducto(datosProducto, true, numId);

    await pool.execute(
      `UPDATE productos
       SET codigo = ?, nombre = ?, descripcion = ?, laboratorio = ?,
           precio_compra = ?, precio_venta = ?, stock = ?, estado = ?
       WHERE id = ?`,
      [
        datos.codigo,
        datos.nombre,
        datos.descripcion,
        datos.laboratorio,
        datos.precio_compra,
        datos.precio_venta,
        datos.stock,
        datos.estado,
        numId
      ]
    );

    return this.obtenerProductoPorId(numId);
  }

  /**
   * Elimina un producto de la base de datos.
   * @param {number|string} id Identificador del producto
   * @returns {Promise<boolean>} true si fue eliminado
   */
  async eliminarProducto(id) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
      const error = new Error("El ID proporcionado no es válido");
      error.status = 400;
      throw error;
    }

    const [result] = await pool.execute(
      "DELETE FROM productos WHERE id = ?",
      [numId]
    );

    if (result.affectedRows === 0) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    return true;
  }
}

module.exports = new ProductoService();
