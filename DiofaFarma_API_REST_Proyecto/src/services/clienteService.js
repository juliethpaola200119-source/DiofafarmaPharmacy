/**
 * Servicio de Gestión de Clientes
 * Módulo: Services / ClienteService
 *
 * Contiene la lógica de negocio para el ciclo de vida CRUD de clientes de la droguería.
 * Opera sobre la tabla `clientes` en MySQL mediante consultas parametrizadas.
 * Valida unicidad de documento, campos obligatorios y formato.
 *
 * Mapeo:
 *   BD MySQL (snake_case) → React (camelCase)
 */

const { pool } = require("../database/db");

/**
 * Mapea una fila de MySQL (snake_case) al objeto de cliente para React (camelCase).
 * @param {Object} row
 * @returns {Object}
 */
function mapRowToCliente(row) {
  return {
    id:            row.id,
    tipoDocumento: row.tipo_documento || "CC",
    documento:     row.documento,
    nombre:        row.nombre,
    apellido:      row.apellido || "",
    telefono:      row.telefono || "",
    email:         row.email    || "",
    direccion:     row.direccion || "",
    estado:        row.estado === 1 || row.estado === true,
    creadoEn:      row.creado_en ? new Date(row.creado_en).toISOString() : null,
    actualizadoEn: row.actualizado_en ? new Date(row.actualizado_en).toISOString() : null
  };
}

class ClienteService {
  /**
   * Retorna el listado completo de clientes, opcionalmente filtrados por búsqueda.
   * @param {string} [busqueda] - Término de búsqueda (documento, nombre, apellido)
   * @returns {Promise<Array>}
   */
  async listarClientes(busqueda = "") {
    let sql = `
      SELECT id, tipo_documento, documento, nombre, apellido, telefono, email, direccion, estado, creado_en, actualizado_en
      FROM clientes
    `;
    const params = [];

    if (busqueda && busqueda.trim()) {
      sql += ` WHERE documento LIKE ? OR nombre LIKE ? OR apellido LIKE ?`;
      const term = `%${busqueda.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY id DESC`;

    const [rows] = await pool.query(sql, params);
    return rows.map(mapRowToCliente);
  }

  /**
   * Obtiene un cliente por su ID numérico.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async obtenerClientePorId(id) {
    const numId = Number(id);
    if (!numId || numId <= 0 || !Number.isInteger(numId)) {
      const error = new Error("El ID proporcionado no es válido");
      error.status = 400;
      throw error;
    }

    const [rows] = await pool.query(
      `SELECT id, tipo_documento, documento, nombre, apellido, telefono, email, direccion, estado, creado_en, actualizado_en
       FROM clientes WHERE id = ?`,
      [numId]
    );

    if (rows.length === 0) {
      const error = new Error(`No se encontró ningún cliente con el ID ${numId}`);
      error.status = 404;
      throw error;
    }

    return mapRowToCliente(rows[0]);
  }

  /**
   * Crea un nuevo cliente en el sistema.
   * @param {Object} datos
   * @returns {Promise<Object>} Cliente creado con ID asignado
   */
  async crearCliente(datos) {
    const {
      tipoDocumento = "CC",
      documento,
      nombre,
      apellido = "",
      telefono = "",
      email = "",
      direccion = "",
      estado = true
    } = datos;

    if (!documento || !documento.trim()) {
      const error = new Error("El documento del cliente es obligatorio");
      error.status = 400;
      throw error;
    }

    if (!nombre || !nombre.trim()) {
      const error = new Error("El nombre del cliente es obligatorio");
      error.status = 400;
      throw error;
    }

    // Verificar si el documento ya está registrado
    const [existente] = await pool.query(
      "SELECT id FROM clientes WHERE documento = ?",
      [documento.trim()]
    );

    if (existente.length > 0) {
      const error = new Error(`Ya existe un cliente registrado con el documento ${documento}`);
      error.status = 409;
      throw error;
    }

    const estadoNum = (estado === true || estado === "true" || estado === 1 || estado === "1") ? 1 : 0;

    const [result] = await pool.query(
      `INSERT INTO clientes (tipo_documento, documento, nombre, apellido, telefono, email, direccion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipoDocumento.trim().toUpperCase(),
        documento.trim(),
        nombre.trim(),
        apellido ? apellido.trim() : "",
        telefono ? telefono.trim() : "",
        email ? email.trim().toLowerCase() : "",
        direccion ? direccion.trim() : "",
        estadoNum
      ]
    );

    return this.obtenerClientePorId(result.insertId);
  }

  /**
   * Actualiza los datos de un cliente existente.
   * @param {number|string} id
   * @param {Object} datos
   * @returns {Promise<Object>} Cliente actualizado
   */
  async actualizarCliente(id, datos) {
    const clienteActual = await this.obtenerClientePorId(id);

    const {
      tipoDocumento = clienteActual.tipoDocumento,
      documento     = clienteActual.documento,
      nombre        = clienteActual.nombre,
      apellido      = clienteActual.apellido,
      telefono      = clienteActual.telefono,
      email         = clienteActual.email,
      direccion     = clienteActual.direccion,
      estado        = clienteActual.estado
    } = datos;

    if (!documento || !documento.trim()) {
      const error = new Error("El documento del cliente es obligatorio");
      error.status = 400;
      throw error;
    }

    if (!nombre || !nombre.trim()) {
      const error = new Error("El nombre del cliente es obligatorio");
      error.status = 400;
      throw error;
    }

    // Si cambió el documento, verificar que no lo use otro cliente
    if (documento.trim() !== clienteActual.documento) {
      const [duplicado] = await pool.query(
        "SELECT id FROM clientes WHERE documento = ? AND id != ?",
        [documento.trim(), clienteActual.id]
      );
      if (duplicado.length > 0) {
        const error = new Error(`El documento ${documento} ya está en uso por otro cliente`);
        error.status = 409;
        throw error;
      }
    }

    const estadoNum = (estado === true || estado === "true" || estado === 1 || estado === "1") ? 1 : 0;

    await pool.query(
      `UPDATE clientes
       SET tipo_documento = ?, documento = ?, nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, estado = ?
       WHERE id = ?`,
      [
        tipoDocumento.trim().toUpperCase(),
        documento.trim(),
        nombre.trim(),
        apellido ? apellido.trim() : "",
        telefono ? telefono.trim() : "",
        email ? email.trim().toLowerCase() : "",
        direccion ? direccion.trim() : "",
        estadoNum,
        clienteActual.id
      ]
    );

    return this.obtenerClientePorId(clienteActual.id);
  }

  /**
   * Elimina un cliente por su ID.
   * @param {number|string} id
   * @returns {Promise<boolean>}
   */
  async eliminarCliente(id) {
    const cliente = await this.obtenerClientePorId(id);

    await pool.query("DELETE FROM clientes WHERE id = ?", [cliente.id]);
    return true;
  }
}

module.exports = new ClienteService();
