// src/controllers/cancionController.js
import mongoose from "mongoose";
import { Cancion } from "../models/cancionModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { esMayorDeEdad } from "../helpers/edadHelper.js";
import { notificarNuevaCancion } from "../helpers/notificacionHelper.js";
import {
  hasUserLiked,
  toggleLikeOnResource,
  isArtist,
  validateSongAvailability,
  getSongPopulateOptions,
  getMilestone,
} from "../helpers/musicHelpers.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendServerError,
  sendCreated,
  sendUnauthorized,
} from "../helpers/responseHelpers.js";
import { validateRequired } from "../helpers/validationHelpers.js";

// 📌 Crear canción a partir de URLs (ya subidas a R2)
export const crearCancion = async (req, res) => {
  try {
    const {
      titulo,
      audioUrl,
      duracionSegundos,
      portadaUrl = null,
      album = null,
      generos = [],
      esPrivada = false,
      esExplicita = false,
    } = req.body;

    // Normalizar géneros
    const generosNormalizados = Array.isArray(generos)
      ? generos.map((x) => String(x).trim()).filter(Boolean)
      : typeof generos === "string"
      ? generos
          .split(/[,\|]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Validaciones con helpers
    const tituloValidation = validateRequired(titulo, "titulo");
    if (!tituloValidation.valid) {
      return sendValidationError(res, tituloValidation.error);
    }

    const audioValidation = validateRequired(audioUrl, "audioUrl");
    if (!audioValidation.valid) {
      return sendValidationError(res, audioValidation.error);
    }

    if (!duracionSegundos || Number(duracionSegundos) <= 0) {
      return sendValidationError(res, "La duración debe ser mayor a 0");
    }

    if (!req.userId) {
      return sendUnauthorized(res, "No autenticado");
    }

    // Verificar que el usuario puede subir contenido
    const usuario = await Usuario.findById(req.userId);
    if (!usuario) {
      return sendNotFound(res, "Usuario");
    }

    if (!usuario.puedeSubirContenido || usuario.role !== "user") {
      return sendUnauthorized(
        res,
        "No tienes permisos para subir contenido musical"
      );
    }

    const artistas = [new mongoose.Types.ObjectId(req.userId)];

    const cancion = await Cancion.create({
      titulo: titulo.trim(),
      artistas,
      album: album || null,
      esSingle: !album,
      duracionSegundos: Number(duracionSegundos),
      generos: generosNormalizados,
      audioUrl: audioUrl.trim(),
      portadaUrl: portadaUrl || "",
      esPrivada: Boolean(esPrivada),
      esExplicita: Boolean(esExplicita),
    });

    // Actualizar usuario: añadir a misCanciones e incrementar contador
    await Usuario.findByIdAndUpdate(req.userId, {
      $push: { misCanciones: cancion._id },
      $inc: { "estadisticas.totalCancionesSubidas": 1 },
    });

    // Notificar a seguidores (sin esperar)
    notificarNuevaCancion(cancion, req.userId);

    return sendCreated(res, cancion, "Canción creada correctamente");
  } catch (error) {
    console.error("Error en crearCancion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear la canción",
    });
  }
};

// 📌 Obtener mis canciones (donde yo figuro como artista)
export const misCanciones = async (req, res) => {
  try {
    const canciones = await Cancion.find({
      artistas: req.userId,
      estaEliminada: false,
    })
      .populate("artistas", "nick nombre nombreArtistico avatarUrl")
      .populate("album", "titulo portadaUrl")
      .sort({ createdAt: -1 });

    return sendSuccess(res, { canciones });
  } catch (error) {
    console.error("Error en misCanciones:", error);
    return sendServerError(res, error, "Error al obtener las canciones");
  }
};

// 📌 Buscar en mis canciones (donde yo figuro como artista)
export const buscarMisCanciones = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return sendValidationError(res, [
        "La búsqueda debe tener al menos 2 caracteres",
      ]);
    }

    const regex = new RegExp(q.trim(), "i");

    const canciones = await Cancion.find({
      artistas: req.userId,
      titulo: regex,
      estaEliminada: false,
    })
      .populate("artistas", "nick nombre nombreArtistico avatarUrl")
      .populate("album", "titulo portadaUrl")
      .select(
        "titulo audioUrl portadaUrl duracionSegundos generos reproducciones meGusta fechaSubida"
      )
      .sort({ createdAt: -1 })
      .limit(20);

    return sendSuccess(res, {
      canciones,
      total: canciones.length,
    });
  } catch (error) {
    console.error("Error en buscarMisCanciones:", error);
    return sendServerError(res, error, "Error al buscar canciones");
  }
};

