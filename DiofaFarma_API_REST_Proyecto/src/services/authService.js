/**
 * Servicio de Autenticación
 * Módulo: Services / AuthService
 *
 * Contiene la lógica de negocio para la gestión de usuarios y autenticación.
 * Opera sobre la tabla `usuarios` en MySQL usando consultas parametrizadas.
 * Las contraseñas se almacenan hasheadas con bcrypt (nunca en texto plano).
 * Genera tokens JWT firmados para las sesiones autenticadas.
 */

require("dotenv").config();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { pool } = require("../database/db");

const SALT_ROUNDS = 10;
const JWT_SECRET  = process.env.JWT_SECRET || "diofafarma_secret_key_2024";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h"; // sesión de 8 horas

class AuthService {
  /**
   * Registra un nuevo usuario en la base de datos.
   * Valida obligatoriedad de campos y unicidad de nombre de usuario.
   *
   * @param {Object} param0 Objeto con credenciales
   * @param {string} param0.usuario Nombre de usuario
   * @param {string} param0.password Contraseña en texto plano
   * @returns {Promise<Object>} Usuario registrado (sin contraseña)
   */
  async registrarUsuario({ usuario, password }) {
    // Validación de campos requeridos
    if (
      !usuario ||
      !password ||
      typeof usuario !== "string" ||
      typeof password !== "string" ||
      usuario.trim() === "" ||
      password.trim() === ""
    ) {
      const error = new Error("El usuario y la contraseña son obligatorios");
      error.status = 400;
      throw error;
    }

    const usuarioLimpio = usuario.trim();

    // Verificar unicidad del nombre de usuario (insensible a mayúsculas)
    const [rows] = await pool.execute(
      "SELECT id FROM usuarios WHERE LOWER(usuario) = LOWER(?)",
      [usuarioLimpio]
    );

    if (rows.length > 0) {
      const error = new Error("El usuario ya existe");
      error.status = 409;
      throw error;
    }

    // Hash de la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password.trim(), SALT_ROUNDS);

    // Insertar el nuevo usuario
    const [result] = await pool.execute(
      "INSERT INTO usuarios (usuario, password) VALUES (?, ?)",
      [usuarioLimpio, passwordHash]
    );

    // Retornar información segura (nunca retornar la contraseña)
    return {
      id: result.insertId,
      usuario: usuarioLimpio
    };
  }

  /**
   * Autentica las credenciales de un usuario existente.
   * Genera y retorna un token JWT junto con los datos del usuario.
   *
   * @param {Object} param0 Objeto con credenciales
   * @param {string} param0.usuario Nombre de usuario
   * @param {string} param0.password Contraseña en texto plano
   * @returns {Promise<Object>} Datos del usuario autenticado + token JWT
   */
  async autenticarUsuario({ usuario, password }) {
    // Validación de campos requeridos
    if (
      !usuario ||
      !password ||
      typeof usuario !== "string" ||
      typeof password !== "string" ||
      usuario.trim() === "" ||
      password.trim() === ""
    ) {
      const error = new Error("El usuario y la contraseña son obligatorios");
      error.status = 400;
      throw error;
    }

    const usuarioLimpio = usuario.trim();

    // Buscar el usuario por nombre (insensible a mayúsculas) incluyendo campos extendidos
    const [rows] = await pool.execute(
      "SELECT id, usuario, email, password, rol, estado FROM usuarios WHERE LOWER(usuario) = LOWER(?)",
      [usuarioLimpio]
    );

    if (rows.length === 0) {
      const error = new Error("Error en la autenticación");
      error.status = 401;
      throw error;
    }

    const user = rows[0];

    // Verificar que el usuario esté activo
    if (user.estado === 0) {
      const error = new Error("La cuenta de usuario está desactivada");
      error.status = 403;
      throw error;
    }

    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password.trim(), user.password);

    if (!passwordValida) {
      const error = new Error("Error en la autenticación");
      error.status = 401;
      throw error;
    }

    // Generar token JWT firmado
    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Retornar usuario autenticado (sin contraseña) + token
    return {
      id:      user.id,
      usuario: user.usuario,
      email:   user.email   || "",
      rol:     user.rol     || "Cajero",
      estado:  user.estado  === 1,
      token
    };
  }
}

module.exports = new AuthService();
