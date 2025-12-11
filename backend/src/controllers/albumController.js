// src/controllers/albumController.js
import { Album } from "../models/albumModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Cancion } from "../models/cancionModels.js";
import Post from "../models/postModels.js";
import { Comentario } from "../models/comentarioModels.js";
import { eliminarArchivoR2 } from "../services/r2Service.js";
import { notificarNuevoAlbum } from "../helpers/notificacionHelper.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendServerError,
  sendCreated,
  sendUnauthorized,
} from "../helpers/responseHelpers.js";
import {
  toggleLikeOnResource,
  isArtist,
  getMilestone,
  getAlbumPopulateOptions,
} from "../helpers/musicHelpers.js";
import { validateRequired } from "../helpers/validationHelpers.js";
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
    const errors = validateRequired({ titulo });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const artistaId = req.userId; // viene del middleware authRequired

    // Verificar que el usuario puede subir contenido
    const usuario = await Usuario.findById(artistaId);
    if (!usuario) {
      return sendNotFound(res, "Usuario");
    }

    if (!usuario.puedeSubirContenido || usuario.role !== "user") {
      return sendUnauthorized(res, "No tienes permisos para crear álbumes");
    }

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

    return sendCreated(res, {
      message: "Álbum creado correctamente",
      album: nuevoAlbum,
    });
  } catch (error) {
    console.error("Error en crearAlbum:", error);
    return sendServerError(res, error, "Error al crear el álbum");
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
        match: {
          estaEliminada: false,
          // Si el álbum es público, filtrar canciones privadas
        },
        select:
          "titulo duracionSegundos audioUrl portadaUrl esPrivada artistas esExplicita generos likes oculta razonOculta",
        populate: {
          path: "artistas",
          select: "nick nombreArtistico avatarUrl verificado",
        },
      })
      .select("+likes"); // Incluir el campo likes

    if (!album) {
      return sendNotFound(res, "Álbum");
    }

    // Verificar si el usuario es menor de edad
    let esMenorDeEdad = false;
    if (req.userId) {
      const { Usuario } = await import("../models/usuarioModels.js");
      const usuario = await Usuario.findById(req.userId).select(
        "fechaNacimiento"
      );
      if (usuario && usuario.fechaNacimiento) {
        const { calcularEdad } = await import("../helpers/edadHelper.js");
        esMenorDeEdad = calcularEdad(usuario.fechaNacimiento) < 18;
      }
    }

    // Filtrar canciones privadas, ocultas y explícitas
    if (album.canciones) {
      album.canciones = album.canciones.filter((cancion) => {
        if (!cancion) return false;
        // Filtrar canciones ocultas por moderación
        if (cancion.oculta) return false;
        // Si el álbum es público, filtrar canciones privadas
        if (!album.esPrivado && cancion.esPrivada) return false;
        // Si el usuario es menor de edad, filtrar canciones explícitas
        if (esMenorDeEdad && cancion.esExplicita === true) return false;
        return true;
      });
    }

    return sendSuccess(res, { album });
  } catch (error) {
    console.error("Error en obtenerAlbumPorId:", error);
    return sendServerError(res, error, "Error al obtener el álbum");
  }
};

// 📌 Listar álbumes públicos (tipo "nuevos álbumes")
export const listarAlbumesPublicos = async (req, res) => {
  try {
    const albumes = await Album.find({
      esPrivado: false,
      estaEliminado: false,
    })
      .sort({ createdAt: -1 }) // últimos creados primero
      .limit(50)
      .populate("artistas", "nick nombreArtistico avatarUrl");

    return sendSuccess(res, { albumes });
  } catch (error) {
    console.error("Error en listarAlbumesPublicos:", error);
    return sendServerError(res, error, "Error al listar álbumes");
  }
};