// 📌 Obtener canción por ID
export const obtenerCancion = async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.id)
      .populate("artistas", "nick nombre nombreArtistico avatarUrl")
      .populate("album", "titulo portadaUrl");

    const validation = validateSongAvailability(cancion, req.userId);
    if (!validation.valid) {
      return sendNotFound(res, "Canción");
    }

    // Verificar si el usuario puede reproducir contenido explícito
    let puedeReproducir = true;
    let motivoRestriccion = null;

    if (cancion.esExplicita) {
      if (!req.userId) {
        puedeReproducir = false;
        motivoRestriccion =
          "Debes iniciar sesión para reproducir contenido explícito";
      } else {
        const usuario = await Usuario.findById(req.userId).select(
          "fechaNacimiento"
        );
        if (usuario && !esMayorDeEdad(usuario.fechaNacimiento)) {
          puedeReproducir = false;
          motivoRestriccion =
            "Debes ser mayor de 18 años para reproducir contenido explícito";
        }
      }
    }

    return sendSuccess(res, {
      cancion,
      restricciones: {
        puedeReproducir,
        motivoRestriccion,
        esExplicita: cancion.esExplicita,
      },
    });
  } catch (error) {
    console.error("Error en obtenerCancion:", error);
    return sendServerError(res, error, "Error al obtener la canción");
  }
};

// 📌 Obtener canción compartida públicamente (sin autenticación)
// Solo permite acceso a canciones públicas (esPrivada = false)
export const obtenerCancionPublica = async (req, res) => {
  try {
    const { id } = req.params;
    const ipUsuario = req.ip;

    // Cache para cooldown por canción específica
    if (!global.cancionCooldownCache) {
      global.cancionCooldownCache = new Map();
    }

    // Verificar cooldown: 1 minuto por canción desde la misma IP (solo en producción)
    const claveCache = `${ipUsuario}-${id}`;
    const ahora = Date.now();

    // Cooldown desactivado en desarrollo
    if (process.env.NODE_ENV === "production") {
      const tiempoCooldown = 60000; // 1 minuto en producción

      if (global.cancionCooldownCache.has(claveCache)) {
        const ultimoAcceso = global.cancionCooldownCache.get(claveCache);
        const tiempoTranscurrido = ahora - ultimoAcceso;

        if (tiempoTranscurrido < tiempoCooldown) {
          const segundosRestantes = Math.ceil(
            (tiempoCooldown - tiempoTranscurrido) / 1000
          );
          return sendError(
            res,
            `Por favor espera ${segundosRestantes} segundos antes de recargar esta canción`,
            429
          );
        }
      }
    }

    // Buscar canción
    const cancion = await Cancion.findById(id)
      .populate("artistas", "nick nombre nombreArtistico avatarUrl")
      .populate("album", "titulo portadaUrl");

    if (!cancion) {
      return sendNotFound(res, "Canción");
    }

    // 🔒 SEGURIDAD: Solo permitir canciones públicas
    if (cancion.esPrivada) {
      return sendError(
        res,
        "Esta canción es privada y no puede compartirse. Inicia sesión para verla.",
        403
      );
    }

    // Registrar acceso para cooldown
    global.cancionCooldownCache.set(claveCache, ahora);

    // Limpiar cache antiguo (más de 5 minutos)
    for (const [clave, tiempo] of global.cancionCooldownCache.entries()) {
      if (ahora - tiempo > 5 * 60 * 1000) {
        global.cancionCooldownCache.delete(clave);
      }
    }

    // Logging para monitoreo de seguridad
    console.log(
      `[COMPARTIR PÚBLICO] Canción: ${
        cancion.titulo
      } | IP: ${ipUsuario} | User-Agent: ${req.get("user-agent")}`
    );

    // Retornar datos básicos (sin info sensible)
    return sendSuccess(res, {
      cancion: {
        _id: cancion._id,
        titulo: cancion.titulo,
        artistas: cancion.artistas,
        album: cancion.album,
        portadaUrl: cancion.portadaUrl,
        audioUrl: cancion.audioUrl,
        duracionSegundos: cancion.duracionSegundos,
        generos: cancion.generos,
        esExplicita: cancion.esExplicita,
        reproducciones: cancion.reproducciones,
        createdAt: cancion.createdAt,
      },
      mensaje:
        "Esta canción fue compartida contigo. Regístrate para comentar, dar like y descubrir más música.",
    });
  } catch (error) {
    console.error("Error en obtenerCancionPublica:", error);
    return sendServerError(
      res,
      error,
      "Error al obtener la canción compartida"
    );
  }
};

