/**
 * Servidor Principal de la API DioFaFarma
 * Módulo: Server
 *
 * Punto de entrada para inicializar y levantar el servidor HTTP Express.
 * Verifica la conexión a MySQL antes de aceptar peticiones.
 * Lee el puerto de las variables de entorno o usa 3000 por defecto.
 */

require("dotenv").config();
const app = require("./app");
const { verificarConexion } = require("./database/db");

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    // Verificar conexión a MySQL antes de levantar el servidor
    await verificarConexion();

    app.listen(PORT, () => {
      console.log("==================================================");
      console.log(` Servidor DioFaFarma API en ejecución`);
      console.log(` Puerto    : ${PORT}`);
      console.log(` Base URL  : http://localhost:${PORT}/api`);
      console.log(` Health    : http://localhost:${PORT}/api/health`);
      console.log(` Auth      : http://localhost:${PORT}/api/auth`);
      console.log(` Productos : http://localhost:${PORT}/api/productos`);
      console.log(` Usuarios  : http://localhost:${PORT}/api/usuarios`);
      console.log(` Reportes  : http://localhost:${PORT}/api/reportes`);
      console.log(` Clientes  : http://localhost:${PORT}/api/clientes`);
      console.log(` Ventas    : http://localhost:${PORT}/api/ventas`);
      console.log("==================================================");
    });
  } catch (error) {
    console.error("[FATAL] No se pudo conectar a MySQL:", error.message);
    console.error("Verifique las variables de entorno en el archivo .env:");
    console.error("  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME");
    process.exit(1);
  }
}

iniciarServidor();
