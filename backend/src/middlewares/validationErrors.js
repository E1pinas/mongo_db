// src/middlewares/validationErrors.js
import { validationResult } from "express-validator";

/**
 * Middleware para manejar errores de express-validator
 * Captura y formatea errores de validación de forma consistente
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Formatear errores para respuesta más limpia
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      ok: false,
      message: "Error de validación en los datos proporcionados",
      errors: formattedErrors,
    });
  }

  next();
};

/**
 * Wrapper alternativo que retorna los errores en formato simple
 * Útil para formularios que solo necesitan mensajes
 */
export const handleValidationErrorsSimple = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Solo devuelve mensajes de error (sin campos ni valores)
    const messages = errors.array().map((error) => error.msg);

    return res.status(400).json({
      ok: false,
      message: messages[0], // Primer error como mensaje principal
      errors: messages,
    });
  }

  next();
};

/**
 * Wrapper para validaciones que retorna errores agrupados por campo
 */
export const handleValidationErrorsByField = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Agrupar errores por campo
    const errorsByField = {};

    errors.array().forEach((error) => {
      const field = error.path || error.param;
      if (!errorsByField[field]) {
        errorsByField[field] = [];
      }
      errorsByField[field].push(error.msg);
    });

    return res.status(400).json({
      ok: false,
      message: "Error de validación",
      errors: errorsByField,
    });
  }

  next();
};