// 📌 Actualizar canción (solo si soy artista)
export const actualizarCancion = async (req, res) => {
  try {
    const camposPermitidos = [
      "titulo",
      "generos",
      "esPrivada",
      "esExplicita",
      "portadaUrl",
      "album",
    ];
    const actualizaciones = {};

    for (const campo of camposPermitidos) {
      if (campo in req.body) actualizaciones[campo] = req.body[campo];
    }

    if ("titulo" in actualizaciones) {
      actualizaciones.titulo = String(actualizaciones.titulo).trim();
    }

    if (
      "generos" in actualizaciones &&
      !Array.isArray(actualizaciones.generos)
    ) {
      actualizaciones.generos = [];
    }

    // Obtener canción antes de actualizar para eliminar portada antigua
    const cancionAnterior = await Cancion.findOne({
      _id: req.params.id,
      artistas: req.userId,
      estaEliminada: false,
    });

    if (!cancionAnterior) {
      return sendNotFound(res, "Canción o no tienes permisos");
    }

    // Si se está actualizando la portada, eliminar la anterior de R2
    if (
      "portadaUrl" in actualizaciones &&
      cancionAnterior.portadaUrl &&
      cancionAnterior.portadaUrl !== actualizaciones.portadaUrl &&
      cancionAnterior.portadaUrl.includes("cloudflare")
    ) {
      const { eliminarArchivoR2 } = await import("../services/r2Service.js");
      eliminarArchivoR2(cancionAnterior.portadaUrl).catch((err) =>
        console.error("Error eliminando portada antigua de R2:", err)
      );
    }

    const cancion = await Cancion.findOneAndUpdate(
      { _id: req.params.id, artistas: req.userId, estaEliminada: false },
      { $set: actualizaciones },
      { new: true }
    );

    if (!cancion) {
      return sendNotFound(res, "Canción o no tienes permisos");
    }

    // Recalcular si es single
    if ("album" in actualizaciones) {
      cancion.esSingle = !cancion.album;
      await cancion.save();
    }

    return sendSuccess(res, {
      message: "Canción actualizada correctamente",
      cancion,
    });
  } catch (error) {
    console.error("Error en actualizarCancion:", error);
    return sendServerError(res, error, "Error al actualizar la canción");
  }
};

// 📌 Eliminar canción (borrado físico completo)
// Al eliminar la canción, se eliminan TODOS los datos relacionados: comentarios, likes, reproducciones, notificaciones
export const eliminarCancion = async (req, res) => {
  try {
    // Buscar la canción primero
    const cancion = await Cancion.findOne({
      _id: req.params.id,
      artistas: req.userId,
      estaEliminada: false,
    });

    if (!cancion) {
      return sendNotFound(res, "Canción o no tienes permisos");
    }

    // Importar modelos necesarios
    const { Playlist } = await import("../models/playlistModels.js");
    const { Album } = await import("../models/albumModels.js");
    const { Comentario } = await import("../models/comentarioModels.js");
    const { Reproduccion } = await import("../models/reproduccionModels.js");
    const { Notificacion } = await import("../models/notificacionModels.js");
    const { eliminarArchivoR2 } = await import("../services/r2Service.js");

    console.log(`🗑️ Eliminando canción completa: ${cancion.titulo}`);

    // 1. Eliminar todos los comentarios de esta canción
    const comentariosEliminados = await Comentario.deleteMany({
      cancionDestino: cancion._id,
    });
    console.log(
      `🗑️ Comentarios eliminados: ${comentariosEliminados.deletedCount}`
    );

    // 2. Eliminar todas las reproducciones de esta canción
    const reproduccionesEliminadas = await Reproduccion.deleteMany({
      cancion: cancion._id,
    });
    console.log(
      `🗑️ Reproducciones eliminadas: ${reproduccionesEliminadas.deletedCount}`
    );

    // 3. Eliminar todas las notificaciones relacionadas con esta canción
    const notificacionesEliminadas = await Notificacion.deleteMany({
      "recurso.id": cancion._id,
    });
    console.log(
      `🗑️ Notificaciones eliminadas: ${notificacionesEliminadas.deletedCount}`
    );

    // 4. Eliminar la canción de todas las playlists
    await Playlist.updateMany(
      { canciones: cancion._id },
      { $pull: { canciones: cancion._id } }
    );

    // 5. Eliminar la canción de todos los álbumes
    await Album.updateMany(
      { canciones: cancion._id },
      { $pull: { canciones: cancion._id } }
    );

    // 6. Borrar archivos en R2
    try {
      if (cancion.audioUrl) {
        console.log(`🗑️ Eliminando audio de R2: ${cancion.audioUrl}`);
        await eliminarArchivoR2(cancion.audioUrl);
      }
      if (cancion.portadaUrl && cancion.portadaUrl.includes("cloudflare")) {
        console.log(`🗑️ Eliminando portada de R2: ${cancion.portadaUrl}`);
        await eliminarArchivoR2(cancion.portadaUrl);
      }
    } catch (r2Error) {
      console.error("⚠️ Error eliminando archivos de R2:", r2Error);
    }

    // 7. Eliminar la canción de la base de datos
    await Cancion.findByIdAndDelete(cancion._id);
    console.log(`✅ Canción eliminada completamente de la base de datos`);

    return sendSuccess(
      res,
      null,
      "Canción eliminada completamente de toda la plataforma"
    );
  } catch (error) {
    console.error("Error en eliminarCancion:", error);
    return sendServerError(res, error, "Error al eliminar la canción");
  }
};

