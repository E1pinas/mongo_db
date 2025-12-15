import { Playlist } from "../models/playlistModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Notificacion } from "../models/notificacionModels.js";
import Post from "../models/postModels.js";
import { Comentario } from "../models/comentarioModels.js";
import { eliminarArchivoR2 } from "../services/r2Service.js";
import { notificarNuevaPlaylist } from "../helpers/notificacionHelper.js";
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
  isPlaylistCreator,
  hasAccessToPrivateResource,
} from "../helpers/musicHelpers.js";
import { validateRequired } from "../helpers/validationHelpers.js";

// 📌 Crear una playlist
export const crearPlaylist = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { titulo, descripcion, portadaUrl, esPublica, esColaborativa } =
      req.body;

    const errors = validateRequired({ titulo });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const nuevaPlaylist = new Playlist({
      titulo,
      descripcion: descripcion || "",
      portadaUrl: portadaUrl || "",
      esPublica: esPublica !== undefined ? esPublica : true,
      esColaborativa: esColaborativa || false,
      canciones: [],
      creador: usuarioId,
    });

    await nuevaPlaylist.save();

    // Guardar en el usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      $push: { playlistsCreadas: nuevaPlaylist._id },
    });

    // Notificar a seguidores (sin esperar)
    notificarNuevaPlaylist(nuevaPlaylist, usuarioId);

    return sendCreated(res, {
      message: "Playlist creada correctamente",
      playlist: nuevaPlaylist,
    });
  } catch (error) {
    console.error("Error en crearPlaylist:", error);
    return sendServerError(res, error, "Error al crear playlist");
  }
};

// 📌 Añadir canción a una playlist
export const agregarCancionPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancionId } = req.body;
    const usuarioId = req.userId;

    const errors = validateRequired({ cancionId });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return sendNotFound(res, "Playlist");
    }

    const cancion = await Cancion.findById(cancionId);
    if (!cancion || cancion.estaEliminada) {
      return sendError(res, "La canción no existe o está eliminada", 400);
    }

    // Solo dueño o admin pueden editar su playlist
    const esDuenio = isPlaylistCreator(playlist, usuarioId);
    const esColaborador =
      playlist.esColaborativa &&
      playlist.colaboradores.some((id) => id.toString() === usuarioId);
    const esAdmin = req.userRole === "admin";

    if (!esDuenio && !esColaborador && !esAdmin) {
      return sendUnauthorized(res, "No puedes editar esta playlist");
    }

    // Validar privacidad: No permitir canciones privadas en playlists públicas
    if (playlist.esPublica && cancion.esPrivada) {
      return sendValidationError(
        res,
        "No puedes agregar canciones privadas a una playlist pública. Cambia la playlist a privada o la canción a pública."
      );
    }

    playlist.canciones.addToSet(cancionId);
    await playlist.save();

    return sendSuccess(res, {
      message: "Canción agregada a la playlist",
      playlist,
    });
  } catch (error) {
    console.error("Error en agregarCancionPlaylist:", error);
    return sendServerError(res, error, "Error al agregar canción");
  }
};

// 📌 Quitar canción de una playlist
export const quitarCancionPlaylist = async (req, res) => {
  try {
    const { id, cancionId } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return sendNotFound(res, "Playlist");
    }

    const esDuenio = isPlaylistCreator(playlist, usuarioId);
    const esColaborador =
      playlist.esColaborativa &&
      playlist.colaboradores.some((id) => id.toString() === usuarioId);
    const esAdmin = req.userRole === "admin";

    if (!esDuenio && !esColaborador && !esAdmin) {
      return sendUnauthorized(res, "No puedes editar esta playlist");
    }

    playlist.canciones.pull(cancionId);
    await playlist.save();

    return sendSuccess(res, {
      message: "Canción eliminada de la playlist",
      playlist,
    });
  } catch (error) {
    console.error("Error en quitarCancionPlaylist:", error);
    return sendServerError(res, error, "Error al quitar canción");
  }
};

