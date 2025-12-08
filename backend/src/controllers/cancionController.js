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

// 📌 Eliminar canción (borrado lógico, solo artista)
export const eliminarCancion = async (req, res) => {
  try {
    const cancion = await Cancion.findOneAndUpdate(
      { _id: req.params.id, artistas: req.userId, estaEliminada: false },
      { $set: { estaEliminada: true } },
      { new: true }
    );

    if (!cancion) {
      return sendNotFound(res, "Canción o no tienes permisos");
    }

    // Opcional: borrar archivos en R2
    // await borrarArchivoR2PorUrl(cancion.audioUrl);
    // if (cancion.portadaUrl) await borrarArchivoR2PorUrl(cancion.portadaUrl);

    return sendSuccess(res, null, "Canción eliminada correctamente");
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

    // Buscar canciones por título O por artista
    const canciones = await Cancion.find({
      $or: [
        { titulo: regex },
        { artistas: { $in: artistaIds } }, // Canciones de artistas que coincidan
      ],
      esPrivada: false,
      estaEliminada: false,
    })
      .populate(
        "artistas",
        "nombre apellidos nick nombreArtistico avatarUrl verificado"
      )
      .populate("album", "titulo portadaUrl")
      .select(
        "titulo artistas audioUrl portadaUrl duracionSegundos generos reproduccionesTotales likes"
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