// 📌 Toggle like/unlike en una canción
export const toggleLike = async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.id).populate(
      "artistas",
      "_id"
    );

    const validation = validateSongAvailability(cancion, req.userId);
    if (!validation.valid) {
      return sendError(res, validation.error, 404);
    }

    const usuarioId = String(req.userId);
    const likesAnteriores = cancion.likes.length;
    const esPropia = isArtist(cancion, usuarioId);

    // Toggle like usando helper
    const { liked, totalLikes } = toggleLikeOnResource(cancion, usuarioId);

    // Actualizar biblioteca (solo si no es propia)
    if (!esPropia) {
      if (liked) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $addToSet: { "biblioteca.cancionesGuardadas": req.params.id },
        });
      } else {
        await Usuario.findByIdAndUpdate(req.userId, {
          $pull: { "biblioteca.cancionesGuardadas": req.params.id },
        });
      }
    }

    await cancion.save();

    // Notificar hitos usando helper
    if (liked) {
      const hito = getMilestone(likesAnteriores, totalLikes);

      if (hito) {
        const { Notificacion } = await import(
          "../models/notificacionModels.js"
        );

        for (const artista of cancion.artistas) {
          await Notificacion.create({
            usuarioDestino: artista._id,
            usuarioOrigen: null,
            tipo: "sistema",
            mensaje: `🎉 ¡Tu canción "${cancion.titulo}" ha alcanzado ${hito} me gusta!`,
            recurso: {
              tipo: "song",
              id: cancion._id,
            },
          });
        }
      }
    }

    return sendSuccess(res, { liked, totalLikes });
  } catch (error) {
    console.error("Error en toggleLike:", error);
    return sendServerError(res, error, "Error al procesar el like");
  }
};

// 📌 Contar reproducción de canción (+1)
export const contarReproduccion = async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.id);

    const validation = validateSongAvailability(cancion, req.userId);
    if (!validation.valid) {
      return sendError(res, validation.error, 404);
    }

    // Verificar restricción de contenido explícito
    if (cancion.esExplicita) {
      if (!req.userId) {
        return sendUnauthorized(
          res,
          "Debes iniciar sesión para reproducir contenido explícito"
        );
      }

      const usuario = await Usuario.findById(req.userId).select(
        "fechaNacimiento"
      );

      if (!usuario) {
        return sendNotFound(res, "Usuario");
      }

      if (!esMayorDeEdad(usuario.fechaNacimiento)) {
        return sendUnauthorized(
          res,
          "Debes ser mayor de 18 años para reproducir contenido explícito"
        );
      }
    }

    // Incrementar reproducciones de la canción
    cancion.reproduccionesTotales += 1;
    await cancion.save();

    // Actualizar estadísticas del usuario que está escuchando (si está autenticado)
    if (req.userId) {
      await Usuario.findByIdAndUpdate(req.userId, {
        $inc: {
          "estadisticas.reproduccionesTotales": 1,
          "estadisticas.totalCancionesEscuchadas": 1,
          "estadisticas.tiempoTotalEscuchado": Math.floor(
            cancion.duracionSegundos / 60
          ), // Convertir a minutos
        },
      });

      // Agregar al historial de reproducciones (máximo 50 canciones)
      await Usuario.findByIdAndUpdate(req.userId, {
        $push: {
          historialReproducciones: {
            $each: [{ cancion: cancion._id, fecha: new Date() }],
            $slice: -50, // Mantener solo las últimas 50
          },
        },
      });
    }

    return sendSuccess(res, {
      reproduccionesTotales: cancion.reproduccionesTotales,
    });
  } catch (error) {
    console.error("Error en contarReproduccion:", error);
    return sendServerError(res, error, "Error al contar reproducción");
  }
};

