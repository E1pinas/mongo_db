// src/middlewares/errorHandler.js

/**
 * Middleware centralizado para manejo de errores
 * Captura y formatea todos los errores de la aplicación
 */
export const errorHandler = (err, req, res, next) => {
  // Log del error en consola (en producción usarías un logger como Winston)
  console.error("❌ Error capturado:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Errores de Mongoose - ValidationError
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      ok: false,
      message: "Error de validación",
      errors,
    });
  }

  // Errores de Mongoose - CastError (ID inválido)
  if (err.name === "CastError") {
    return res.status(400).json({
      ok: false,
      message: `ID inválido: ${err.value}`,
    });
  }

  // Errores de duplicación de MongoDB (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      ok: false,
      message: `El ${field} ya está registrado`,
      field,
    });
  }

  // Errores de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      ok: false,
      message: "Token inválido",
      redirectTo: "/login",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      ok: false,
      message: "Tu sesión ha expirado. Por favor inicia sesión nuevamente",
      redirectTo: "/login",
      expired: true,
    });
  }

  // Errores de Multer (archivos)
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        ok: false,
        message: "Archivo demasiado grande",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        ok: false,
        message: "Demasiados archivos",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        ok: false,
        message: "Campo de archivo inesperado",
      });
    }
    return res.status(400).json({
      ok: false,
      message: `Error al subir archivo: ${err.message}`,
    });
  }

  // Errores personalizados con statusCode
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Error interno del servidor";

  // Respuesta de error
  res.status(statusCode).json({
    ok: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Middleware para capturar errores asíncronos
 * Wrapper para funciones async que automaticamente pasa errores a next()
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Clase de error personalizado para errores de la aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Para distinguir errores operacionales de bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};
