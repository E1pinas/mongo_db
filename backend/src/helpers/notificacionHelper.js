// src/helpers/notificacionHelper.js
import { Notificacion } from "../models/notificacionModels.js";
import { Seguidor } from "../models/seguidorModels.js";
import { Amistad } from "../models/amistadModels.js";
import { Usuario } from "../models/usuarioModels.js";

/**
 * Notificar a todos los seguidores Y amigos cuando se crea nuevo contenido
 */
export const notificarSeguidoresYAmigos = async (
  usuarioId,
  tipo,
  mensaje,
  recurso
) => {
  try {
    console.log("🔔 [NOTIFICAR SEGUIDORES Y AMIGOS] Iniciando...");
    console.log("🔔 Usuario:", usuarioId);
    console.log("🔔 Tipo:", tipo);
    console.log("🔔 Mensaje:", mensaje);

    // Obtener todos los seguidores del usuario
    const seguidores = await Seguidor.find({ seguido: usuarioId }).select(
      "seguidor"
    );
    console.log(`👥 Seguidores encontrados: ${seguidores.length}`);

    // Obtener todos los amigos del usuario (ambas direcciones)
    const amistades = await Amistad.find({
      $or: [
        { solicitante: usuarioId, estado: "aceptada" },
        { receptor: usuarioId, estado: "aceptada" },
      ],
    }).select("solicitante receptor");
    console.log(`👥 Amistades encontradas: ${amistades.length}`);

    // Extraer IDs de amigos
    const idsAmigos = amistades.map((amistad) =>
      amistad.solicitante.toString() === usuarioId.toString()
        ? amistad.receptor.toString()
        : amistad.solicitante.toString()
    );

    // Extraer IDs de seguidores
    const idsSeguidores = seguidores.map((seg) => seg.seguidor.toString());

    // Combinar y eliminar duplicados (un amigo puede también ser seguidor)
    const destinatariosSet = new Set([...idsSeguidores, ...idsAmigos]);
    const destinatarios = Array.from(destinatariosSet);

    console.log(
      `📬 Total destinatarios (sin duplicados): ${destinatarios.length}`
    );

    if (destinatarios.length === 0) {
      console.log("ℹ️ No hay seguidores ni amigos para notificar");
      return;
    }

    // Crear notificaciones en bulk
    const notificaciones = destinatarios.map((destinatarioId) => ({
      usuarioDestino: destinatarioId,
      usuarioOrigen: usuarioId,
      tipo,
      mensaje,
      recurso,
    }));

    await Notificacion.insertMany(notificaciones);

    console.log(
      `✅ ${notificaciones.length} notificaciones enviadas (${
        idsSeguidores.length
      } seguidores + ${idsAmigos.length} amigos, ${
        notificaciones.length - idsSeguidores.length - idsAmigos.length
      } duplicados eliminados)`
    );
  } catch (error) {
    console.error("❌ Error al notificar seguidores y amigos:", error);
    console.error("❌ Stack:", error.stack);
    // No lanzar error para no interrumpir la creación del contenido
  }
};

/**
 * Notificar nueva canción a seguidores y amigos
 */
export const notificarNuevaCancion = async (cancion, usuarioId) => {
  console.log("🔔 [INICIO] notificarNuevaCancion llamada");
  console.log("🔔 cancion._id:", cancion._id);
  console.log("🔔 usuarioId:", usuarioId);

  // Esperar 10 segundos antes de generar la notificación
  setTimeout(async () => {
    console.log("⏰ [TIMEOUT] Ejecutando notificación después de 10 segundos");
    try {
      // Importar Cancion aquí para evitar dependencia circular
      const { Cancion } = await import("../models/cancionModels.js");
      console.log("✅ Modelo Cancion importado");

      // Recargar la canción desde la base de datos para obtener datos frescos
      const cancionActualizada = await Cancion.findById(cancion._id).select(
        "titulo"
      );
      console.log("🔍 Canción recargada desde DB:", cancionActualizada);

      if (!cancionActualizada) {
        console.log("⚠️ Canción no encontrada, cancelando notificación");
        return;
      }

      const usuario = await Usuario.findById(usuarioId).select(
        "nick estadisticas.totalCancionesSubidas"
      );
      console.log("👤 Usuario encontrado:", usuario.nick);
      console.log(
        "📊 Total canciones del usuario:",
        usuario.estadisticas?.totalCancionesSubidas
      );

      const totalCanciones = usuario.estadisticas?.totalCancionesSubidas || 1;
      const mensaje =
        totalCanciones === 1
          ? `${usuario.nick} ha subido su primera canción: "${cancionActualizada.titulo}"`
          : `${usuario.nick} ha subido una nueva canción: "${cancionActualizada.titulo}"`;

      console.log("📢 MENSAJE GENERADO:", mensaje);

      await notificarSeguidoresYAmigos(
        usuarioId,
        "nueva_cancion_artista",
        mensaje,
        {
          tipo: "song",
          id: cancion._id,
        }
      );
      console.log("✅ [FIN] Notificación de canción completada");
    } catch (error) {
      console.error("❌ Error en notificarNuevaCancion:", error);
      console.error("❌ Stack:", error.stack);
    }
  }, 10000); // 10 segundos
};

