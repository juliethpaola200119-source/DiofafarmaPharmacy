/**
 * Servicio de Gestión de Usuarios
 * Módulo: Services / UsuarioService
 *
 * Contiene la lógica de negocio para el CRUD completo de usuarios del sistema.
 * Opera sobre la tabla `usuarios` en MySQL usando consultas parametrizadas.
 * Las contraseñas se almacenan hasheadas con bcrypt (nunca en texto plano).
 * Nunca se retorna el campo `password` en las respuestas.
 *
 * Roles válidos: 'Administrador' | 'Farmacéutico' | 'Cajero'
 */

require("dotenv").config();
const bcrypt   = require("bcryptjs");
const { pool } = require("../database/db");

const SALT_ROUNDS = 10;
const ROLES_VALIDOS = ["Administrador", "Farmacéutico", "Cajero"];

/**
 * Mapea una fila de la BD al objeto de usuario seguro (sin password).
 * @param {Object} row Fila de la base de datos
 * @returns {Object} Usuario sin campo password
 */
function mapRowToUsuario(row) {
  return {
    id:        row.id,
    usuario:   row.usuario,
    email:     row.email    || "",
    rol:       row.rol      || "Cajero",
    estado:    row.estado   === 1 || row.estado === true,
    creadoEn:  row.creado_en ? new Date(row.creado_en).toISOString() : null
  };
}

class UsuarioService {
  /**
   * Retorna la lista completa de usuarios (sin campo password).
   * @returns {Promise<Array>} Lista de usuarios
   */
  async listarUsuarios() {
    const [rows] = await pool.execute(
      "SELECT id, usuario, email, rol, estado, creado_en FROM usuarios ORDER BY id ASC"
    );
    return rows.map(mapRowToUsuario);
  }