// 📌 Obtener una playlist por ID (con populate)
export const obtenerPlaylistPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioActualId = req.usuario?.id; // Usuario autenticado (puede ser undefined)

    const playlist = await Playlist.findById(id)
      .populate("creador", "nick nombre nombreArtistico avatarUrl verificado")
      .populate({
        path: "canciones",
        select:
          "titulo audioUrl duracionSegundos portadaUrl artistas likes esPrivada estaEliminada esExplicita oculta razonOculta",
        populate: {
          path: "artistas",
          select: "nick nombre nombreArtistico avatarUrl",
        },
      })
      .select("+seguidores"); // Incluir el campo seguidores

    if (!playlist) {
      return sendNotFound(res, "Playlist");
    }

    // Verificar si el usuario actual es el creador de la playlist
    const esCreador =
      playlist.creador && playlist.creador._id.toString() === usuarioActualId;

    // Si la playlist es privada (esPublica === false) y el usuario NO es el creador, denegar acceso
    if (!playlist.esPublica && !esCreador) {
      return res.status(403).json({
        ok: false,
        mensaje: "Esta playlist es privada",
        esPrivada: true,
      });
    }

    // Verificar si el usuario es menor de edad
    let esMenorDeEdad = false;
    if (usuarioActualId) {
      const { Usuario } = await import("../models/usuarioModels.js");
      const usuario = await Usuario.findById(usuarioActualId).select(
        "fechaNacimiento"
      );
      if (usuario && usuario.fechaNacimiento) {
        const { calcularEdad } = await import("../helpers/edadHelper.js");
        esMenorDeEdad = calcularEdad(usuario.fechaNacimiento) < 18;
      }
    }

    // Filtrar canciones eliminadas, privadas, ocultas y explícitas (para menores)
    if (playlist.canciones) {
      playlist.canciones = playlist.canciones.filter((cancion) => {
        if (!cancion || cancion.estaEliminada) return false;
        // Filtrar canciones ocultas por moderación
        if (cancion.oculta) return false;

        // Si la canción es privada, solo mostrarla si el usuario es uno de los artistas
        if (cancion.esPrivada) {
          const esArtistaDeCancion = cancion.artistas?.some(
            (artista) => artista._id?.toString() === usuarioActualId
          );
          if (!esArtistaDeCancion) return false; // Ocultar canción privada
        }

        // Si el usuario es menor de edad, filtrar canciones explícitas
        if (esMenorDeEdad && cancion.esExplicita === true) return false;
        return true;
      });
    }

    return sendSuccess(res, { playlist });
  } catch (error) {
    console.error("Error en obtenerPlaylistPorId:", error);
    return sendServerError(res, error, "Error al obtener playlist");
  }
};

// 📌 Eliminar Playlist (borrado lógico)
export const eliminarPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return sendNotFound(res, "Playlist");
    }

    const esDuenio = isPlaylistCreator(playlist, usuarioId);
    const esAdmin = req.userRole === "admin";

    if (!esDuenio && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para eliminar la playlist"
      );
    }

    // Eliminar portada de R2 si existe
    if (playlist.portadaUrl && playlist.portadaUrl.includes("cloudflare")) {
      eliminarArchivoR2(playlist.portadaUrl).catch((err) =>
        console.error("Error eliminando portada de R2:", err)
      );
    }

    // Quitarla del usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      $pull: { misPlaylists: playlist._id },
    });

    // Eliminar comentarios y posts asociados a la playlist
    await Comentario.deleteMany({
      postId: { $in: await Post.find({ recursoId: id }).select("_id") },
    });
    await Post.deleteMany({ recursoId: id });

    // Eliminar la playlist completamente
    await Playlist.findByIdAndDelete(id);

    return sendSuccess(res, {
      message: "Playlist eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en eliminarPlaylist:", error);
    return sendServerError(res, error, "Error al eliminar playlist");
  }
};

