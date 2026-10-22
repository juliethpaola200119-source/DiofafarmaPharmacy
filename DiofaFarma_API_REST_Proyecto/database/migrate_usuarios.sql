-- ============================================================
-- Script de Migración: Agregar columnas a tabla usuarios
-- Ejecutar en la base de datos diofafarma
-- ============================================================

USE diofafarma;

-- Agregar columna email si no existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'diofafarma' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'email';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE usuarios ADD COLUMN email VARCHAR(150) NOT NULL DEFAULT \'\' AFTER usuario',
  'SELECT "columna email ya existe" AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna rol si no existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'diofafarma' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'rol';
SET @sql = IF(@col_exists = 0,
  "ALTER TABLE usuarios ADD COLUMN rol VARCHAR(50) NOT NULL DEFAULT 'Cajero' AFTER password",
  'SELECT "columna rol ya existe" AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna estado si no existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'diofafarma' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'estado';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE usuarios ADD COLUMN estado TINYINT(1) NOT NULL DEFAULT 1 AFTER rol',
  'SELECT "columna estado ya existe" AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar el admin con datos correctos
UPDATE usuarios
  SET rol = 'Administrador', estado = 1, email = 'admin@diofafarma.com'
  WHERE usuario = 'admin';

-- Verificar resultado
SELECT id, usuario, email, rol, estado FROM usuarios;
