import { musicService } from "../../../services/music.service";
import { recentService } from "../../../services/recent.service";
import type { Playlist, Cancion, Usuario } from "../../../types";

export const servicioPlaylist = {
  // Obtener playlist por ID
  obtenerPlaylistPorId: async (playlistId: string): Promise<Playlist> => {
    return await musicService.getPlaylistById(playlistId);
  },

  // Agregar playlist a recientes
  agregarARecientes: async (playlist: Playlist): Promise<void> => {
    const creadorNombre =
      typeof playlist.creador === "object"
        ? (playlist.creador as Usuario).nombreArtistico ||
          (playlist.creador as Usuario).nombre
        : "";

    recentService.addRecentItem({
      id: playlist._id,
      type: "playlist",
      titulo: playlist.titulo,
      subtitulo: creadorNombre,
      imagenUrl: playlist.portadaUrl || "/cover.jpg",
    });
  },

  // Toggle seguir playlist
  toggleSeguirPlaylist: async (
    playlistId: string
  ): Promise<{ following: boolean }> => {
    return await musicService.toggleSeguirPlaylist(playlistId);
  },

  // Quitar canción de playlist
  quitarCancionDePlaylist: async (
    playlistId: string,
    cancionId: string
  ): Promise<void> => {
    await musicService.removeSongFromPlaylist(playlistId, cancionId);
  },

  // Eliminar playlist
  eliminarPlaylist: async (playlistId: string): Promise<void> => {
    await musicService.deletePlaylist(playlistId);
  },

  // Actualizar privacidad de playlist
  actualizarPrivacidad: async (
    playlistId: string,
    esPublica: boolean
  ): Promise<Playlist> => {
    return await musicService.updatePlaylist(playlistId, { esPublica });
  },

  // Buscar canciones
  buscarCanciones: async (query: string): Promise<Cancion[]> => {
    return await musicService.searchSongs(query);
  },

  // Agregar canción a playlist
  agregarCancionAPlaylist: async (
    playlistId: string,
    cancionId: string
  ): Promise<void> => {
    await musicService.addSongToPlaylist(playlistId, cancionId);
  },

  // Agregar múltiples canciones a playlist
  agregarVariasCancionesAPlaylist: async (
    playlistId: string,
    cancionIds: string[]
  ): Promise<void> => {
    await Promise.all(
      cancionIds.map((cancionId) =>
        musicService.addSongToPlaylist(playlistId, cancionId)
      )
    );
  },
};
