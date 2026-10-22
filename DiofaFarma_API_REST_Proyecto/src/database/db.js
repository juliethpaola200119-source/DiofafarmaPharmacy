/**
 * Configuración del Pool de Conexiones MySQL
 * Módulo: Database / DB
 *
 * Crea y exporta un pool de conexiones MySQL2 reutilizable.
 * Lee las credenciales exclusivamente desde variables de entorno.
 * Proporciona una función de verificación de conexión para el arranque.
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

// Pool de conexiones – permite reutilizar conexiones de manera eficiente
const pool = mysql.createPool({
  host:            process.env.DB_HOST     || "localhost",
  port:            Number(process.env.DB_PORT) || 3306,
  user:            process.env.DB_USER     || "root",
  password:        process.env.DB_PASSWORD || "",
  database:        process.env.DB_NAME     || "diofafarma",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           "+00:00",
  charset:            "utf8mb4"
});

/**
 * Verifica que el pool puede obtener una conexión a MySQL y asegura la existencia de tablas necesarias.
 * Se llama al iniciar el servidor.
 * @returns {Promise<void>}
 */
async function verificarConexion() {
  const connection = await pool.getConnection();
  console.log(
    `[DB] Conexión MySQL establecida → ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "diofafarma"}`
  );

  // Asegurar tabla clientes
  await connection.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id              INT          NOT NULL AUTO_INCREMENT,
      tipo_documento  VARCHAR(20)  NOT NULL DEFAULT 'CC',
      documento       VARCHAR(30)  NOT NULL,
      nombre          VARCHAR(150) NOT NULL,
      apellido        VARCHAR(150) NOT NULL DEFAULT '',
      telefono        VARCHAR(30)  NULL     DEFAULT '',
      email           VARCHAR(150) NULL     DEFAULT '',
      direccion       VARCHAR(255) NULL     DEFAULT '',
      estado          TINYINT(1)   NOT NULL DEFAULT 1,
      creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),
      UNIQUE KEY uq_cliente_doc (documento),
      INDEX idx_cliente_doc (documento),
      INDEX idx_cliente_nombre (nombre)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Semilla de clientes si la tabla está vacía
  const [[{ total }]] = await connection.query("SELECT COUNT(*) AS total FROM clientes");
  if (total === 0) {
    await connection.query(`
      INSERT INTO clientes (tipo_documento, documento, nombre, apellido, telefono, email, direccion, estado) VALUES
      ('CC', '1020304050', 'Carlos', 'Gómez Pérez', '3001234567', 'carlos.gomez@email.com', 'Calle 45 # 12-34', 1),
      ('CC', '1098765432', 'María Camila', 'Rodríguez Silva', '3109876543', 'maria.rodriguez@email.com', 'Carrera 7 # 85-20', 1),
      ('CE', '5544332211', 'Jean Pierre', 'Dupond', '3205554433', 'jean.dupond@email.com', 'Av. Las Palmas # 10-15', 1),
      ('NIT', '901234567-1', 'Droguerías Aliadas S.A.S.', '', '6013456789', 'contacto@aliadas.com', 'Zona Franca Bodega 4', 1);
    `);
    console.log("[DB] Clientes iniciales sembrados con éxito.");
  }

  // Asegurar tablas ventas y detalle_ventas
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ventas (
      id              INT            NOT NULL AUTO_INCREMENT,
      codigo          VARCHAR(30)    NOT NULL,
      cliente_id      INT            NULL,
      usuario_id      INT            NULL,
      tipo_pago       VARCHAR(50)    NOT NULL DEFAULT 'Efectivo',
      subtotal        DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
      iva             DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
      total           DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
      estado          VARCHAR(20)    NOT NULL DEFAULT 'Completada',
      observaciones   VARCHAR(255)   NULL DEFAULT '',
      fecha           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),
      UNIQUE KEY uq_venta_codigo (codigo),
      INDEX idx_venta_codigo (codigo),
      INDEX idx_venta_fecha (fecha),
      INDEX idx_venta_cliente (cliente_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS detalle_ventas (
      id              INT            NOT NULL AUTO_INCREMENT,
      venta_id        INT            NOT NULL,
      producto_id     INT            NOT NULL,
      codigo_producto VARCHAR(30)    NOT NULL,
      nombre_producto VARCHAR(200)   NOT NULL,
      cantidad        INT            NOT NULL DEFAULT 1,
      precio_unitario DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
      iva             DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
      subtotal        DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
      total           DECIMAL(12,2)  NOT NULL DEFAULT 0.00,

      PRIMARY KEY (id),
      INDEX idx_detalle_venta (venta_id),
      INDEX idx_detalle_producto (producto_id),
      CONSTRAINT fk_detalle_venta FOREIGN KEY (venta_id) REFERENCES ventas (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Semilla de venta inicial si la tabla está vacía
  const [[{ totalVentas }]] = await connection.query("SELECT COUNT(*) AS totalVentas FROM ventas");
  if (totalVentas === 0) {
    const [cliente] = await connection.query("SELECT id FROM clientes LIMIT 1");
    const [prod1] = await connection.query("SELECT id, codigo, nombre, precio_venta FROM productos WHERE codigo = 'MED001' LIMIT 1");
    const [prod2] = await connection.query("SELECT id, codigo, nombre, precio_venta FROM productos WHERE codigo = 'MED002' LIMIT 1");

    if (cliente.length > 0 && prod1.length > 0 && prod2.length > 0) {
      const cId = cliente[0].id;
      const p1 = prod1[0];
      const p2 = prod2[0];

      const cant1 = 2;
      const cant2 = 1;
      const sub1 = Number(p1.precio_venta) * cant1;
      const iva1 = Math.round(sub1 * 0.19);
      const tot1 = sub1 + iva1;

      const sub2 = Number(p2.precio_venta) * cant2;
      const iva2 = Math.round(sub2 * 0.19);
      const tot2 = sub2 + iva2;

      const subtotalVenta = sub1 + sub2;
      const ivaVenta = iva1 + iva2;
      const totalVenta = subtotalVenta + ivaVenta;

      const [resVta] = await connection.query(`
        INSERT INTO ventas (codigo, cliente_id, usuario_id, tipo_pago, subtotal, iva, total, estado, observaciones)
        VALUES ('VTA-2026-0001', ?, 1, 'Efectivo', ?, ?, ?, 'Completada', 'Venta inicial de prueba')
      `, [cId, subtotalVenta, ivaVenta, totalVenta]);

      const vtaId = resVta.insertId;

      await connection.query(`
        INSERT INTO detalle_ventas (venta_id, producto_id, codigo_producto, nombre_producto, cantidad, precio_unitario, iva, subtotal, total)
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        vtaId, p1.id, p1.codigo, p1.nombre, cant1, p1.precio_venta, iva1, sub1, tot1,
        vtaId, p2.id, p2.codigo, p2.nombre, cant2, p2.precio_venta, iva2, sub2, tot2
      ]);

      console.log("[DB] Venta inicial de demostración registrada con éxito.");
    }
  }

  connection.release();
}

module.exports = { pool, verificarConexion };