  /**
   * Obtiene un usuario específico por su ID (sin campo password).
   * @param {number|string} id
   * @returns {Promise<Object>} Usuario encontrado
   */
  async obtenerUsuarioPorId(id) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
      const error = new Error("El ID proporcionado no es válido");
      error.status = 400;
      throw error;
    }

    const [rows] = await pool.execute(
      "SELECT id, usuario, email, rol, estado, creado_en FROM usuarios WHERE id = ?",
      [numId]
    );

    if (rows.length === 0) {
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      throw error;
    }

    return mapRowToUsuario(rows[0]);
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   * Valida unicidad de usuario y email, y aplica hash a la contraseña.
   *
   * @param {Object} datos - { usuario, email, password, rol, estado }
   * @returns {Promise<Object>} Usuario creado (sin password)
   */
  async crearUsuario(datos) {
    const { usuario, email, password, rol, estado } = datos || {};

    // Validar campos obligatorios
    if (!usuario || typeof usuario !== "string" || usuario.trim() === "") {
      const error = new Error("El nombre de usuario es obligatorio");
      error.status = 400;
      throw error;
    }

    if (!password || typeof password !== "string" || password.trim() === "") {
      const error = new Error("La contraseña es obligatoria");
      error.status = 400;
      throw error;
    }

    if (password.trim().length < 6) {
      const error = new Error("La contraseña debe tener al menos 6 caracteres");
      error.status = 400;
      throw error;
    }

    // Validar rol
    const rolLimpio = rol && ROLES_VALIDOS.includes(rol.trim()) ? rol.trim() : "Cajero";

    // Validar estado
    const estadoVal =
      estado === true  || estado === "true"  || estado === 1 || estado === "1" ? 1 :
      estado === false || estado === "false" || estado === 0 || estado === "0" ? 0 :
      1; // por defecto activo

    const usuarioLimpio = usuario.trim();
    const emailLimpio   = email  ? email.trim().toLowerCase() : "";

    // Verificar unicidad del usuario
    const [existeUsuario] = await pool.execute(
      "SELECT id FROM usuarios WHERE LOWER(usuario) = LOWER(?)",
      [usuarioLimpio]
    );
    if (existeUsuario.length > 0) {
      const error = new Error("El nombre de usuario ya está en uso");
      error.status = 409;
      throw error;
    }

    // Verificar unicidad del email (solo si se proporcionó)
    if (emailLimpio) {
      const [existeEmail] = await pool.execute(
        "SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)",
        [emailLimpio]
      );
      if (existeEmail.length > 0) {
        const error = new Error("El email ya está registrado por otro usuario");
        error.status = 409;
        throw error;
      }
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password.trim(), SALT_ROUNDS);

    // Insertar usuario
    const [result] = await pool.execute(
      "INSERT INTO usuarios (usuario, email, password, rol, estado) VALUES (?, ?, ?, ?, ?)",
      [usuarioLimpio, emailLimpio, passwordHash, rolLimpio, estadoVal]
    );

    return this.obtenerUsuarioPorId(result.insertId);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * Si se proporciona nueva contraseña, se hashea antes de guardar.
   *
   * @param {number|string} id
   * @param {Object} datos - { usuario, email, password?, rol, estado }
   * @returns {Promise<Object>} Usuario actualizado (sin password)
   */
  async actualizarUsuario(id, datos) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
      const error = new Error("El ID proporcionado no es válido");
      error.status = 400;
      throw error;
    }

    // Verificar que el usuario existe
    const [existente] = await pool.execute(
      "SELECT id FROM usuarios WHERE id = ?",
      [numId]
    );
    if (existente.length === 0) {
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      throw error;
    }

    const { usuario, email, password, rol, estado } = datos || {};

    // Validar nombre de usuario
    if (!usuario || typeof usuario !== "string" || usuario.trim() === "") {
      const error = new Error("El nombre de usuario es obligatorio");
      error.status = 400;
      throw error;
    }

    const usuarioLimpio = usuario.trim();
    const emailLimpio   = email ? email.trim().toLowerCase() : "";

    // Verificar unicidad del usuario (excluyendo el actual)
    const [existeUsuario] = await pool.execute(
      "SELECT id FROM usuarios WHERE LOWER(usuario) = LOWER(?) AND id != ?",
      [usuarioLimpio, numId]
    );
    if (existeUsuario.length > 0) {
      const error = new Error("El nombre de usuario ya está en uso por otro usuario");
      error.status = 409;
      throw error;
    }

    // Verificar unicidad del email (excluyendo el actual)
    if (emailLimpio) {
      const [existeEmail] = await pool.execute(
        "SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?) AND id != ?",
        [emailLimpio, numId]
      );
      if (existeEmail.length > 0) {
        const error = new Error("El email ya está registrado por otro usuario");
        error.status = 409;
        throw error;
      }
    }

    // Validar y normalizar rol
    const rolLimpio = rol && ROLES_VALIDOS.includes(rol.trim()) ? rol.trim() : "Cajero";

    // Validar estado
    const estadoVal =
      estado === true  || estado === "true"  || estado === 1 || estado === "1" ? 1 :
      estado === false || estado === "false" || estado === 0 || estado === "0" ? 0 :
      1;

    // Si se proporciona nueva contraseña, hashearla
    if (password && typeof password === "string" && password.trim().length > 0) {
      if (password.trim().length < 6) {
        const error = new Error("La contraseña debe tener al menos 6 caracteres");
        error.status = 400;
        throw error;
      }
      const passwordHash = await bcrypt.hash(password.trim(), SALT_ROUNDS);

      await pool.execute(
        `UPDATE usuarios
         SET usuario = ?, email = ?, password = ?, rol = ?, estado = ?
         WHERE id = ?`,
        [usuarioLimpio, emailLimpio, passwordHash, rolLimpio, estadoVal, numId]
      );
    } else {
      // Actualizar sin cambiar la contraseña
      await pool.execute(
        `UPDATE usuarios
         SET usuario = ?, email = ?, rol = ?, estado = ?
         WHERE id = ?`,
        [usuarioLimpio, emailLimpio, rolLimpio, estadoVal, numId]
      );
    }

    return this.obtenerUsuarioPorId(numId);
  }

  /**
   * Elimina físicamente un usuario de la base de datos por su ID.
   * @param {number|string} id
   * @returns {Promise<boolean>} true si fue eliminado
   */
  async eliminarUsuario(id) {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
      const error = new Error("El ID proporcionado no es válido");
      error.status = 400;
      throw error;
    }

    const [result] = await pool.execute(
      "DELETE FROM usuarios WHERE id = ?",
      [numId]
    );

    if (result.affectedRows === 0) {
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      throw error;
    }

    return true;
  }
}

module.exports = new UsuarioService();