// 📌 Verificar acceso a canción (antes de reproducir)
export const verificarAccesoCancion = async (req, res) => {
  try {
    const { id } = req.params;

    const cancion = await Cancion.findById(id);

    const validation = validateSongAvailability(cancion, req.userId);
    if (!validation.valid) {
      return sendError(res, validation.error, 404);
    }

    // Verificar acceso a contenido privado usando helper
    const hasAccess = hasAccessToPrivateResource(
      cancion,
      req.userId,
      req.userRole
    );

    if (!hasAccess) {
      return sendSuccess(res, {
        puedeReproducir: false,
        message: "Esta canción es privada",
        esPrivada: true,
      });
    }

    // Verificar contenido explícito
    if (cancion.esExplicita) {
      if (!req.userId) {
        return sendSuccess(res, {
          puedeReproducir: false,
          message: "Debes iniciar sesión para reproducir contenido explícito",
          esExplicita: true,
          requiereLogin: true,
        });
      }

      const usuario = await Usuario.findById(req.userId).select(
        "fechaNacimiento"
      );

      if (!usuario) {
        return sendNotFound(res, "Usuario");
      }

      if (!esMayorDeEdad(usuario.fechaNacimiento)) {
        return sendSuccess(res, {
          puedeReproducir: false,
          message:
            "Debes ser mayor de 18 años para reproducir contenido explícito",
          esExplicita: true,
          restriccionEdad: true,
        });
      }
    }

    return sendSuccess(res, {
      puedeReproducir: true,
      message: "Acceso permitido",
    });
  } catch (error) {
    console.error("Error en verificarAccesoCancion:", error);
    return sendServerError(res, error, "Error al verificar acceso");
  }
};

/**
 * 📌 BUSCAR CANCIONES
 * Buscar canciones por título o artista
 */
export const buscarCanciones = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return sendValidationError(res, [
        "La búsqueda debe tener al menos 2 caracteres",
      ]);
    }

    const regex = new RegExp(q.trim(), "i");

    // Primero buscar usuarios que coincidan con la búsqueda (artistas)
    // SOLO por nick o nombreArtistico
    const artistasCoincidentes = await Usuario.find({
      $or: [{ nick: regex }, { nombreArtistico: regex }],
      role: "user",
    }).select("_id");

    const artistaIds = artistasCoincidentes.map((a) => a._id);

    // Verificar si el usuario es menor de edad
    let esMenorDeEdad = false;
    if (req.userId) {
      const usuario = await Usuario.findById(req.userId).select(
        "fechaNacimiento"
      );
      if (usuario && usuario.fechaNacimiento) {
        const { calcularEdad } = await import("../helpers/edadHelper.js");
        esMenorDeEdad = calcularEdad(usuario.fechaNacimiento) < 18;
      }
    }

    // Construir filtro de búsqueda
    const searchFilter = {
      $or: [
        { titulo: regex },
        { artistas: { $in: artistaIds } }, // Canciones de artistas que coincidan
        { generos: { $regex: regex } }, // Búsqueda por género
      ],
      esPrivada: false,
      estaEliminada: false,
    };

    // Si el usuario es menor de edad, filtrar canciones explícitas
    if (esMenorDeEdad) {
      searchFilter.esExplicita = { $ne: true };
    }

    // Buscar canciones por título, artista O género
    const canciones = await Cancion.find(searchFilter)
      .populate(
        "artistas",
        "nombre apellidos nick nombreArtistico avatarUrl verificado"
      )
      .populate("album", "titulo portadaUrl")
      .select(
        "titulo artistas audioUrl portadaUrl duracionSegundos generos reproduccionesTotales likes esExplicita oculta razonOculta"
      )
      .limit(50)
      .sort({ reproduccionesTotales: -1 }); // Ordenar por popularidad

    return sendSuccess(res, {
      canciones,
      total: canciones.length,
    });
  } catch (error) {
    console.error("Error en buscarCanciones:", error);
    return sendServerError(res, error, "Error al buscar canciones");
  }
};
