// src/middlewares/sanitizeInput.js

/**
 * Middleware para sanitizar entradas de usuario
 * Limpia caracteres potencialmente peligrosos
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitizar body
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  // Sanitizar query params - crear nuevo objeto
  if (req.query && typeof req.query === "object") {
    const sanitizedQuery = sanitizeObject(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, sanitizedQuery);
  }

  // Sanitizar params de URL - crear nuevo objeto
  if (req.params && typeof req.params === "object") {
    const sanitizedParams = sanitizeObject(req.params);
    Object.keys(req.params).forEach((key) => delete req.params[key]);
    Object.assign(req.params, sanitizedParams);
  }

  next();
};

/**
 * Función auxiliar para sanitizar objetos recursivamente
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized;
};

/**
 * Función para sanitizar strings
 * Elimina caracteres potencialmente peligrosos
 */
const sanitizeString = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  // Eliminar caracteres de control
  let sanitized = value.replace(/[\x00-\x1F\x7F]/g, "");

  // Escapar caracteres HTML básicos (opcional, Mongoose ya lo hace)
  // sanitized = sanitized
  //   .replace(/&/g, "&amp;")
  //   .replace(/</g, "&lt;")
  //   .replace(/>/g, "&gt;")
  //   .replace(/"/g, "&quot;")
  //   .replace(/'/g, "&#x27;");

  // Trimear espacios en blanco
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Middleware para prevenir inyecciones NoSQL
 * Elimina operadores de MongoDB de las entradas
 */
export const preventNoSQLInjection = (req, res, next) => {
  const clean = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(clean);
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Eliminar claves que empiezan con $ (operadores MongoDB)
      if (key.startsWith("$")) {
        continue;
      }
      cleaned[key] = clean(value);
    }

    return cleaned;
  };

  if (req.body && typeof req.body === "object") {
    req.body = clean(req.body);
  }

  if (req.query && typeof req.query === "object") {
    const cleanedQuery = clean(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, cleanedQuery);
  }

  if (req.params && typeof req.params === "object") {
    const cleanedParams = clean(req.params);
    Object.keys(req.params).forEach((key) => delete req.params[key]);
    Object.assign(req.params, cleanedParams);
  }

  next();
};

/**
 * Middleware para limitar tamaño de strings
 * Previene ataques de memoria con strings muy largos
 */
export const limitStringLength = (maxLength = 10000) => {
  return (req, res, next) => {
    const truncate = (obj) => {
      if (typeof obj === "string") {
        return obj.length > maxLength ? obj.substring(0, maxLength) : obj;
      }

      if (typeof obj !== "object" || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(truncate);
      }

      const truncated = {};
      for (const [key, value] of Object.entries(obj)) {
        truncated[key] = truncate(value);
      }

      return truncated;
    };

    if (req.body) {
      req.body = truncate(req.body);
    }

    next();
  };
};
