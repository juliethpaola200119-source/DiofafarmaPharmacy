/**
 * Configuración de la Aplicación Express
 * Módulo: App
 *
 * Configura los middlewares globales (CORS, body parser), registra las rutas principales
 * de la API (/api/health, /api/auth, /api/productos, /api/usuarios, /api/reportes)
 * y conecta el middleware de errores.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes     = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const usuarioRoutes  = require("./routes/usuarioRoutes");
const reporteRoutes  = require("./routes/reporteRoutes");
const clienteRoutes  = require("./routes/clienteRoutes");
const ventaRoutes    = require("./routes/ventaRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Configuración de CORS para permitir la conexión desde el frontend React (Vite)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origin (Postman, cURL, test runner interno)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permisivo en desarrollo – restringir en producción
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Middleware para procesar cuerpos en formato JSON
app.use(express.json());

// Endpoint de verificación de salud del servicio (Health Check)
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API DioFaFarma funcionando correctamente",
    timestamp: new Date().toISOString(),
    version: "2.0.0-mysql"
  });
});

// Registro de rutas modulares
app.use("/api/auth",      authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/usuarios",  usuarioRoutes);
app.use("/api/reportes",  reporteRoutes);
app.use("/api/clientes",  clienteRoutes);
app.use("/api/ventas",    ventaRoutes);

// Manejador para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`
  });
});

// Middleware centralizado de errores
app.use(errorMiddleware);

module.exports = app;
