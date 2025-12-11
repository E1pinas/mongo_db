import api from "./api";
import { Playlist } from "../types";

export const playlistService = {
  // Obtener playlists públicas ordenadas por número de seguidores
  getPublicPlaylists: async (): Promise<Playlist[]> => {
    try {
      const response = await api.get("/playlists/publicas");
      return response.data.playlists || [];
    } catch (error) {
      console.error("Error al obtener playlists públicas:", error);
      return [];
    }
  },

  // Obtener playlists de un usuario
  getUserPlaylists: async (usuarioId: string): Promise<Playlist[]> => {
    try {
      const response = await api.get(`/playlists/usuario/${usuarioId}`);
      return response.data.playlists || [];
    } catch (error) {
      console.error("Error al obtener playlists del usuario:", error);
      return [];
    }
  },

  // Obtener detalles de una playlist
  getPlaylistDetails: async (playlistId: string): Promise<Playlist | null> => {
    try {
      const response = await api.get(`/playlists/${playlistId}`);
      return response.data.playlist;
    } catch (error) {
      console.error("Error al obtener detalles de playlist:", error);
      return null;
    }
  },

  // Crear playlist
  createPlaylist: async (data: {
    nombre: string;
    descripcion?: string;
    esPublica: boolean;
  }) => {
    try {
      const response = await api.post("/playlists", data);
      return response.data;
    } catch (error) {
      console.error("Error al crear playlist:", error);
      throw error;
    }
  },

  // Seguir/dejar de seguir playlist
  toggleFollowPlaylist: async (playlistId: string) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/seguir`);
      return response.data;
    } catch (error) {
      console.error("Error al seguir/dejar de seguir playlist:", error);
      throw error;
    }
  },
};