/**
 * Notificar nuevo álbum a seguidores y amigos
 */
export const notificarNuevoAlbum = async (album, usuarioId) => {
  // Esperar 10 segundos antes de generar la notificación
  setTimeout(async () => {
    try {
      // Importar Album aquí para evitar dependencia circular
      const { Album } = await import("../models/albumModels.js");

      // Recargar el álbum desde la base de datos para obtener datos frescos
      const albumActualizado = await Album.findById(album._id).select(
        "titulo canciones"
      );

      if (!albumActualizado) {
        console.log("⚠️ Álbum no encontrado, cancelando notificación");
        return;
      }

      const usuario = await Usuario.findById(usuarioId).select(
        "nick estadisticas.totalAlbumesSubidos"
      );

      const totalAlbumes = usuario.estadisticas?.totalAlbumesSubidos || 1;
      const numCanciones = albumActualizado.canciones?.length || 0;

      let mensaje;
      if (totalAlbumes === 1) {
        mensaje = `${usuario.nick} ha lanzado su primer álbum: "${albumActualizado.titulo}" con ${numCanciones} canciones`;
      } else {
        mensaje = `${usuario.nick} ha lanzado un nuevo álbum: "${albumActualizado.titulo}"`;
      }

      console.log("📢 Notificación de álbum enviada:", mensaje);

      await notificarSeguidoresYAmigos(
        usuarioId,
        "nuevo_album_artista",
        mensaje,
        {
          tipo: "album",
          id: album._id,
        }
      );
    } catch (error) {
      console.error("❌ Error en notificarNuevoAlbum:", error);
    }
  }, 10000); // 10 segundos
};

/**
 * Notificar nueva playlist a seguidores y amigos
 */
export const notificarNuevaPlaylist = async (playlist, usuarioId) => {
  // Esperar 10 segundos antes de generar la notificación
  setTimeout(async () => {
    try {
      // Importar Playlist aquí para evitar dependencia circular
      const { Playlist } = await import("../models/playlistModels.js");

      // Recargar la playlist desde la base de datos para obtener datos frescos
      const playlistActualizada = await Playlist.findById(playlist._id).select(
        "titulo canciones"
      );

      if (!playlistActualizada) {
        console.log("⚠️ Playlist no encontrada, cancelando notificación");
        return;
      }

      const usuario = await Usuario.findById(usuarioId).select(
        "nick playlistsCreadas"
      );

      const totalPlaylists = usuario.playlistsCreadas?.length || 1;
      const numCanciones = playlistActualizada.canciones?.length || 0;

      let mensaje;
      if (totalPlaylists === 1) {
        mensaje = `${usuario.nick} ha creado su primera playlist: "${playlistActualizada.titulo}" con ${numCanciones} canciones`;
      } else {
        mensaje = `${usuario.nick} ha creado una nueva playlist: "${playlistActualizada.titulo}"`;
      }

      console.log("📢 Notificación de playlist enviada:", mensaje);

      await notificarSeguidoresYAmigos(
        usuarioId,
        "nueva_playlist_artista",
        mensaje,
        {
          tipo: "playlist",
          id: playlist._id,
        }
      );
    } catch (error) {
      console.error("❌ Error en notificarNuevaPlaylist:", error);
    }
  }, 10000); // 10 segundos
};

/**
 * Notificar nuevo post a seguidores y amigos
 */
export const notificarNuevoPost = async (post, usuarioId) => {
  try {
    const usuario = await Usuario.findById(usuarioId).select("nick");

    let mensajeTipo = "";
    if (post.tipo === "texto") {
      mensajeTipo = "ha publicado un nuevo post 📝";
    } else if (post.tipo === "repost_cancion") {
      mensajeTipo = "ha compartido una canción 🎵";
    } else if (post.tipo === "repost_album") {
      mensajeTipo = "ha compartido un álbum 💿";
    } else if (post.tipo === "repost_playlist") {
      mensajeTipo = "ha compartido una playlist 🎧";
    }

    await notificarSeguidoresYAmigos(
      usuarioId,
      "nuevo_post",
      `${usuario.nick} ${mensajeTipo}`,
      {
        tipo: "post",
        id: post._id,
      }
    );
  } catch (error) {
    console.error("Error en notificarNuevoPost:", error);
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