// 📌 Actualizar Playlist (título, descripción, privacidad, etc.)
export const actualizarPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, esPublica, esColaborativa } = req.body;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(id).populate({
      path: "canciones",
      select: "esPrivada",
    });

    if (!playlist) {
      return sendNotFound(res, "Playlist");
    }

    const esDuenio = isPlaylistCreator(playlist, usuarioId);
    const esAdmin = req.userRole === "admin" || req.userRole === "super_admin";

    if (!esDuenio && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para modificar esta playlist"
      );
    }

    // Validar cambio a público: verificar que no haya canciones privadas
    if (
      esPublica === true &&
      playlist.canciones &&
      playlist.canciones.length > 0
    ) {
      const tieneCancionesPrivadas = playlist.canciones.some(
        (cancion) => cancion.esPrivada === true
      );

      if (tieneCancionesPrivadas) {
        return sendValidationError(
          res,
          "No puedes hacer pública esta playlist porque contiene canciones privadas. Cambia las canciones a públicas primero o elimínalas de la playlist."
        );
      }
    }

    // Actualizar campos
    if (titulo !== undefined) playlist.titulo = titulo;
    if (descripcion !== undefined) playlist.descripcion = descripcion;

    // Si se hace privada y es colaborativa, desactivar modo colaborativo
    if (esPublica === false && playlist.esColaborativa) {
      playlist.esColaborativa = false;
      playlist.colaboradores = [];
    } else if (esPublica !== undefined) {
      playlist.esPublica = esPublica;
    }

    // Si se desactiva el modo colaborativo, remover todos los colaboradores
    if (esColaborativa !== undefined) {
      if (esColaborativa === false && playlist.esColaborativa === true) {
        // Está desactivando el modo colaborativo
        playlist.colaboradores = [];
      }
      playlist.esColaborativa = esColaborativa;
    }

    await playlist.save();

    return sendSuccess(res, {
      message: "Playlist actualizada correctamente",
      playlist,
    });
  } catch (error) {
    console.error("Error en actualizarPlaylist:", error);
    return sendServerError(res, error, "Error al actualizar playlist");
  }
};

// 📌 Actualizar portada de playlist
// Flujo:
// 1) POST /subida/imagen/playlist -> { url }
// 2) PATCH /playlist/:idPlaylist/portada con { nuevaPortadaUrl }
export const actualizarPortadaPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaPortadaUrl } = req.body;
    const usuarioId = req.userId;
    const userRole = req.userRole;

    const errors = validateRequired({ nuevaPortadaUrl });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const playlist = await Playlist.findById(id);

    if (!playlist || playlist.estaEliminada) {
      return sendNotFound(res, "Playlist");
    }

    const esCreador = isPlaylistCreator(playlist, usuarioId);
    const esAdmin = userRole === "admin";

    if (!esCreador && !esAdmin) {
      return sendUnauthorized(
        res,
        "No tienes permisos para modificar esta playlist"
      );
    }

    const oldUrl = playlist.portadaUrl;

    playlist.portadaUrl = nuevaPortadaUrl;
    await playlist.save();

    if (oldUrl && oldUrl.includes("cloudflare")) {
      try {
        await eliminarArchivoR2(oldUrl);
      } catch (errR2) {
        console.error("Error al eliminar portada antigua:", errR2);
      }
    }

    return sendSuccess(res, {
      message: "Portada de la playlist actualizada correctamente",
      playlist,
    });
  } catch (error) {
    console.error("Error en actualizarPortadaPlaylist:", error);
    return sendServerError(
      res,
      error,
      "Error al actualizar portada de playlist"
    );
  }
};

// 📌 Activar/desactivar modo colaborativo
export const toggleModoColaborativo = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(id);

    if (!playlist || playlist.estaEliminada) {
      return sendNotFound(res, "Playlist");
    }

    // Solo el creador puede cambiar el modo colaborativo
    if (!isPlaylistCreator(playlist, usuarioId)) {
      return sendUnauthorized(
        res,
        "Solo el creador puede cambiar el modo colaborativo"
      );
    }

    playlist.esColaborativa = !playlist.esColaborativa;

    // Si se desactiva, limpiar colaboradores
    if (!playlist.esColaborativa) {
      playlist.colaboradores = [];
    }

    await playlist.save();

    return sendSuccess(res, {
      message: `Modo colaborativo ${
        playlist.esColaborativa ? "activado" : "desactivado"
      }`,
      playlist,
    });
  } catch (error) {
    console.error("Error en toggleModoColaborativo:", error);
    return sendServerError(res, error, "Error al cambiar modo colaborativo");
  }
};

