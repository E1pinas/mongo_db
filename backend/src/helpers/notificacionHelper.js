// src/helpers/notificacionHelper.js
import { Notificacion } from "../models/notificacionModels.js";
import { Seguidor } from "../models/seguidorModels.js";
import { Usuario } from "../models/usuarioModels.js";

/**
 * Notificar a todos los seguidores cuando se crea nuevo contenido
 */
export const notificarSeguidores = async (
  usuarioId,
  tipo,
  mensaje,
  recurso
) => {
  try {
    // Obtener todos los seguidores del usuario
    const seguidores = await Seguidor.find({ seguido: usuarioId }).select(
      "seguidor"
    );

    if (seguidores.length === 0) {
      return; // No hay seguidores, no crear notificaciones
    }

    // Crear notificaciones en bulk
    const notificaciones = seguidores.map((seg) => ({
      usuarioDestino: seg.seguidor,
      usuarioOrigen: usuarioId,
      tipo,
      mensaje,
      recurso,
    }));

    await Notificacion.insertMany(notificaciones);

    console.log(
      `✅ ${notificaciones.length} notificaciones enviadas a seguidores`
    );
  } catch (error) {
    console.error("Error al notificar seguidores:", error);
    // No lanzar error para no interrumpir la creación del contenido
  }
};

/**
 * Notificar nueva canción a seguidores
 */
export const notificarNuevaCancion = async (cancion, usuarioId) => {
  try {
    const usuario = await Usuario.findById(usuarioId).select("nick");

    await notificarSeguidores(
      usuarioId,
      "nueva_cancion_artista",
      `${usuario.nick} ha subido una nueva canción: "${cancion.titulo}"`,
      {
        tipo: "song",
        id: cancion._id,
      }
    );
  } catch (error) {
    console.error("Error en notificarNuevaCancion:", error);
  }
};

/**
 * Notificar nuevo álbum a seguidores
 */
export const notificarNuevoAlbum = async (album, usuarioId) => {
  try {
    const usuario = await Usuario.findById(usuarioId).select("nick");

    await notificarSeguidores(
      usuarioId,
      "nuevo_album_artista",
      `${usuario.nick} ha lanzado un nuevo álbum: "${album.titulo}"`,
      {
        tipo: "album",
        id: album._id,
      }
    );
  } catch (error) {
    console.error("Error en notificarNuevoAlbum:", error);
  }
};

/**
 * Notificar nueva playlist a seguidores
 */
export const notificarNuevaPlaylist = async (playlist, usuarioId) => {
  try {
    const usuario = await Usuario.findById(usuarioId).select("nick");

    await notificarSeguidores(
      usuarioId,
      "nueva_playlist_artista",
      `${usuario.nick} ha creado una nueva playlist: "${playlist.titulo}"`,
      {
        tipo: "playlist",
        id: playlist._id,
      }
    );
  } catch (error) {
    console.error("Error en notificarNuevaPlaylist:", error);
  }
};

/**
 * Crear una notificación individual
 */
export const crearNotificacion = async (
  usuarioDestino,
  usuarioOrigen,
  tipo,
  mensaje,
  recurso = null
) => {
  try {
    const notificacion = await Notificacion.create({
      usuarioDestino,
      usuarioOrigen,
      tipo,
      mensaje,
      recurso,
    });

    return notificacion;
  } catch (error) {
    console.error("Error al crear notificación:", error);
    // No lanzar error para no interrumpir la acción principal
  }
};
