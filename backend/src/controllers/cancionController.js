// src/controllers/cancionController.js
import mongoose from "mongoose";
import { Cancion } from "../models/cancionModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { esMayorDeEdad } from "../helpers/edadHelper.js";
import { notificarNuevaCancion } from "../helpers/notificacionHelper.js";

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

    // Validaciones
    if (!titulo?.trim() || !audioUrl?.trim() || !duracionSegundos) {
      return res.status(400).json({
        ok: false,
        message:
          "Faltan campos obligatorios (titulo, audioUrl, duracionSegundos)",
      });
    }

    if (Number(duracionSegundos) <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La duración debe ser mayor a 0",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no autenticado",
      });
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

    // Actualizar usuario: añadir a misCanciones
    await Usuario.findByIdAndUpdate(req.userId, {
      $push: { misCanciones: cancion._id },
    });

    // Notificar a seguidores (sin esperar)
    notificarNuevaCancion(cancion, req.userId);

    return res.status(201).json({
      ok: true,
      message: "Canción creada correctamente",
      cancion,
    });
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

    return res.status(200).json({
      ok: true,
      canciones,
    });
  } catch (error) {
    console.error("Error en misCanciones:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener las canciones",
    });
  }
};

// 📌 Buscar en mis canciones (donde yo figuro como artista)
export const buscarMisCanciones = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        ok: false,
        message: "La búsqueda debe tener al menos 2 caracteres",
      });
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

    return res.status(200).json({
      ok: true,
      canciones,
      total: canciones.length,
    });
  } catch (error) {
    console.error("Error en buscarMisCanciones:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al buscar canciones",
    });
  }
};

// 📌 Obtener canción por ID
export const obtenerCancion = async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.id)
      .populate("artistas", "nick nombre nombreArtistico avatarUrl")
      .populate("album", "titulo portadaUrl");

    if (!cancion || cancion.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada",
      });
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

    return res.status(200).json({
      ok: true,
      cancion,
      restricciones: {
        puedeReproducir,
        motivoRestriccion,
        esExplicita: cancion.esExplicita,
      },
    });
  } catch (error) {
    console.error("Error en obtenerCancion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener la canción",
    });
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
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada o no tienes permisos",
      });
    }

    // Recalcular si es single
    if ("album" in actualizaciones) {
      cancion.esSingle = !cancion.album;
      await cancion.save();
    }

    return res.status(200).json({
      ok: true,
      message: "Canción actualizada correctamente",
      cancion,
    });
  } catch (error) {
    console.error("Error en actualizarCancion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar la canción",
    });
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
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada o no tienes permisos",
      });
    }

    // Opcional: borrar archivos en R2
    // await borrarArchivoR2PorUrl(cancion.audioUrl);
    // if (cancion.portadaUrl) await borrarArchivoR2PorUrl(cancion.portadaUrl);

    return res.status(200).json({
      ok: true,
      message: "Canción eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en eliminarCancion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar la canción",
    });
  }
};

// 📌 Toggle like/unlike en una canción
export const toggleLike = async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.id).populate(
      "artistas",
      "_id"
    );

    if (!cancion || cancion.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada",
      });
    }

    const usuarioId = String(req.userId);
    const yaLeDioLike = cancion.likes.some((id) => String(id) === usuarioId);
    const likesAnteriores = cancion.likes.length;

    // Verificar si el usuario es el artista de la canción
    const esPropia = cancion.artistas.some(
      (artista) => String(artista._id) === usuarioId
    );

    if (yaLeDioLike) {
      // Quitar like de la canción
      cancion.likes = cancion.likes.filter((id) => String(id) !== usuarioId);

      // Quitar de biblioteca (solo si no es propia)
      if (!esPropia) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $pull: { "biblioteca.cancionesGuardadas": req.params.id },
        });
      }
    } else {
      // Agregar like a la canción
      cancion.likes.push(req.userId);

      // Agregar a biblioteca SOLO si NO es tu propia canción
      if (!esPropia) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $addToSet: { "biblioteca.cancionesGuardadas": req.params.id },
        });
      }
    }

    await cancion.save();

    // Notificar hitos de likes (10, 50, 100, 500, 1000)
    const hitos = [10, 50, 100, 500, 1000, 5000, 10000];
    const nuevosLikes = cancion.likes.length;

    if (
      !yaLeDioLike &&
      hitos.includes(nuevosLikes) &&
      nuevosLikes > likesAnteriores
    ) {
      // Importar Notificacion
      const { Notificacion } = await import("../models/notificacionModels.js");

      // Notificar a cada artista
      for (const artista of cancion.artistas) {
        await Notificacion.create({
          usuarioDestino: artista._id,
          usuarioOrigen: null, // Sistema
          tipo: "sistema",
          mensaje: `🎉 ¡Tu canción "${cancion.titulo}" ha alcanzado ${nuevosLikes} me gusta!`,
          recurso: {
            tipo: "song",
            id: cancion._id,
          },
        });
      }
    }

    return res.status(200).json({
      ok: true,
      liked: !yaLeDioLike,
      totalLikes: cancion.likes.length,
    });
  } catch (error) {
    console.error("Error en toggleLike:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al procesar el like",
    });
  }
};

