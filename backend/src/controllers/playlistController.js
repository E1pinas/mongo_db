import { Playlist } from "../models/playlistModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Notificacion } from "../models/notificacionModels.js";
import { eliminarArchivoR2 } from "../services/r2Service.js";
import { notificarNuevaPlaylist } from "../helpers/notificacionHelper.js";

// 📌 Crear una playlist
export const crearPlaylist = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { titulo, descripcion, portadaUrl, esPublica, esColaborativa } =
      req.body;

    if (!titulo) {
      return res.status(400).json({
        ok: false,
        message: "El título de la playlist es obligatorio",
      });
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

    return res.status(201).json({
      ok: true,
      message: "Playlist creada correctamente",
      playlist: nuevaPlaylist,
    });
  } catch (error) {
    console.error("Error en crearPlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear playlist",
    });
  }
};

// 📌 Añadir canción a una playlist
export const agregarCancionPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancionId } = req.body;
    const usuarioId = req.userId;

    if (!cancionId) {
      return res.status(400).json({
        ok: false,
        message: "El ID de la canción es requerido",
      });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        ok: false,
        message: "La playlist no existe",
      });
    }

    const cancion = await Cancion.findById(cancionId);
    if (!cancion || cancion.estaEliminada) {
      return res.status(400).json({
        ok: false,
        message: "La canción no existe o está eliminada",
      });
    }

    // Solo dueño o admin pueden editar su playlist
    const esDuenio = playlist.creador.toString() === usuarioId;
    const esColaborador =
      playlist.esColaborativa &&
      playlist.colaboradores.some((id) => id.toString() === usuarioId);
    const esAdmin = req.userRole === "admin";

    if (!esDuenio && !esColaborador && !esAdmin) {
      return res.status(403).json({
        ok: false,
        message: "No puedes editar esta playlist",
      });
    }

    playlist.canciones.addToSet(cancionId);
    await playlist.save();

    return res.status(200).json({
      ok: true,
      message: "Canción agregada a la playlist",
      playlist,
    });
  } catch (error) {
    console.error("Error en agregarCancionPlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al agregar canción",
    });
  }
};

// 📌 Quitar canción de una playlist
export const quitarCancionPlaylist = async (req, res) => {
  try {
    const { id, cancionId } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    // Solo dueño o admin
    const esDuenio = playlist.creador.toString() === usuarioId;
    const esColaborador =
      playlist.esColaborativa &&
      playlist.colaboradores.some((id) => id.toString() === usuarioId);
    const esAdmin = req.userRole === "admin";

    if (!esDuenio && !esColaborador && !esAdmin) {
      return res.status(403).json({
        ok: false,
        message: "No puedes editar esta playlist",
      });
    }

    playlist.canciones.pull(cancionId);
    await playlist.save();

    return res.status(200).json({
      ok: true,
      message: "Canción eliminada de la playlist",
    });
  } catch (error) {
    console.error("Error en quitarCancionPlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al quitar canción",
    });
  }
};

// 📌 Obtener una playlist por ID (con populate)
export const obtenerPlaylistPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findById(id)
      .populate("creador", "nick nombre nombreArtistico avatarUrl verificado")
      .populate({
        path: "canciones",
        select: "titulo audioUrl duracionSegundos portadaUrl artistas likes",
        populate: {
          path: "artistas",
          select: "nick nombre nombreArtistico avatarUrl",
        },
      })
      .select("+seguidores"); // Incluir el campo seguidores

    if (!playlist) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      playlist,
    });
  } catch (error) {
    console.error("Error en obtenerPlaylistPorId:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener playlist",
    });
  }
};

// 📌 Eliminar Playlist (borrado lógico)
export const eliminarPlaylist = async (req, res) => {
  try {
    const { idPlaylist } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(idPlaylist);

    if (!playlist) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    const esDuenio = playlist.creador.toString() === usuarioId;
    const esAdmin = req.userRole === "admin";

    if (!esDuenio && !esAdmin) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para eliminar la playlist",
      });
    }

    playlist.estaEliminada = true;
    await playlist.save();

    // Quitarla del usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
      $pull: { misPlaylists: playlist._id },
    });

    return res.status(200).json({
      ok: true,
      message: "Playlist eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en eliminarPlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar playlist",
    });
  }
};

// 📌 Actualizar portada de playlist
// Flujo:
// 1) POST /subida/imagen/playlist -> { url }
// 2) PATCH /playlist/:idPlaylist/portada con { nuevaPortadaUrl }
export const actualizarPortadaPlaylist = async (req, res) => {
  try {
    const { idPlaylist } = req.params;
    const { nuevaPortadaUrl } = req.body;
    const usuarioId = req.userId;
    const userRole = req.userRole;

    if (!nuevaPortadaUrl) {
      return res.status(400).json({
        ok: false,
        message: "Falta nuevaPortadaUrl en el body",
      });
    }

    const playlist = await Playlist.findById(idPlaylist);

    if (!playlist || playlist.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada o eliminada",
      });
    }

    const esCreador = playlist.creador.toString() === usuarioId;
    const esAdmin = userRole === "admin";

    if (!esCreador && !esAdmin) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para modificar esta playlist",
      });
    }

    const oldUrl = playlist.portadaUrl;

    playlist.portadaUrl = nuevaPortadaUrl;
    await playlist.save();

    await eliminarArchivoR2(oldUrl);

    return res.status(200).json({
      ok: true,
      message: "Portada de la playlist actualizada correctamente",
      playlist,
    });
  } catch (error) {
    console.error("Error en actualizarPortadaPlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar portada de playlist",
    });
  }
};

