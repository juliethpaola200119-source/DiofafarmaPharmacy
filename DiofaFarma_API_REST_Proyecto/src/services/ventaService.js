/**
 * Servicio de Gestión de Ventas
 * Módulo: Services / VentaService
 *
 * Contiene la lógica de negocio para registrar ventas, calcular totales (precio, cantidad, IVA, subtotal, total),
 * descontar stock de productos mediante transacciones SQL y proveer consultas con detalles.
 */

const { pool } = require("../database/db");

/**
 * Normaliza una venta desde la fila de la base de datos a formato camelCase.
 */
function mapVenta(row) {
  return {
    id:            row.id,
    codigo:        row.codigo,
    clienteId:     row.cliente_id,
    clienteNombre: row.cliente_nombre ? `${row.cliente_nombre} ${row.cliente_apellido || ''}`.trim() : 'Cliente Ocasional',
    clienteDoc:    row.cliente_doc || '',
    usuarioId:     row.usuario_id,
    tipoPago:      row.tipo_pago || 'Efectivo',
    subtotal:      Number(row.subtotal || 0),
    iva:           Number(row.iva || 0),
    total:         Number(row.total || 0),
    estado:        row.estado || 'Completada',
    observaciones: row.observaciones || '',
    fecha:         row.fecha ? new Date(row.fecha).toISOString() : null,
  };
}

/**
 * Normaliza un item de detalle de venta.
 */
function mapDetalle(row) {
  return {
    id:             row.id,
    ventaId:        row.venta_id,
    productoId:     row.producto_id,
    codigoProducto: row.codigo_producto,
    nombreProducto: row.nombre_producto,
    cantidad:       Number(row.cantidad),
    precioUnitario: Number(row.precio_unitario),
    iva:            Number(row.iva),
    subtotal:       Number(row.subtotal),
    total:          Number(row.total),
  };
}

class VentaService {
  /**
   * Genera el siguiente código correlativo de venta.
   * Formato: VTA-YYYYMM-XXXX
   */
  async generarCodigoVenta(connection) {
    const conn = connection || pool;
    const date = new Date();
    const prefijo = `VTA-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;

    const [rows] = await conn.query(
      "SELECT codigo FROM ventas WHERE codigo LIKE ? ORDER BY id DESC LIMIT 1",
      [`${prefijo}-%`]
    );

    let correlativo = 1;
    if (rows.length > 0) {
      const partes = rows[0].codigo.split('-');
      const ultimo = parseInt(partes[partes.length - 1], 10);
      if (!isNaN(ultimo)) correlativo = ultimo + 1;
    }

    return `${prefijo}-${String(correlativo).padStart(4, '0')}`;
  }

  /**
   * Lista todas las ventas con información de su cliente.
   * @param {string} [busqueda]
   */
  async listarVentas(busqueda = '') {
    let sql = `
      SELECT v.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.documento AS cliente_doc
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
    `;
    const params = [];

    if (busqueda && busqueda.trim()) {
      sql += ` WHERE v.codigo LIKE ? OR c.nombre LIKE ? OR c.documento LIKE ?`;
      const term = `%${busqueda.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY v.id DESC`;

    const [rows] = await pool.query(sql, params);
    return rows.map(mapVenta);
  }

  /**
   * Obtiene una venta por su ID con todo su detalle de productos.
   * @param {number|string} id
   */
  async obtenerVentaPorId(id) {
    const numId = Number(id);
    if (!numId || numId <= 0) {
      const error = new Error("El ID de venta no es válido");
      error.status = 400;
      throw error;
    }

    const [rows] = await pool.query(`
      SELECT v.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.documento AS cliente_doc, c.telefono AS cliente_tel, c.email AS cliente_email, c.direccion AS cliente_dir
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = ?
    `, [numId]);

    if (rows.length === 0) {
      const error = new Error(`No se encontró la venta con ID ${numId}`);
      error.status = 404;
      throw error;
    }

    const venta = mapVenta(rows[0]);
    venta.clienteTelefono = rows[0].cliente_tel || '';
    venta.clienteEmail    = rows[0].cliente_email || '';
    venta.clienteDireccion= rows[0].cliente_dir || '';

    const [detalles] = await pool.query(
      "SELECT * FROM detalle_ventas WHERE venta_id = ? ORDER BY id ASC",
      [numId]
    );

    venta.items = detalles.map(mapDetalle);
    return venta;
  }

  /**
   * Obtiene una venta completa por su CÓDIGO (usado especialmente por el módulo de Reportes).
   * @param {string} codigo
   */
  async obtenerVentaPorCodigo(codigo) {
    if (!codigo || !codigo.trim()) {
      const error = new Error("El código de venta es obligatorio");
      error.status = 400;
      throw error;
    }

    const [rows] = await pool.query(`
      SELECT v.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.documento AS cliente_doc, c.telefono AS cliente_tel, c.email AS cliente_email, c.direccion AS cliente_dir
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.codigo = ?
    `, [codigo.trim()]);

    if (rows.length === 0) {
      const error = new Error(`No se encontró ninguna venta con el código ${codigo.trim()}`);
      error.status = 404;
      throw error;
    }

    const venta = mapVenta(rows[0]);
    venta.clienteTelefono = rows[0].cliente_tel || '';
    venta.clienteEmail    = rows[0].cliente_email || '';
    venta.clienteDireccion= rows[0].cliente_dir || '';

    const [detalles] = await pool.query(
      "SELECT * FROM detalle_ventas WHERE venta_id = ? ORDER BY id ASC",
      [venta.id]
    );

    venta.items = detalles.map(mapDetalle);
    return venta;
  }

  /**
   * Registra una nueva venta de productos con transacción SQL.
   * Descuenta stock en la tabla productos.
   * @param {Object} datos
   * @param {number} usuarioId
   */
  async crearVenta(datos, usuarioId = null) {
    const {
      clienteId = null,
      tipoPago = 'Efectivo',
      observaciones = '',
      items = []
    } = datos;

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("La venta debe contener al menos un producto");
      error.status = 400;
      throw error;
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let subtotalGeneral = 0;
      let ivaGeneral = 0;
      let totalGeneral = 0;
      const itemsProcesados = [];

      for (const item of items) {
        const pId = Number(item.productoId);
        const cant = Number(item.cantidad);

        if (!pId || cant <= 0) {
          const err = new Error("Cada producto debe tener un ID válido y cantidad mayor a cero");
          err.status = 400;
          throw err;
        }

        // Consultar producto actual y verificar stock
        const [prodRows] = await connection.query(
          "SELECT id, codigo, nombre, precio_venta, stock, estado FROM productos WHERE id = ? FOR UPDATE",
          [pId]
        );

        if (prodRows.length === 0) {
          const err = new Error(`El producto con ID ${pId} no existe`);
          err.status = 404;
          throw err;
        }

        const producto = prodRows[0];

        if (Number(producto.estado) === 0) {
          const err = new Error(`El producto "${producto.nombre}" se encuentra inactivo`);
          err.status = 400;
          throw err;
        }

        if (Number(producto.stock) < cant) {
          const err = new Error(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${cant}`);
          err.status = 400;
          throw err;
        }