// 📌 Añadir una canción a un álbum (solo dueño o admin)
export const agregarCancionAAlbum = async (req, res) => {
  try {
    const { idAlbum, idCancion } = req.params;

    const album = await Album.findById(idAlbum);
    if (!album || album.estaEliminado) {
      return sendNotFound(res, "Álbum");
    }

    const cancion = await Cancion.findById(idCancion);
    if (!cancion || cancion.estaEliminada) {
      return sendNotFound(res, "Canción");
    }

    // Comprobar permisos: artista del álbum o admin
    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === req.userId
    );
    const esAdmin = req.userRole === "admin";

    if (!esAutor && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para modificar este álbum"
      );
    }

    // Validar privacidad: No permitir canciones privadas en álbumes públicos
    if (!album.esPrivado && cancion.esPrivada) {
      return sendValidationError(
        res,
        "No puedes agregar canciones privadas a un álbum público. Cambia el álbum a privado o la canción a pública."
      );
    }

    // Añadir canción al álbum (sin duplicados)
    album.canciones.addToSet(cancion._id);
    await album.save();

    // Opcional: actualizar referencia de la canción al álbum
    cancion.album = album._id;
    await cancion.save();

    return sendSuccess(res, {
      message: "Canción añadida al álbum",
      album,
    });
  } catch (error) {
    console.error("Error en agregarCancionAAlbum:", error);
    return sendServerError(res, error, "Error al añadir canción al álbum");
  }
};

// 📌 Quitar canción de un álbum (solo dueño o admin)
export const quitarCancionDeAlbum = async (req, res) => {
  try {
    const { idAlbum, idCancion } = req.params;

    const album = await Album.findById(idAlbum);
    if (!album || album.estaEliminado) {
      return sendNotFound(res, "Álbum");
    }

    // Comprobar permisos: artista del álbum o admin
    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === req.userId
    );
    const esAdmin = req.userRole === "admin";

    if (!esAutor && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para modificar este álbum"
      );
    }

    // Quitar canción del álbum
    album.canciones.pull(idCancion);
    await album.save();

    // Opcional: quitar referencia del álbum en la canción si ya no está en ningún álbum
    const cancion = await Cancion.findById(idCancion);
    if (cancion && cancion.album && cancion.album.toString() === idAlbum) {
      cancion.album = null;
      cancion.esSingle = true;
      await cancion.save();
    }

    return sendSuccess(res, {
      message: "Canción eliminada del álbum",
      album,
    });
  } catch (error) {
    console.error("Error en quitarCancionDeAlbum:", error);
    return sendServerError(res, error, "Error al quitar canción del álbum");
  }
};

// 📌 Eliminar álbum (borrado lógico, solo dueño o admin)
export const eliminarAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id);

    if (!album) {
      return sendNotFound(res, "Álbum");
    }

    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === req.userId
    );
    const esAdmin = req.userRole === "admin";

    if (!esAutor && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para eliminar este álbum"
      );
    }

    // Eliminar portada de R2 si existe
    if (album.portadaUrl && album.portadaUrl.includes("cloudflare")) {
      eliminarArchivoR2(album.portadaUrl).catch((err) =>
        console.error("Error eliminando portada de R2:", err)
      );
    }

    // Quitar el álbum de misAlbumes del usuario
    await Usuario.updateMany(
      { misAlbumes: album._id },
      { $pull: { misAlbumes: album._id } }
    );

    // Eliminar comentarios y posts asociados al álbum
    await Comentario.deleteMany({
      postId: { $in: await Post.find({ recursoId: id }).select("_id") },
    });
    await Post.deleteMany({ recursoId: id });

    // Eliminar el álbum completamente
    await Album.findByIdAndDelete(id);

    return sendSuccess(res, {
      message: "Álbum eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en eliminarAlbum:", error);
    return sendServerError(res, error, "Error al eliminar el álbum");
  }
};