// 📌 Activar/desactivar modo colaborativo
export const toggleModoColaborativo = async (req, res) => {
  try {
    const { idPlaylist } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(idPlaylist);

    if (!playlist || playlist.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    // Solo el creador puede cambiar el modo colaborativo
    if (playlist.creador.toString() !== usuarioId) {
      return res.status(403).json({
        ok: false,
        message: "Solo el creador puede cambiar el modo colaborativo",
      });
    }

    playlist.esColaborativa = !playlist.esColaborativa;

    // Si se desactiva, limpiar colaboradores
    if (!playlist.esColaborativa) {
      playlist.colaboradores = [];
    }

    await playlist.save();

    return res.status(200).json({
      ok: true,
      message: `Modo colaborativo ${
        playlist.esColaborativa ? "activado" : "desactivado"
      }`,
      playlist,
    });
  } catch (error) {
    console.error("Error en toggleModoColaborativo:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al cambiar modo colaborativo",
    });
  }
};

// 📌 Invitar colaborador a playlist
export const invitarColaborador = async (req, res) => {
  try {
    const { idPlaylist } = req.params;
    const { colaboradorId } = req.body;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(idPlaylist);

    if (!playlist || playlist.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    // Solo el creador puede invitar colaboradores
    if (playlist.creador.toString() !== usuarioId) {
      return res.status(403).json({
        ok: false,
        message: "Solo el creador puede invitar colaboradores",
      });
    }

    // Verificar que la playlist sea colaborativa
    if (!playlist.esColaborativa) {
      return res.status(400).json({
        ok: false,
        message: "La playlist no está en modo colaborativo",
      });
    }

    // Verificar que el usuario exista
    const colaborador = await Usuario.findById(colaboradorId);
    if (!colaborador) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar que no sea el mismo creador
    if (colaboradorId === usuarioId) {
      return res.status(400).json({
        ok: false,
        message: "No puedes invitarte a ti mismo",
      });
    }

    // Verificar que no esté ya invitado
    if (playlist.colaboradores.includes(colaboradorId)) {
      return res.status(400).json({
        ok: false,
        message: "Este usuario ya es colaborador",
      });
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

    return res.status(200).json({
      ok: true,
      message: "Colaborador invitado correctamente",
      playlist,
    });
  } catch (error) {
    console.error("Error en invitarColaborador:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al invitar colaborador",
    });
  }
};

// 📌 Eliminar colaborador de playlist
export const eliminarColaborador = async (req, res) => {
  try {
    const { idPlaylist, colaboradorId } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(idPlaylist);

    if (!playlist || playlist.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    // Solo el creador puede eliminar colaboradores
    if (playlist.creador.toString() !== usuarioId) {
      return res.status(403).json({
        ok: false,
        message: "Solo el creador puede eliminar colaboradores",
      });
    }

    // Eliminar colaborador
    playlist.colaboradores.pull(colaboradorId);
    await playlist.save();

    return res.status(200).json({
      ok: true,
      message: "Colaborador eliminado correctamente",
      playlist,
    });
  } catch (error) {
    console.error("Error en eliminarColaborador:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar colaborador",
    });
  }
};

// 📌 Salir de playlist colaborativa (el colaborador se retira)
export const salirDePlaylist = async (req, res) => {
  try {
    const { idPlaylist } = req.params;
    const usuarioId = req.userId;

    const playlist = await Playlist.findById(idPlaylist);

    if (!playlist || playlist.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    // Verificar que sea colaborador
    if (!playlist.colaboradores.includes(usuarioId)) {
      return res.status(400).json({
        ok: false,
        message: "No eres colaborador de esta playlist",
      });
    }

    // Eliminar del array de colaboradores
    playlist.colaboradores.pull(usuarioId);
    await playlist.save();

    return res.status(200).json({
      ok: true,
      message: "Has salido de la playlist colaborativa",
    });
  } catch (error) {
    console.error("Error en salirDePlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al salir de la playlist",
    });
  }
};

// 📌 Obtener colaboradores de una playlist
export const obtenerColaboradores = async (req, res) => {
  try {
    const { idPlaylist } = req.params;

    const playlist = await Playlist.findById(idPlaylist).populate(
      "colaboradores",
      "nick nombre nombreArtistico apellidos avatarUrl"
    );

    if (!playlist || playlist.estaEliminada) {
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      colaboradores: playlist.colaboradores,
    });
  } catch (error) {
    console.error("Error en obtenerColaboradores:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener colaboradores",
    });
  }
};

// 📌 Buscar canciones para agregar a playlist (global + mis canciones)
export const buscarCancionesParaPlaylist = async (req, res) => {
  try {
    const { q } = req.query;
    const usuarioId = req.userId;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        ok: false,
        message: "La búsqueda debe tener al menos 2 caracteres",
      });
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

    return res.status(200).json({
      ok: true,
      canciones,
      total: canciones.length,
    });
  } catch (error) {
    console.error("Error en buscarCancionesParaPlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al buscar canciones",
    });
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

    return res.status(200).json({
      ok: true,
      playlists,
      total: playlists.length,
    });
  } catch (error) {
    console.error("Error en obtenerPlaylistsPublicas:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener playlists públicas",
    });
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
      return res.status(404).json({
        ok: false,
        message: "Playlist no encontrada",
      });
    }

    const usuarioId = String(req.userId);
    const yaSigue = playlist.seguidores.some((id) => String(id) === usuarioId);

    // Verificar si el usuario es el creador de la playlist
    const esPropia = String(playlist.creador._id) === usuarioId;

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

    return res.status(200).json({
      ok: true,
      following: !yaSigue,
      totalSeguidores: playlist.seguidores.length,
    });
  } catch (error) {
    console.error("Error en toggleSeguirPlaylist:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al procesar el seguimiento de la playlist",
    });
  }
};