// 📌 Invitar colaborador a playlist
export const invitarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { colaboradorId } = req.body;
    const usuarioId = req.userId;

    const errors = validateRequired({ colaboradorId });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const playlist = await Playlist.findById(id);

    if (!playlist || playlist.estaEliminada) {
      return sendNotFound(res, "Playlist");
    }

    // Solo el creador puede invitar colaboradores
    if (!isPlaylistCreator(playlist, usuarioId)) {
      return sendUnauthorized(
        res,
        "Solo el creador puede invitar colaboradores"
      );
    }

    // Verificar que la playlist sea colaborativa
    if (!playlist.esColaborativa) {
      return sendError(res, "La playlist no está en modo colaborativo", 400);
    }

    // Verificar que el usuario exista
    const colaborador = await Usuario.findById(colaboradorId);
    if (!colaborador) {
      return sendNotFound(res, "Usuario");
    }

    // Verificar que no sea el mismo creador
    if (colaboradorId === usuarioId) {
      return sendError(res, "No puedes invitarte a ti mismo", 400);
    }

    // Verificar que no esté ya invitado
    if (playlist.colaboradores.includes(colaboradorId)) {
      return sendError(res, "Este usuario ya es colaborador", 400);
    }

    // Agregar colaborador
    playlist.colaboradores.push(colaboradorId);
    await playlist.save();

    // Crear notificación para el colaborador
    const creador = await Usuario.findById(usuarioId);
    await Notificacion.create({
      usuarioDestino: colaboradorId,
      usuarioOrigen: usuarioId,
      tipo: "nueva_playlist_artista",
      mensaje: `${creador.nick} te ha invitado a colaborar en la playlist "${playlist.titulo}"`,
      recurso: {
        tipo: "playlist",
        id: playlist._id,
      },
    });

    return sendSuccess(res, {
      message: "Colaborador invitado correctamente",
      playlist,
    });
  } catch (error) {
    console.error("Error en invitarColaborador:", error);
    return sendServerError(res, error, "Error al invitar colaborador");
  }
};

// 📌 Eliminar colaborador de playlist
export const eliminarColaborador = async (req, res) => {
  try {
    const { idPlaylist, colaboradorId } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(idPlaylist);

    if (!playlist || playlist.estaEliminada) {
      return sendNotFound(res, "Playlist");
    }

    // Solo el creador puede eliminar colaboradores
    if (!isPlaylistCreator(playlist, usuarioId)) {
      return sendUnauthorized(
        res,
        "Solo el creador puede eliminar colaboradores"
      );
    }

    // Verificar que sea colaborador
    if (!playlist.colaboradores.includes(colaboradorId)) {
      return sendError(res, "Este usuario no es colaborador", 400);
    }

    // Eliminar del array
    playlist.colaboradores.pull(colaboradorId);
    await playlist.save();

    return sendSuccess(res, {
      message: "Colaborador eliminado correctamente",
      playlist,
    });
  } catch (error) {
    console.error("Error en eliminarColaborador:", error);
    return sendServerError(res, error, "Error al eliminar colaborador");
  }
};

// 📌 Salir de una playlist colaborativa (como colaborador)
export const salirDePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(id);

    if (!playlist || playlist.estaEliminada) {
      return sendNotFound(res, "Playlist");
    }

    // Verificar que sea colaborador
    if (!playlist.colaboradores.includes(usuarioId)) {
      return sendError(res, "No eres colaborador de esta playlist", 400);
    }

    // Eliminar del array de colaboradores
    playlist.colaboradores.pull(usuarioId);
    await playlist.save();

    return sendSuccess(res, {
      message: "Has salido de la playlist colaborativa",
    });
  } catch (error) {
    console.error("Error en salirDePlaylist:", error);
    return sendServerError(res, error, "Error al salir de la playlist");
  }
};

// 📌 Obtener colaboradores de una playlist
export const obtenerColaboradores = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findById(id).populate(
      "colaboradores",
      "nick nombre nombreArtistico apellidos avatarUrl"
    );

    if (!playlist || playlist.estaEliminada) {
      return sendNotFound(res, "Playlist");
    }

    return sendSuccess(res, {
      colaboradores: playlist.colaboradores,
    });
  } catch (error) {
    console.error("Error en obtenerColaboradores:", error);
    return sendServerError(res, error, "Error al obtener colaboradores");
  }
};

