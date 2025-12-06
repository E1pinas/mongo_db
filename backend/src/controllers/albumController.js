// src/controllers/albumController.js
import { Album } from "../models/albumModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Cancion } from "../models/cancionModels.js";
import { eliminarArchivoR2 } from "../services/r2Service.js";
import { notificarNuevoAlbum } from "../helpers/notificacionHelper.js";
// 📌 Crear álbum (usuario logueado)
export const crearAlbum = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      portadaUrl,
      generos,
      fechaLanzamiento,
      esPrivado,
    } = req.body;

    // 1. Validación básica
    if (!titulo) {
      return res.status(400).json({
        ok: false,
        message: "El título del álbum es obligatorio",
      });
    }

    const artistaId = req.userId; // viene del middleware authRequired

    // 2. Crear álbum
    const nuevoAlbum = new Album({
      titulo,
      descripcion: descripcion || "",
      portadaUrl: portadaUrl || "",
      generos: generos || [],
      fechaLanzamiento: fechaLanzamiento || null,
      esPrivado: esPrivado ?? false,
      artistas: [artistaId],
      canciones: [], // se llenará después
    });

    await nuevoAlbum.save();

    // 3. Actualizar usuario: añadir a misAlbumes y estadística
    await Usuario.findByIdAndUpdate(artistaId, {
      $push: { misAlbumes: nuevoAlbum._id },
      $inc: { "estadisticas.totalAlbumesSubidos": 1 },
    });

    // Notificar a seguidores (sin esperar)
    notificarNuevoAlbum(nuevoAlbum, artistaId);

    return res.status(201).json({
      ok: true,
      message: "Álbum creado correctamente",
      album: nuevoAlbum,
    });
  } catch (error) {
    console.error("Error en crearAlbum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear el álbum",
    });
  }
};

// 📌 Obtener un álbum por ID (público, pero ocultando eliminados)
export const obtenerAlbumPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findOne({
      _id: id,
      estaEliminado: false,
    })
      .populate("artistas", "nick nombreArtistico avatarUrl")
      .populate({
        path: "canciones",
        match: { estaEliminada: false }, // solo canciones activas
        select:
          "titulo duracionSegundos audioUrl portadaUrl esPrivada artistas esExplicita generos likes",
        populate: {
          path: "artistas",
          select: "nick nombreArtistico avatarUrl verificado",
        },
      })
      .select("+likes"); // Incluir el campo likes

    if (!album) {
      return res.status(404).json({
        ok: false,
        message: "Álbum no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      album,
    });
  } catch (error) {
    console.error("Error en obtenerAlbumPorId:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener el álbum",
    });
  }
};

// 📌 Listar álbumes públicos (tipo “nuevos álbumes”)
export const listarAlbumesPublicos = async (req, res) => {
  try {
    const albumes = await Album.find({
      esPrivado: false,
      estaEliminado: false,
    })
      .sort({ createdAt: -1 }) // últimos creados primero
      .limit(50)
      .populate("artistas", "nick nombreArtistico avatarUrl");

    return res.status(200).json({
      ok: true,
      albumes,
    });
  } catch (error) {
    console.error("Error en listarAlbumesPublicos:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al listar álbumes",
    });
  }
};

// 📌 Añadir una canción a un álbum (solo dueño o admin)
export const agregarCancionAAlbum = async (req, res) => {
  try {
    const { idAlbum, idCancion } = req.params;

    const album = await Album.findById(idAlbum);
    if (!album || album.estaEliminado) {
      return res.status(404).json({
        ok: false,
        message: "Álbum no encontrado",
      });
    }

    const cancion = await Cancion.findById(idCancion);
    if (!cancion || cancion.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Canción no encontrada",
      });
    }

    // Comprobar permisos: artista del álbum o admin
    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === req.userId
    );
    const esAdmin = req.userRole === "admin";

    if (!esAutor && !esAdmin) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para modificar este álbum",
      });
    }

    // Añadir canción al álbum (sin duplicados)
    album.canciones.addToSet(cancion._id);
    await album.save();

    // Opcional: actualizar referencia de la canción al álbum
    cancion.album = album._id;
    await cancion.save();

    return res.status(200).json({
      ok: true,
      message: "Canción añadida al álbum",
      album,
    });
  } catch (error) {
    console.error("Error en agregarCancionAAlbum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al añadir canción al álbum",
    });
  }
};

// 📌 Eliminar álbum (borrado lógico, solo dueño o admin)
export const eliminarAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id);

    if (!album || album.estaEliminado) {
      return res.status(404).json({
        ok: false,
        message: "Álbum no encontrado",
      });
    }

    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === req.userId
    );
    const esAdmin = req.userRole === "admin";

    if (!esAutor && !esAdmin) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para eliminar este álbum",
      });
    }

    album.estaEliminado = true;
    await album.save();

    // Opcional: quitar el álbum de misAlbumes del usuario
    await Usuario.updateMany(
      { misAlbumes: album._id },
      { $pull: { misAlbumes: album._id } }
    );

    return res.status(200).json({
      ok: true,
      message: "Álbum eliminado (marcado como eliminado)",
    });
  } catch (error) {
    console.error("Error en eliminarAlbum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar el álbum",
    });
  }
};

