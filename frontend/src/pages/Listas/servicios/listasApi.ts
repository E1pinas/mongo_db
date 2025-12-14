import { musicService } from "../../../services/music.service";
import type { Playlist, Cancion } from "../../../types";
import type { DatosCreacionPlaylist } from "../tipos";

export const servicioListas = {
  /**
   * Obtener playlists del usuario
   */
  obtenerMisPlaylists: async (): Promise<Playlist[]> => {
    return await musicService.getMyPlaylists();
  },

  /**
   * Obtener playlists públicas
   */
  obtenerPlaylistsPublicas: async (): Promise<Playlist[]> => {
    return await musicService.getPublicPlaylists();
  },

  /**
   * Obtener playlist por ID
   */
  obtenerPlaylistPorId: async (id: string): Promise<Playlist> => {
    return await musicService.getPlaylistById(id);
  },

  /**
   * Buscar canciones
   */
  buscarCanciones: async (query: string): Promise<Cancion[]> => {
    return await musicService.searchSongs(query);
  },

  /**
   * Subir imagen de portada
   */
  subirImagen: async (archivo: File): Promise<{ imagenUrl: string }> => {
    const formData = new FormData();
    formData.append("imagen", archivo);

    const response = await fetch("http://localhost:3900/api/upload/imagen", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.message || "Error al subir la imagen");
    }

    return { imagenUrl: data.imagenUrl };
  },

  /**
   * Crear playlist
   */
  crearPlaylist: async (datos: DatosCreacionPlaylist): Promise<Playlist> => {
    return await musicService.createPlaylist(datos);
  },

  /**
   * Agregar canción a playlist
   */
  agregarCancionAPlaylist: async (
    playlistId: string,
    cancionId: string
  ): Promise<void> => {
    await musicService.addSongToPlaylist(playlistId, cancionId);
  },

  /**
   * Agregar varias canciones a playlist
   */
  agregarVariasCancionesAPlaylist: async (
    playlistId: string,
    cancionIds: string[]
  ): Promise<void> => {
    for (const cancionId of cancionIds) {
      await musicService.addSongToPlaylist(playlistId, cancionId);
    }
  },
};