// 📌 Buscar canciones para agregar a playlist (global + mis canciones)
export const buscarCancionesParaPlaylist = async (req, res) => {
  try {
    const { q } = req.query;
    const usuarioId = req.userId;

    if (!q || q.trim().length < 2) {
      return sendValidationError(res, [
        "La búsqueda debe tener al menos 2 caracteres",
      ]);
    }

    const regex = new RegExp(q.trim(), "i");

    // Buscar canciones públicas de todos + mis canciones privadas
    const canciones = await Cancion.find({
      titulo: regex,
      estaEliminada: false,
      $or: [
        { esPrivada: false }, // Canciones públicas de todos
        { artistas: usuarioId }, // Mis canciones (públicas o privadas)
      ],
    })
      .populate(
        "artistas",
        "nick nombre nombreArtistico apellidos avatarUrl verificado"
      )
      .populate("album", "titulo portadaUrl")
      .select(
        "titulo audioUrl portadaUrl duracionSegundos generos reproducciones meGusta fechaSubida esPrivada"
      )
      .sort({ createdAt: -1 })
      .limit(30);

    return sendSuccess(res, {
      canciones,
      total: canciones.length,
    });
  } catch (error) {
    console.error("Error en buscarCancionesParaPlaylist:", error);
    return sendServerError(res, error, "Error al buscar canciones");
  }
};

// 📌 Obtener playlists públicas
export const obtenerPlaylistsPublicas = async (req, res) => {
  try {
    const playlists = await Playlist.find({
      esPublica: true,
      estaEliminada: false,
    })
      .populate("creador", "nick nombre nombreArtistico avatarUrl verificado")
      .select("titulo descripcion portadaUrl canciones creador createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, { playlists });
  } catch (error) {
    console.error("Error en obtenerPlaylistsPublicas:", error);
    return sendServerError(res, error, "Error al obtener playlists públicas");
  }
};

/**
 * 📌 TOGGLE SEGUIR PLAYLIST
 * Seguir/dejar de seguir una playlist y añadir/quitar de biblioteca
 */
export const toggleSeguirPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate(
      "creador",
      "_id"
    );

    if (!playlist || playlist.estaEliminada) {
      return sendNotFound(res, "Playlist");
    }

    const usuarioId = String(req.userId);
    const yaSigue = playlist.seguidores.some((id) => String(id) === usuarioId);

    // Verificar si el usuario es el creador de la playlist
    const esPropia = isPlaylistCreator(playlist, usuarioId);

    if (yaSigue) {
      // Dejar de seguir la playlist
      playlist.seguidores = playlist.seguidores.filter(
        (id) => String(id) !== usuarioId
      );

      // Quitar de biblioteca (solo si no es propia)
      if (!esPropia) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $pull: { "biblioteca.playlistsGuardadas": req.params.id },
        });
      }
    } else {
      // Seguir la playlist
      playlist.seguidores.push(req.userId);

      // Agregar a biblioteca SOLO si NO es tu propia playlist
      if (!esPropia) {
        await Usuario.findByIdAndUpdate(req.userId, {
          $addToSet: { "biblioteca.playlistsGuardadas": req.params.id },
        });
      }
    }

    await playlist.save();

    return sendSuccess(res, {
      following: !yaSigue,
      totalSeguidores: playlist.seguidores.length,
    });
  } catch (error) {
    console.error("Error en toggleSeguirPlaylist:", error);
    return sendServerError(
      res,
      error,
      "Error al procesar el seguimiento de la playlist"
    );
  }
};

// 📌 Buscar playlists por nombre
export const buscarPlaylists = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return sendError(res, "Debes proporcionar un término de búsqueda", 400);
    }

    const playlists = await Playlist.find({
      titulo: { $regex: q, $options: "i" },
      estaEliminada: false,
    })
      .populate("creador", "nick nombre nombreArtistico avatarUrl verificado")
      .select(
        "titulo descripcion portadaUrl canciones creador createdAt esPublica"
      )
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, { playlists });
  } catch (error) {
    console.error("Error en buscarPlaylists:", error);
    return sendServerError(res, error, "Error al buscar playlists");
  }
};