        const precioUnitario = Number(item.precioUnitario ?? producto.precio_venta);
        const subtotalItem   = precioUnitario * cant;
        // Tasa de IVA por defecto 19% si no se especifica
        const tasaIva        = item.tasaIva !== undefined ? Number(item.tasaIva) : 0.19;
        const ivaItem        = Math.round(subtotalItem * tasaIva);
        const totalItem      = subtotalItem + ivaItem;

        subtotalGeneral += subtotalItem;
        ivaGeneral      += ivaItem;
        totalGeneral    += totalItem;

        itemsProcesados.push({
          productoId:     producto.id,
          codigoProducto: producto.codigo,
          nombreProducto: producto.nombre,
          cantidad:       cant,
          precioUnitario,
          iva:            ivaItem,
          subtotal:       subtotalItem,
          total:          totalItem
        });

        // Descontar stock
        await connection.query(
          "UPDATE productos SET stock = stock - ? WHERE id = ?",
          [cant, producto.id]
        );
      }

      // Generar código de venta
      const codigoVenta = await this.generarCodigoVenta(connection);

      // Insertar encabezado de venta
      const [resVenta] = await connection.query(`
        INSERT INTO ventas (codigo, cliente_id, usuario_id, tipo_pago, subtotal, iva, total, estado, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Completada', ?)
      `, [
        codigoVenta,
        clienteId ? Number(clienteId) : null,
        usuarioId ? Number(usuarioId) : null,
        tipoPago,
        subtotalGeneral,
        ivaGeneral,
        totalGeneral,
        observaciones || ''
      ]);

      const ventaId = resVenta.insertId;

      // Insertar detalle de venta
      for (const det of itemsProcesados) {
        await connection.query(`
          INSERT INTO detalle_ventas (venta_id, producto_id, codigo_producto, nombre_producto, cantidad, precio_unitario, iva, subtotal, total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          ventaId,
          det.productoId,
          det.codigoProducto,
          det.nombreProducto,
          det.cantidad,
          det.precioUnitario,
          det.iva,
          det.subtotal,
          det.total
        ]);
      }

      await connection.commit();
      connection.release();

      return this.obtenerVentaPorId(ventaId);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Anula una venta y devuelve el stock a los productos correspondientes.
   * @param {number|string} id
   */
  async anularVenta(id) {
    const venta = await this.obtenerVentaPorId(id);

    if (venta.estado === 'Anulada') {
      const err = new Error("Esta venta ya se encuentra anulada");
      err.status = 400;
      throw err;
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Cambiar estado a Anulada
      await connection.query(
        "UPDATE ventas SET estado = 'Anulada' WHERE id = ?",
        [venta.id]
      );

      // Devolver stock
      for (const item of venta.items) {
        await connection.query(
          "UPDATE productos SET stock = stock + ? WHERE id = ?",
          [item.cantidad, item.productoId]
        );
      }

      await connection.commit();
      connection.release();

      return this.obtenerVentaPorId(venta.id);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Elimina el registro de una venta.
   * @param {number|string} id
   */
  async eliminarVenta(id) {
    const venta = await this.obtenerVentaPorId(id);
    await pool.query("DELETE FROM ventas WHERE id = ?", [venta.id]);
    return true;
  }
}

module.exports = new VentaService();
