/**
 * Middleware Centralizado de Manejo de Errores
 * Módulo: Middleware / ErrorMiddleware
 * 
 * Captura y procesa cualquier error no controlado o propagado por los controladores.
 * Garantiza que la API siempre responda con formato JSON consistente y seguro.
 * Previene la fuga de información sensible ocultando stack traces y detalles internos.
 */

const errorMiddleware = (err, req, res, next) => {
  // Manejo de error por sintaxis JSON malformada en el body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Formato JSON inválido en la solicitud"
    });
  }

  // Errores con código de estado HTTP explícito
  if (err.status && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      message: err.message || "Error en la solicitud"
    });
  }

  // Registrar el error internamente en consola para depuración
  console.error(`[Error ${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err);

  // Respuesta HTTP 500 estándar y segura para el cliente
  return res.status(500).json({
    success: false,
    message: "Error interno del servidor"
  });
};

module.exports = errorMiddleware;
