import { Usuario } from "../models/usuarioModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Playlist } from "../models/playlistModels.js";
import { Album } from "../models/albumModels.js";

// ---------------------------------------------------------
// CANCIONES
// ---------------------------------------------------------
export const obtenerCancionesGuardadas = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const usuario = await Usuario.findById(usuarioId).populate({
      path: "biblioteca.cancionesGuardadas",
      populate: [
        { path: "artistas", select: "nombre nombreArtistico nick avatarUrl" },
        { path: "album", select: "titulo portadaUrl" },
      ],
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      canciones: usuario.biblioteca.cancionesGuardadas || [],
    });
  } catch (error) {
    console.error("Error en obtenerCancionesGuardadas:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener las canciones guardadas",
    });
  }
};

export const agregarCancionBiblioteca = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { cancionId } = req.params;

    const cancion = await Cancion.findOne({
      _id: cancionId,
      estaEliminada: false,
    });

    if (!cancion) {
      return res.status(404).json({
        ok: false,
        message: "La canción no existe o está eliminada",
      });
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      {
        $addToSet: { "biblioteca.cancionesGuardadas": cancionId },
      },
      { new: true }
    ).populate("biblioteca.cancionesGuardadas", "titulo audioUrl portadaUrl");

    return res.status(200).json({
      ok: true,
      message: "Canción agregada a tu biblioteca",
      biblioteca: usuarioActualizado.biblioteca,
    });
  } catch (error) {
    console.error("Error en agregarCancionBiblioteca:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al agregar la canción a la biblioteca",
    });
  }
};

export const quitarCancionBiblioteca = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { cancionId } = req.params;

    await Usuario.findByIdAndUpdate(usuarioId, {
      $pull: { "biblioteca.cancionesGuardadas": cancionId },
    });

    return res.status(200).json({
      ok: true,
      message: "Canción eliminada de tu biblioteca",
    });
  } catch (error) {
    console.error("Error en quitarCancionBiblioteca:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al quitar la canción de la biblioteca",
    });
  }
};

// ---------------------------------------------------------
// PLAYLISTS
// ---------------------------------------------------------
export const obtenerPlaylistsGuardadas = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const usuario = await Usuario.findById(usuarioId).populate({
      path: "biblioteca.playlistsGuardadas",
      populate: {
        path: "creador",
        select: "nombre nombreArtistico nick avatarUrl",
      },
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      playlists: usuario.biblioteca.playlistsGuardadas || [],
    });
  } catch (error) {
    console.error("Error en obtenerPlaylistsGuardadas:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener las playlists guardadas",
    });
  }
};

export const togglePlaylistGuardada = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({
        ok: false,
        message: "La playlist no existe",
      });
    }

    // Verificar si el usuario es el creador de la playlist
    const esPropia = String(playlist.creador) === String(usuarioId);

    // Si es propia, no permitir guardarla en biblioteca
    if (esPropia) {
      return res.status(400).json({
        ok: false,
        message: "No puedes guardar tu propia playlist en la biblioteca",
      });
    }

    const usuario = await Usuario.findById(usuarioId);
    const yaGuardada = usuario.biblioteca.playlistsGuardadas.some(
      (id) => String(id) === String(playlistId)
    );

    if (yaGuardada) {
      await Usuario.findByIdAndUpdate(usuarioId, {
        $pull: { "biblioteca.playlistsGuardadas": playlistId },
      });

      return res.status(200).json({
        ok: true,
        saved: false,
        message: "Playlist eliminada de tu biblioteca",
      });
    } else {
      await Usuario.findByIdAndUpdate(usuarioId, {
        $addToSet: { "biblioteca.playlistsGuardadas": playlistId },
      });

      return res.status(200).json({
        ok: true,
        saved: true,
        message: "Playlist agregada a tu biblioteca",
      });
    }
  } catch (error) {
    console.error("Error en togglePlaylistGuardada:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al procesar la playlist",
    });
  }
};

// ---------------------------------------------------------
// ÁLBUMES
// ---------------------------------------------------------
export const obtenerAlbumesGuardados = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const usuario = await Usuario.findById(usuarioId).populate({
      path: "biblioteca.albumesGuardados",
      populate: {
        path: "artistas",
        select: "nombre nombreArtistico nick avatarUrl",
      },
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      albumes: usuario.biblioteca.albumesGuardados || [],
    });
  } catch (error) {
    console.error("Error en obtenerAlbumesGuardados:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener los álbumes guardados",
    });
  }
};

export const toggleAlbumGuardado = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { albumId } = req.params;

    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({
        ok: false,
        message: "El álbum no existe",
      });
    }

    // Verificar si el usuario es artista del álbum
    const esPropio = album.artistas.some(
      (artistaId) => String(artistaId) === String(usuarioId)
    );

    // Si es propio, no permitir guardarlo en biblioteca
    if (esPropio) {
      return res.status(400).json({
        ok: false,
        message: "No puedes guardar tu propio álbum en la biblioteca",
      });
    }

    const usuario = await Usuario.findById(usuarioId);
    const yaGuardado = usuario.biblioteca.albumesGuardados.some(
      (id) => String(id) === String(albumId)
    );

    if (yaGuardado) {
      await Usuario.findByIdAndUpdate(usuarioId, {
        $pull: { "biblioteca.albumesGuardados": albumId },
      });

      return res.status(200).json({
        ok: true,
        saved: false,
        message: "Álbum eliminado de tu biblioteca",
      });
    } else {
      await Usuario.findByIdAndUpdate(usuarioId, {
        $addToSet: { "biblioteca.albumesGuardados": albumId },
      });

      return res.status(200).json({
        ok: true,
        saved: true,
        message: "Álbum agregado a tu biblioteca",
      });
    }
  } catch (error) {
    console.error("Error en toggleAlbumGuardado:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al procesar el álbum",
    });
  }
};

// ---------------------------------------------------------
// ARTISTAS
// ---------------------------------------------------------
export const obtenerArtistasGuardados = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const usuario = await Usuario.findById(usuarioId).populate(
      "biblioteca.artistasGuardados",
      "nombre nombreArtistico nick avatarUrl"
    );

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      artistas: usuario.biblioteca.artistasGuardados || [],
    });
  } catch (error) {
    console.error("Error en obtenerArtistasGuardados:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener los artistas guardados",
    });
  }
};

export const toggleArtistaGuardado = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { artistaId } = req.params;

    const artista = await Usuario.findById(artistaId);

    if (!artista) {
      return res.status(404).json({
        ok: false,
        message: "El artista no existe",
      });
    }

    const usuario = await Usuario.findById(usuarioId);
    const yaGuardado = usuario.biblioteca.artistasGuardados.some(
      (id) => String(id) === String(artistaId)
    );

    if (yaGuardado) {
      await Usuario.findByIdAndUpdate(usuarioId, {
        $pull: { "biblioteca.artistasGuardados": artistaId },
      });

      return res.status(200).json({
        ok: true,
        saved: false,
        message: "Artista eliminado de tu biblioteca",
      });
    } else {
      await Usuario.findByIdAndUpdate(usuarioId, {
        $addToSet: { "biblioteca.artistasGuardados": artistaId },
      });

      return res.status(200).json({
        ok: true,
        saved: true,
        message: "Artista agregado a tu biblioteca",
      });
    }
  } catch (error) {
    console.error("Error en toggleArtistaGuardado:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al procesar el artista",
    });
  }
};
