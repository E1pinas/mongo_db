import mongoose from "mongoose";

/**
 * Helpers de validación reutilizables
 */

/**
 * Valida si un string es un ObjectId válido de MongoDB
 * @param {string} id - ID a validar
 * @returns {boolean} True si es válido
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Valida múltiples ObjectIds
 * @param {Array<string>} ids - Array de IDs a validar
 * @returns {boolean} True si todos son válidos
 */
export const areValidObjectIds = (ids) => {
  if (!Array.isArray(ids)) return false;
  return ids.every((id) => isValidObjectId(id));
};

/**
 * Valida que un campo requerido no esté vacío
 * @param {any} value - Valor a validar
 * @param {string} fieldName - Nombre del campo (para mensajes de error)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return {
      valid: false,
      error: `El campo ${fieldName} es requerido`,
    };
  }
  return { valid: true };
};

/**
 * Valida que un valor esté dentro de opciones permitidas
 * @param {any} value - Valor a validar
 * @param {Array} allowedValues - Valores permitidos
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} debe ser uno de: ${allowedValues.join(", ")}`,
    };
  }
  return { valid: true };
};

/**
 * Valida longitud de string
 * @param {string} value - String a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateStringLength = (value, min, max, fieldName) => {
  if (typeof value !== "string") {
    return { valid: false, error: `${fieldName} debe ser un texto` };
  }

  const length = value.trim().length;

  if (min && length < min) {
    return {
      valid: false,
      error: `${fieldName} debe tener al menos ${min} caracteres`,
    };
  }

  if (max && length > max) {
    return {
      valid: false,
      error: `${fieldName} no puede tener más de ${max} caracteres`,
    };
  }

  return { valid: true };
};

/**
 * Tipos de contenido válidos para reportes/moderación
 */
export const CONTENT_TYPES = {
  POST: "post",
  COMMENT: "comentario",
  SONG: "cancion",
  ALBUM: "album",
  PLAYLIST: "playlist",
  USER: "usuario",
};

/**
 * Valida tipo de contenido
 * @param {string} tipo - Tipo a validar
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateContentType = (tipo) => {
  const validTypes = Object.values(CONTENT_TYPES);
  return validateEnum(tipo, validTypes, "tipoContenido");
};

/**
 * Estados válidos para reportes
 */
export const REPORT_STATES = {
  PENDING: "pendiente",
  IN_REVIEW: "en_revision",
  RESOLVED: "resuelto",
  REJECTED: "rechazado",
};

/**
 * Valida estado de reporte
 * @param {string} estado - Estado a validar
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateReportState = (estado) => {
  const validStates = Object.values(REPORT_STATES);
  return validateEnum(estado, validStates, "estado");
};
