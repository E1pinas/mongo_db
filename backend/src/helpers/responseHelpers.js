/**
 * Helpers para estandarizar respuestas HTTP
 */

/**
 * Respuesta exitosa estándar
 * @param {Object} res - Objeto response de Express
 * @param {Object} data - Datos a devolver
 * @param {string} message - Mensaje opcional
 * @param {number} statusCode - Código de estado HTTP (default: 200)
 */
export const sendSuccess = (
  res,
  data = null,
  message = null,
  statusCode = 200
) => {
  const response = {
    ok: true,
    success: true,
  };

  if (message) response.message = message;
  if (data !== null) response.data = data;

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de error estándar
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP (default: 400)
 * @param {Object} details - Detalles adicionales del error
 */
export const sendError = (res, message, statusCode = 400, details = null) => {
  const response = {
    ok: false,
    success: false,
    message,
  };

  if (details) response.details = details;

  return res.status(statusCode).json(response);
};

/**
 * Respuesta para recurso no encontrado
 * @param {Object} res - Objeto response de Express
 * @param {string} resourceName - Nombre del recurso
 */
export const sendNotFound = (res, resourceName = "Recurso") => {
  return sendError(res, `${resourceName} no encontrado`, 404);
};

/**
 * Respuesta para error de validación
 * @param {Object} res - Objeto response de Express
 * @param {string|Array} errors - Errores de validación
 */
export const sendValidationError = (res, errors) => {
  const message = Array.isArray(errors) ? errors.join(", ") : errors;
  return sendError(res, message, 400);
};

/**
 * Respuesta para error de autorización
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje personalizado
 */
export const sendUnauthorized = (res, message = "No autorizado") => {
  return sendError(res, message, 403);
};

/**
 * Respuesta para error de autenticación
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje personalizado
 */
export const sendUnauthenticated = (res, message = "Debes iniciar sesión") => {
  return sendError(res, message, 401);
};

/**
 * Respuesta para error interno del servidor
 * @param {Object} res - Objeto response de Express
 * @param {Error} error - Error capturado
 * @param {string} customMessage - Mensaje personalizado
 */
export const sendServerError = (
  res,
  error = null,
  customMessage = "Error interno del servidor"
) => {
  // Log del error para debugging
  if (error) {
    console.error("Server Error:", error);
  }

  // En producción, no exponer detalles del error
  const isDevelopment = process.env.NODE_ENV === "development";

  return sendError(
    res,
    customMessage,
    500,
    isDevelopment && error ? { error: error.message, stack: error.stack } : null
  );
};

/**
 * Respuesta para conflicto (recurso duplicado, etc.)
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje de conflicto
 */
export const sendConflict = (res, message) => {
  return sendError(res, message, 409);
};

/**
 * Respuesta para contenido creado exitosamente
 * @param {Object} res - Objeto response de Express
 * @param {Object} data - Datos del recurso creado
 * @param {string} message - Mensaje opcional
 */
export const sendCreated = (res, data, message = "Creado exitosamente") => {
  return sendSuccess(res, data, message, 201);
};
