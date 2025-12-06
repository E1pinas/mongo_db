import { Usuario } from "../models/usuarioModels.js";
import { esMayorDeEdad } from "../helpers/edadHelper.js";

/**
 * Middleware para agregar información de edad al request
 * Debe usarse después del middleware de autenticación
 */
export const verificarEdad = async (req, res, next) => {
  try {
    // Si no hay usuario autenticado, continuar
    if (!req.userId) {
      return next();
    }

    // Obtener usuario
    const usuario = await Usuario.findById(req.userId).select(
      "fechaNacimiento"
    );

    if (!usuario) {
      return next();
    }

    // Agregar información de edad al request
    req.esMayorDeEdad = esMayorDeEdad(usuario.fechaNacimiento);

    next();
  } catch (error) {
    console.error("Error en verificarEdad:", error);
    next();
  }
};

/**
 * Middleware para verificar que el contenido explícito requiera ser mayor de edad
 * Usar en rutas de reproducción de canciones
 */
export const verificarContenidoExplicito = async (req, res, next) => {
  try {
    const { idCancion } = req.params;

    // Importar modelo dinámicamente para evitar dependencia circular
    const { Cancion } = await import("../models/cancionModels.js");

    const cancion = await Cancion.findById(idCancion);

    if (!cancion) {
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada",
      });
    }

    // Si la canción no es explícita, permitir acceso
    if (!cancion.esExplicita) {
      return next();
    }

    // Si no hay usuario autenticado, bloquear
    if (!req.userId) {
      return res.status(403).json({
        ok: false,
        message: "Debes iniciar sesión para reproducir contenido explícito",
        requiereLogin: true,
      });
    }

    // Verificar edad del usuario
    const usuario = await Usuario.findById(req.userId).select(
      "fechaNacimiento"
    );

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    const mayorDeEdad = esMayorDeEdad(usuario.fechaNacimiento);

    if (!mayorDeEdad) {
      return res.status(403).json({
        ok: false,
        message:
          "Debes ser mayor de 18 años para reproducir contenido explícito",
        esExplicita: true,
        restriccionEdad: true,
      });
    }

    next();
  } catch (error) {
    console.error("Error en verificarContenidoExplicito:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al verificar contenido",
    });
  }
};
