/**
 * Helpers para lógica de música (canciones, álbumes, playlists)
 */

/**
 * Verifica si un usuario dio like a un recurso musical
 * @param {Object} resource - Recurso (canción, álbum o playlist)
 * @param {string} usuarioId - ID del usuario
 * @returns {boolean} True si dio like
 */
export const hasUserLiked = (resource, usuarioId) => {
  if (!resource || !resource.likes || !usuarioId) return false;
  return resource.likes.some((like) => like.toString() === usuarioId);
};

/**
 * Toggle like en un recurso musical
 * @param {Object} resource - Recurso con array de likes
 * @param {string} usuarioId - ID del usuario
 * @returns {Object} { liked: boolean, totalLikes: number }
 */
export const toggleLikeOnResource = (resource, usuarioId) => {
  const yaLeDioLike = hasUserLiked(resource, usuarioId);

  if (yaLeDioLike) {
    resource.likes.pull(usuarioId);
  } else {
    resource.likes.push(usuarioId);
  }

  return {
    liked: !yaLeDioLike,
    totalLikes: resource.likes.length,
  };
};

/**
 * Verifica si un usuario es artista de una canción o álbum
 * @param {Object} resource - Recurso con array de artistas
 * @param {string} usuarioId - ID del usuario
 * @returns {boolean} True si es artista
 */
export const isArtist = (resource, usuarioId) => {
  if (!resource || !resource.artistas || !usuarioId) return false;
  return resource.artistas.some(
    (artista) =>
      artista.toString() === usuarioId || artista._id?.toString() === usuarioId
  );
};

/**
 * Verifica si un usuario es creador de una playlist
 * @param {Object} playlist - Playlist
 * @param {string} usuarioId - ID del usuario
 * @returns {boolean} True si es creador
 */
export const isPlaylistCreator = (playlist, usuarioId) => {
  if (!playlist || !playlist.creador || !usuarioId) return false;
  return (
    playlist.creador.toString() === usuarioId ||
    playlist.creador._id?.toString() === usuarioId
  );
};

/**
 * Verifica si un usuario tiene acceso a un recurso privado
 * @param {Object} resource - Recurso (canción, álbum, playlist)
 * @param {string} usuarioId - ID del usuario
 * @param {string} type - Tipo de recurso: 'cancion', 'album', 'playlist'
 * @returns {boolean} True si tiene acceso
 */
export const hasAccessToPrivateResource = (resource, usuarioId, type) => {
  if (!resource.esPrivada) return true; // Es pública
  if (!usuarioId) return false; // No autenticado y es privada

  switch (type) {
    case "cancion":
    case "album":
      return isArtist(resource, usuarioId);
    case "playlist":
      return isPlaylistCreator(resource, usuarioId);
    default:
      return false;
  }
};

/**
 * Formatea información de artistas para respuestas
 * @param {Array} artistas - Array de artistas (pueden ser IDs o documentos poblados)
 * @returns {Array} Array de objetos con información básica de artistas
 */
export const formatArtistasInfo = (artistas) => {
  if (!artistas || !Array.isArray(artistas)) return [];

  return artistas.map((artista) => {
    if (typeof artista === "string") {
      return { _id: artista };
    }
    return {
      _id: artista._id,
      nick: artista.nick,
      nombreArtistico: artista.nombreArtistico || artista.nombre,
      avatarUrl: artista.avatarUrl,
    };
  });
};

/**
 * Calcula notificaciones de hitos (100, 500, 1000, 5000, 10000 likes/reproducciones)
 * @param {number} previousCount - Conteo anterior
 * @param {number} newCount - Nuevo conteo
 * @returns {number|null} Hito alcanzado o null
 */
export const getMilestone = (previousCount, newCount) => {
  const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];

  for (const milestone of milestones) {
    if (previousCount < milestone && newCount >= milestone) {
      return milestone;
    }
  }

  return null;
};

/**
 * Valida que una canción esté disponible (no eliminada, acceso permitido)
 * @param {Object} cancion - Documento de canción
 * @param {string} usuarioId - ID del usuario (opcional)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateSongAvailability = (cancion, usuarioId = null) => {
  if (!cancion) {
    return { valid: false, error: "Canción no encontrada" };
  }

  if (cancion.estaEliminada) {
    return { valid: false, error: "Esta canción ha sido eliminada" };
  }

  if (
    cancion.esPrivada &&
    !hasAccessToPrivateResource(cancion, usuarioId, "cancion")
  ) {
    return { valid: false, error: "No tienes acceso a esta canción privada" };
  }

  return { valid: true };
};

/**
 * Opciones de populate estándar para canciones
 * @returns {Array} Opciones de populate
 */
export const getSongPopulateOptions = () => [
  {
    path: "artistas",
    select: "nick nombreArtistico nombre avatarUrl verificado",
  },
  {
    path: "album",
    select: "titulo portadaUrl",
  },
];

/**
 * Opciones de populate estándar para álbumes
 * @returns {Array} Opciones de populate
 */
export const getAlbumPopulateOptions = () => [
  {
    path: "artistas",
    select: "nick nombreArtistico nombre avatarUrl verificado",
  },
  {
    path: "canciones",
    populate: {
      path: "artistas",
      select: "nick nombreArtistico nombre avatarUrl",
    },
  },
];

/**
 * Opciones de populate estándar para playlists
 * @returns {Array} Opciones de populate
 */
export const getPlaylistPopulateOptions = () => [
  {
    path: "creador",
    select: "nick nombreArtistico nombre avatarUrl verificado",
  },
  {
    path: "canciones",
    populate: {
      path: "artistas",
      select: "nick nombreArtistico nombre avatarUrl",
    },
  },
];
