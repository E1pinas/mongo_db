// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

/**
 * Rate limiter para endpoints sensibles de autenticación
 * Limita intentos de login/registro para prevenir ataques de fuerza bruta
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 intentos por ventana (aumentado para desarrollo)
  message: {
    ok: false,
    message:
      "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos",
  },
  standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Cuenta requests exitosos también
});

/**
 * Rate limiter para endpoints de creación de contenido
 * Previene spam de canciones/álbumes/playlists
 */
export const createContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Máximo 20 creaciones por hora
  message: {
    ok: false,
    message: "Límite de creación alcanzado. Intenta de nuevo en 1 hora",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Solo cuenta requests fallidos
});

/**
 * Rate limiter para uploads de archivos
 * Limita subidas para evitar abuso de almacenamiento
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo 10 uploads por hora
  message: {
    ok: false,
    message: "Límite de uploads alcanzado. Intenta de nuevo en 1 hora",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter general para API
 * Protección básica contra abuso de la API
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 2000, // Máximo 2000 requests por ventana (aumentado para desarrollo local)
  message: {
    ok: false,
    message: "Demasiadas peticiones. Intenta de nuevo más tarde",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para acciones sociales (likes, follows, etc.)
 * Previene spam de interacciones
 */
export const socialLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // Máximo 100 acciones sociales por minuto (aumentado)
  message: {
    ok: false,
    message: "Demasiadas acciones. Espera un momento e intenta de nuevo",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter para compartir canciones públicamente
 * Previene scraping masivo de canciones compartidas
 */
export const compartirPublicoLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  max: process.env.NODE_ENV === "production" ? 5 : 50, // 5 en producción, 50 en desarrollo
  message: {
    ok: false,
    message:
      "Máximo 5 canciones compartidas cada 2 minutos. Intenta de nuevo pronto",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter para streaming de audio público
 * Controla el consumo de ancho de banda
 */
export const audioStreamLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100, // Máximo 100 chunks de audio (~2 canciones completas)
  message: {
    ok: false,
    message: "Límite de reproducción alcanzado. Intenta de nuevo en 10 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