// 📌 Contar reproducción de canción (+1)
export const contarReproduccion = async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.id);

    if (!cancion || cancion.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada",
      });
    }

    // Verificar restricción de contenido explícito
    if (cancion.esExplicita) {
      if (!req.userId) {
        return res.status(403).json({
          ok: false,
          message: "Debes iniciar sesión para reproducir contenido explícito",
          esExplicita: true,
          requiereLogin: true,
        });
      }

      const usuario = await Usuario.findById(req.userId).select(
        "fechaNacimiento"
      );

      if (!usuario) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      if (!esMayorDeEdad(usuario.fechaNacimiento)) {
        return res.status(403).json({
          ok: false,
          message:
            "Debes ser mayor de 18 años para reproducir contenido explícito",
          esExplicita: true,
          restriccionEdad: true,
        });
      }
    }

    // Incrementar reproducciones
    cancion.reproduccionesTotales += 1;
    await cancion.save();

    return res.status(200).json({
      ok: true,
      reproduccionesTotales: cancion.reproduccionesTotales,
    });
  } catch (error) {
    console.error("Error en contarReproduccion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al contar reproducción",
    });
  }
};

// 📌 Verificar acceso a canción (antes de reproducir)
export const verificarAccesoCancion = async (req, res) => {
  try {
    const { id } = req.params;

    const cancion = await Cancion.findById(id);

    if (!cancion || cancion.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada",
      });
    }

    // Verificar si es privada
    if (cancion.esPrivada) {
      // Solo el artista puede acceder
      const esArtista = cancion.artistas.some(
        (artistaId) => artistaId.toString() === req.userId
      );

      if (!esArtista && req.userRole !== "admin") {
        return res.status(403).json({
          ok: false,
          puedeReproducir: false,
          message: "Esta canción es privada",
          esPrivada: true,
        });
      }
    }

    // Verificar contenido explícito
    if (cancion.esExplicita) {
      if (!req.userId) {
        return res.status(200).json({
          ok: true,
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
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      if (!esMayorDeEdad(usuario.fechaNacimiento)) {
        return res.status(200).json({
          ok: true,
          puedeReproducir: false,
          message:
            "Debes ser mayor de 18 años para reproducir contenido explícito",
          esExplicita: true,
          restriccionEdad: true,
        });
      }
    }

    return res.status(200).json({
      ok: true,
      puedeReproducir: true,
      message: "Acceso permitido",
    });
  } catch (error) {
    console.error("Error en verificarAccesoCancion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al verificar acceso",
    });
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
      return res.status(400).json({
        ok: false,
        message: "La búsqueda debe tener al menos 2 caracteres",
      });
    }

    const regex = new RegExp(q.trim(), "i");

    // Buscar canciones por título
    const canciones = await Cancion.find({
      titulo: regex,
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
      .limit(20);

    return res.status(200).json({
      ok: true,
      canciones,
      total: canciones.length,
    });
  } catch (error) {
    console.error("Error en buscarCanciones:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al buscar canciones",
    });
  }
};
