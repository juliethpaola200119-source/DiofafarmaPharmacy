-- ============================================================
-- Script SQL: DioFaFarma
-- Sistema de gestión de droguería farmacéutica
-- Compatible con MySQL 8.0+
-- ============================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS diofafarma
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE diofafarma;

-- ============================================================
-- Tabla: usuarios
-- Almacena las credenciales y datos del personal de la droguería
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id           INT          NOT NULL AUTO_INCREMENT,
  usuario      VARCHAR(80)  NOT NULL,
  email        VARCHAR(150) NOT NULL DEFAULT '',
  password     VARCHAR(255) NOT NULL,               -- almacena hash bcrypt
  rol          VARCHAR(50)  NOT NULL DEFAULT 'Cajero',  -- Administrador | Farmacéutico | Cajero
  estado       TINYINT(1)   NOT NULL DEFAULT 1,         -- 1=activo, 0=inactivo
  creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario (usuario),
  UNIQUE KEY uq_email   (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Migración segura: agregar columnas nuevas si no existen
-- (Para bases de datos ya creadas con la estructura anterior)
-- ============================================================
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS email  VARCHAR(150) NOT NULL DEFAULT '' AFTER usuario,
  ADD COLUMN IF NOT EXISTS rol    VARCHAR(50)  NOT NULL DEFAULT 'Cajero' AFTER password,
  ADD COLUMN IF NOT EXISTS estado TINYINT(1)   NOT NULL DEFAULT 1 AFTER rol;

-- Agregar índices únicos si no existen (ignora si ya existen)
ALTER TABLE usuarios
  ADD UNIQUE INDEX IF NOT EXISTS uq_email (email);

-- ============================================================
-- Tabla: productos
-- Inventario de medicamentos y productos farmacéuticos
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  id            INT            NOT NULL AUTO_INCREMENT,
  codigo        VARCHAR(30)    NOT NULL,
  nombre        VARCHAR(200)   NOT NULL,
  descripcion   VARCHAR(500)   NULL     DEFAULT '',
  laboratorio   VARCHAR(150)   NULL     DEFAULT '',
  precio_compra DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  precio_venta  DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  stock         INT            NOT NULL DEFAULT 0,
  estado        TINYINT(1)     NOT NULL DEFAULT 1,   -- 1=activo, 0=inactivo
  creado_en     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_codigo (codigo),
  INDEX idx_estado (estado),
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Datos de prueba: usuario administrador por defecto
-- password: 123456 (hash bcrypt generado con saltRounds=10)
-- ============================================================
INSERT IGNORE INTO usuarios (usuario, email, password, rol, estado) VALUES
  ('admin', 'admin@diofafarma.com', '$2b$10$LKQN4bP85Lvy4K9FsTQNWe6rAn.W01g0TKPfOoy65HzD3Yz7vhatm', 'Administrador', 1);

-- ============================================================
-- Datos de prueba: inventario inicial de medicamentos
-- ============================================================
INSERT IGNORE INTO productos (codigo, nombre, descripcion, laboratorio, precio_compra, precio_venta, stock, estado) VALUES
  ('MED001', 'Acetaminofén 500mg',
   'Analgésico y antipirético para alivio de dolores leves a moderados.',
   'Laboratorio Genéricos S.A.', 2000.00, 3500.00, 50, 1),

  ('MED002', 'Amoxicilina 500mg Cápsulas',
   'Antibiótico de amplio espectro para infecciones respiratorias.',
   'Farmacéutica Andina', 8500.00, 14000.00, 8, 1),

  ('MED003', 'Ibuprofeno 400mg',
   'Antiinflamatorio no esteroideo (AINE) para inflamación y dolor.',
   'Laboratorios Sanitas', 3200.00, 5800.00, 35, 1),

  ('MED004', 'Loratadina 10mg',
   'Antihistamínico para alergias estacionales y rinitis alérgica.',
   'BioFarma Global', 1800.00, 3200.00, 0, 1),

  ('MED005', 'Omeprazol 20mg Cápsulas',
   'Inhibidor de la bomba de protones para reflujo gástrico y acidez.',
   'Farmacéutica Andina', 4500.00, 7500.00, 22, 1),

  ('MED006', 'Losartán Potásico 50mg',
   'Antihipertensivo indicado para el tratamiento de la hipertensión arterial.',
   'Laboratorio Genéricos S.A.', 6000.00, 10500.00, 5, 1),

  ('MED007', 'Jarabe para la Tos con Hedera Helix',
   'Expectorante natural para el alivio de la tos con flema.',
   'NaturSalud Pharma', 11000.00, 18900.00, 14, 0);

-- ============================================================
-- Tabla: clientes
-- Registro y gestión de clientes de la farmacia
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id              INT          NOT NULL AUTO_INCREMENT,
  tipo_documento  VARCHAR(20)  NOT NULL DEFAULT 'CC',
  documento       VARCHAR(30)  NOT NULL,
  nombre          VARCHAR(150) NOT NULL,
  apellido        VARCHAR(150) NOT NULL DEFAULT '',
  telefono        VARCHAR(30)  NULL     DEFAULT '',
  email           VARCHAR(150) NULL     DEFAULT '',
  direccion       VARCHAR(255) NULL     DEFAULT '',
  estado          TINYINT(1)   NOT NULL DEFAULT 1,     -- 1=activo, 0=inactivo
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_cliente_doc (documento),
  INDEX idx_cliente_doc (documento),
  INDEX idx_cliente_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de prueba: clientes iniciales
INSERT IGNORE INTO clientes (tipo_documento, documento, nombre, apellido, telefono, email, direccion, estado) VALUES
  ('CC', '1020304050', 'Carlos', 'Gómez Pérez', '3001234567', 'carlos.gomez@email.com', 'Calle 45 # 12-34', 1),
  ('CC', '1098765432', 'María Camila', 'Rodríguez Silva', '3109876543', 'maria.rodriguez@email.com', 'Carrera 7 # 85-20', 1),
  ('CE', '5544332211', 'Jean Pierre', 'Dupond', '3205554433', 'jean.dupond@email.com', 'Av. Las Palmas # 10-15', 1),
  ('NIT', '901234567-1', 'Droguerías Aliadas S.A.S.', '', '6013456789', 'contacto@aliadas.com', 'Zona Franca Bodega 4', 1);

-- ============================================================
-- Tabla: ventas
-- Encabezado de ventas registradas en la farmacia
-- ============================================================
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
  observaciones   VARCHAR(255)   NULL     DEFAULT '',
  fecha           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_venta_codigo (codigo),
  INDEX idx_venta_codigo (codigo),
  INDEX idx_venta_fecha (fecha),
  INDEX idx_venta_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: detalle_ventas
-- Líneas de productos por venta con precio, cantidad, iva, subtotal y total
-- ============================================================
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