// 📌 ACTUALIZAR PORTADA DE ÁLBUM
// Flujo recomendado:
// 1) Subir imagen con POST /subida/imagen/album -> devuelve { url }
// 2) Llamar a PATCH /album/:id/portada con { nuevaPortadaUrl }

export const actualizarPortadaAlbum = async (req, res) => {
  try {
    const { idAlbum } = req.params;
    const { nuevaPortadaUrl } = req.body;
    const usuarioId = req.userId;
    const userRole = req.userRole;

    if (!nuevaPortadaUrl) {
      return res.status(400).json({
        ok: false,
        message: "Falta nuevaPortadaUrl en el body",
      });
    }

    const album = await Album.findById(idAlbum);

    if (!album || album.estaEliminado) {
      return res.status(404).json({
        ok: false,
        message: "Álbum no encontrado o eliminado",
      });
    }

    // Solo pueden cambiar la portada:
    // - artistas del álbum
    // - admin
    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === usuarioId
    );
    const esAdmin = userRole === "admin";

    if (!esAutor && !esAdmin) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para modificar este álbum",
      });
    }

    const oldUrl = album.portadaUrl;

    album.portadaUrl = nuevaPortadaUrl;
    await album.save();

    await eliminarArchivoR2(oldUrl);

    return res.status(200).json({
      ok: true,
      message: "Portada del álbum actualizada correctamente",
      album,
    });
  } catch (error) {
    console.error("Error en actualizarPortadaAlbum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar portada del álbum",
    });
  }
};

/**
 * 📌 BUSCAR ÁLBUMES
 * Buscar álbumes por título
 */
export const buscarAlbumes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        ok: false,
        message: "La búsqueda debe tener al menos 2 caracteres",
      });
    }

    const regex = new RegExp(q.trim(), "i");

    const albumes = await Album.find({
      titulo: regex,
      esPrivado: false,
    })
      .populate(
        "artistas",
        "nombre apellidos nick nombreArtistico avatarUrl verificado"
      )
      .select(
        "titulo descripcion portadaUrl generos fechaLanzamiento canciones"
      )
      .limit(20);

    return res.status(200).json({
      ok: true,
      albumes,
      total: albumes.length,
    });
  } catch (error) {
    console.error("Error en buscarAlbumes:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al buscar álbumes",
    });
  }
};

/**
 * 📌 TOGGLE LIKE EN ÁLBUM
 * Agregar/quitar like en un álbum y añadir/quitar de biblioteca
 */
export const toggleLikeAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate(
      "artistas",
      "_id"
    );

    if (!album || album.estaEliminado) {
      return res.status(404).json({
        ok: false,
        message: "Álbum no encontrado",
      });
    }

    const usuarioId = String(req.userId);
    const yaLeDioLike = album.likes.some((id) => String(id) === usuarioId);
    const likesAnteriores = album.likes.length;

    // Verificar si el usuario es artista del álbum
    const esPropio = album.artistas.some(
      (artista) => String(artista._id) === usuarioId
    );

    if (yaLeDioLike) {
      // Quitar like del álbum
      album.likes = album.likes.filter((id) => String(id) !== usuarioId);

      // Quitar de biblioteca (solo si no es propio)
      if (!esPropio) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $pull: { "biblioteca.albumesGuardados": req.params.id },
        });
      }
    } else {
      // Agregar like al álbum
      album.likes.push(req.userId);

      // Agregar a biblioteca SOLO si NO es tu propio álbum
      if (!esPropio) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $addToSet: { "biblioteca.albumesGuardados": req.params.id },
        });
      }
    }

    await album.save();

    // Notificar hitos de likes (10, 50, 100, 500, 1000)
    const hitos = [10, 50, 100, 500, 1000, 5000, 10000];
    const nuevosLikes = album.likes.length;

    if (
      !yaLeDioLike &&
      hitos.includes(nuevosLikes) &&
      nuevosLikes > likesAnteriores
    ) {
      // Importar Notificacion
      const { Notificacion } = await import("../models/notificacionModels.js");

      // Notificar a cada artista
      for (const artista of album.artistas) {
        await Notificacion.create({
          usuarioDestino: artista._id,
          usuarioOrigen: null, // Sistema
          tipo: "sistema",
          mensaje: `🎉 ¡Tu álbum "${album.titulo}" ha alcanzado ${nuevosLikes} me gusta!`,
          recurso: {
            tipo: "album",
            id: album._id,
          },
        });
      }
    }

    return res.status(200).json({
      ok: true,
      liked: !yaLeDioLike,
      totalLikes: album.likes.length,
    });
  } catch (error) {
    console.error("Error en toggleLikeAlbum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al procesar el like del álbum",
    });
  }
};
