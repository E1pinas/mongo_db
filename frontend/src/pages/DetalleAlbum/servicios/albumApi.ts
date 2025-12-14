import { albumService } from "../../../services/album.service";
import { musicService } from "../../../services/music.service";
import { recentService } from "../../../services/recent.service";
import type { Album, Cancion, Usuario } from "../../../types";

export const servicioAlbum = {
  // Obtener álbum por ID
  obtenerAlbumPorId: async (albumId: string): Promise<Album | null> => {
    return await albumService.getAlbumById(albumId);
  },

  // Agregar álbum a recientes
  agregarARecientes: async (album: Album): Promise<void> => {
    if (album.artistas && album.artistas.length > 0) {
      const artistaNombre =
        typeof album.artistas[0] === "object"
          ? (album.artistas[0] as Usuario).nombreArtistico ||
            (album.artistas[0] as Usuario).nombre
          : "";

      recentService.addRecentItem({
        id: album._id,
        type: "album",
        titulo: album.titulo,
        subtitulo: artistaNombre,
        imagenUrl: album.portadaUrl,
      });
    }
  },

  // Toggle like del álbum
  toggleLikeAlbum: async (albumId: string): Promise<{ liked: boolean }> => {
    return await musicService.toggleLikeAlbum(albumId);
  },

  // Quitar canción del álbum
  quitarCancionDeAlbum: async (
    albumId: string,
    cancionId: string
  ): Promise<void> => {
    await musicService.removeSongFromAlbum(albumId, cancionId);
  },

  // Eliminar álbum
  eliminarAlbum: async (albumId: string): Promise<boolean> => {
    return await albumService.deleteAlbum(albumId);
  },

  // Actualizar privacidad del álbum
  actualizarPrivacidad: async (
    albumId: string,
    esPrivado: boolean
  ): Promise<Album | null> => {
    return await albumService.updateAlbum(albumId, { esPrivado });
  },

  // Buscar canciones propias
  buscarCancionesPropias: async (
    query: string,
    usuarioId: string,
    cancionesExistentes: Cancion[]
  ): Promise<Cancion[]> => {
    const resultados = await musicService.searchSongs(query);
    const idsExistentes = new Set(cancionesExistentes.map((c) => c._id));

    // Filtrar solo las canciones del usuario actual que no estén ya en el álbum
    return resultados.filter((cancion) => {
      const artistas = cancion.artistas as Usuario[];
      const esDelArtista = artistas.some(
        (artista) => artista._id === usuarioId
      );
      const noEstaEnAlbum = !idsExistentes.has(cancion._id);
      return esDelArtista && noEstaEnAlbum;
    });
  },

  // Agregar canción al álbum
  agregarCancionAlAlbum: async (
    albumId: string,
    cancionId: string
  ): Promise<void> => {
    await musicService.addSongToAlbum(albumId, cancionId);
  },

  // Agregar múltiples canciones al álbum
  agregarVariasCancionesAlAlbum: async (
    albumId: string,
    cancionIds: string[]
  ): Promise<void> => {
    await Promise.all(
      cancionIds.map((cancionId) =>
        musicService.addSongToAlbum(albumId, cancionId)
      )
    );
  },
};