// 📌 ACTUALIZAR ÁLBUM (título, descripción, privacidad, etc.)
export const actualizarAlbum = async (req, res) => {
  try {
    const { idAlbum } = req.params;
    const { titulo, descripcion, generos, esPrivado } = req.body;
    const usuarioId = req.userId;
    const userRole = req.userRole;

    const album = await Album.findById(idAlbum).populate({
      path: "canciones",
      select: "esPrivada",
    });

    if (!album || album.estaEliminado) {
      return sendNotFound(res, "Álbum");
    }

    // Verificar permisos
    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === usuarioId
    );
    const esAdmin = userRole === "admin" || userRole === "super_admin";

    if (!esAutor && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para modificar este álbum"
      );
    }

    // Validar cambio a público: verificar que no haya canciones privadas
    if (esPrivado === false && album.canciones && album.canciones.length > 0) {
      const tieneCancionesPrivadas = album.canciones.some(
        (cancion) => cancion.esPrivada === true
      );

      if (tieneCancionesPrivadas) {
        return sendValidationError(
          res,
          "No puedes hacer público este álbum porque contiene canciones privadas. Cambia las canciones a públicas primero."
        );
      }
    }

    // Actualizar campos
    if (titulo !== undefined) album.titulo = titulo;
    if (descripcion !== undefined) album.descripcion = descripcion;
    if (generos !== undefined) album.generos = generos;
    if (esPrivado !== undefined) album.esPrivado = esPrivado;

    await album.save();

    return sendSuccess(res, {
      message: "Álbum actualizado correctamente",
      album,
    });
  } catch (error) {
    console.error("Error en actualizarAlbum:", error);
    return sendServerError(res, error, "Error al actualizar el álbum");
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

    const errors = validateRequired({ nuevaPortadaUrl });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const album = await Album.findById(idAlbum);

    if (!album || album.estaEliminado) {
      return sendNotFound(res, "Álbum");
    }

    // Verificar permisos: artista del álbum o admin
    const esAutor = album.artistas.some(
      (artistaId) => artistaId.toString() === usuarioId
    );
    const esAdmin = userRole === "admin";

    if (!esAutor && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para modificar este álbum"
      );
    }

    // Borrar antigua portada de R2 (si existe y no es la por defecto)
    if (album.portadaUrl && album.portadaUrl.includes("cloudflare")) {
      try {
        await eliminarArchivoR2(album.portadaUrl);
      } catch (errR2) {
        console.error("Error al eliminar portada antigua de R2:", errR2);
      }
    }

    // Actualizar con la nueva URL
    album.portadaUrl = nuevaPortadaUrl;
    await album.save();

    return sendSuccess(res, {
      message: "Portada del álbum actualizada correctamente",
      album,
    });
  } catch (error) {
    console.error("Error en actualizarPortadaAlbum:", error);
    return sendServerError(res, error, "Error al actualizar portada del álbum");
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
      return sendValidationError(res, [
        "La búsqueda debe tener al menos 2 caracteres",
      ]);
    }

    const regex = new RegExp(q.trim(), "i");

    // Buscar álbumes por título O género
    const albumes = await Album.find({
      $or: [
        { titulo: regex },
        { generos: { $regex: regex } }, // Búsqueda por género
      ],
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

    return sendSuccess(res, {
      albumes,
      total: albumes.length,
    });
  } catch (error) {
    console.error("Error en buscarAlbumes:", error);
    return sendServerError(res, error, "Error al buscar álbumes");
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
      return sendNotFound(res, "Álbum");
    }

    const usuarioId = String(req.userId);
    const likesAnteriores = album.likes.length;
    const esPropio = isArtist(album, usuarioId);

    // Toggle like usando helper
    const { liked, totalLikes } = toggleLikeOnResource(album, usuarioId);

    // Actualizar biblioteca (solo si no es propio)
    if (!esPropio) {
      if (liked) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $addToSet: { "biblioteca.albumesGuardados": req.params.id },
        });
      } else {
        await Usuario.findByIdAndUpdate(req.userId, {
          $pull: { "biblioteca.albumesGuardados": req.params.id },
        });
      }
    }

    await album.save();

    // Notificar hitos usando helper
    if (liked) {
      const hito = getMilestone(likesAnteriores, totalLikes);

      if (hito) {
        const { Notificacion } = await import(
          "../models/notificacionModels.js"
        );

        for (const artista of album.artistas) {
          await Notificacion.create({
            usuarioDestino: artista._id,
            usuarioOrigen: null,
            tipo: "sistema",
            mensaje: `🎉 ¡Tu álbum "${album.titulo}" ha alcanzado ${hito} me gusta!`,
            recurso: {
              tipo: "album",
              id: album._id,
            },
          });
        }
      }
    }

    return sendSuccess(res, { liked, totalLikes });
  } catch (error) {
    console.error("Error en toggleLikeAlbum:", error);
    return sendServerError(res, error, "Error al procesar el like del álbum");
  }
};
