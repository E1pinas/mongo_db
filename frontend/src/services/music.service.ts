import api, { createFormData, handleApiError } from "./api";
import type { Cancion, Album, Playlist, ApiResponse } from "../types";

export interface UploadCancionCompleta {
  audio: File;
  portada?: File;
  titulo: string;
  duracionSegundos: number;
  generos?: string;
  esPrivada?: boolean;
  esExplicita?: boolean;
  album?: string;
}

export const musicService = {
  // ============================================
  // CANCIONES
  // ============================================

  // Buscar canciones públicas globalmente
  async searchSongs(query: string): Promise<Cancion[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        canciones: Cancion[];
        total: number;
      }>(`/canciones/buscar?q=${encodeURIComponent(query)}`);
      return response.data.canciones || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Buscar en mis canciones
  async searchMySongs(query: string): Promise<Cancion[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        canciones: Cancion[];
        total: number;
      }>(`/canciones/mis-canciones/buscar?q=${encodeURIComponent(query)}`);
      return response.data.canciones || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener mis canciones
  async getMySongs(): Promise<Cancion[]> {
    try {
      const response = await api.get<{ ok: boolean; canciones: Cancion[] }>(
        "/canciones/mis-canciones"
      );
      return response.data.canciones || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener canción por ID (requiere autenticación)
  async getSongById(id: string): Promise<Cancion> {
    try {
      const response = await api.get<{
        ok: boolean;
        cancion: Cancion;
        restricciones?: {
          puedeReproducir: boolean;
          motivoRestriccion?: string;
          esExplicita: boolean;
        };
      }>(`/canciones/${id}`);
      return response.data.cancion;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener canción compartida públicamente (sin autenticación)
  async getSongPublic(
    id: string
  ): Promise<{ cancion: Cancion; mensaje?: string }> {
    try {
      const response = await api.get<{
        ok: boolean;
        cancion: Cancion;
        mensaje?: string;
      }>(`/canciones/compartir/${id}`);
      return {
        cancion: response.data.cancion,
        mensaje: response.data.mensaje,
      };
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Verificar acceso a una canción antes de reproducir
  async verificarAcceso(id: string): Promise<{
    puedeReproducir: boolean;
    message?: string;
    esExplicita?: boolean;
    requiereLogin?: boolean;
    restriccionEdad?: boolean;
  }> {
    try {
      const response = await api.get<{
        ok: boolean;
        puedeReproducir: boolean;
        message?: string;
        esExplicita?: boolean;
        requiereLogin?: boolean;
        restriccionEdad?: boolean;
      }>(`/canciones/${id}/verificar-acceso`);
      return response.data;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Contar reproducción
  async contarReproduccion(id: string): Promise<void> {
    try {
      await api.post(`/canciones/${id}/reproducir`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Toggle like/unlike canción
  async toggleLike(
    id: string
  ): Promise<{ liked: boolean; totalLikes: number }> {
    try {
      const response = await api.post<{
        ok: boolean;
        liked: boolean;
        totalLikes: number;
      }>(`/canciones/${id}/like`);
      return {
        liked: response.data.liked,
        totalLikes: response.data.totalLikes,
      };
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Alias para mantener compatibilidad
  async toggleLikeCancion(
    id: string
  ): Promise<{ liked: boolean; totalLikes: number }> {
    return this.toggleLike(id);
  },

  // Toggle like álbum
  async toggleLikeAlbum(
    id: string
  ): Promise<{ liked: boolean; totalLikes: number }> {
    try {
      const response = await api.post<{
        ok: boolean;
        liked: boolean;
        totalLikes: number;
      }>(`/albumes/${id}/like`);
      return {
        liked: response.data.liked,
        totalLikes: response.data.totalLikes,
      };
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Toggle seguir playlist
  async toggleSeguirPlaylist(
    id: string
  ): Promise<{ following: boolean; totalSeguidores: number }> {
    try {
      const response = await api.post<{
        ok: boolean;
        following: boolean;
        totalSeguidores: number;
      }>(`/playlists/${id}/seguir`);
      return {
        following: response.data.following,
        totalSeguidores: response.data.totalSeguidores,
      };
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener canciones que me gustan (biblioteca)
  async getLikedSongs(): Promise<Cancion[]> {
    try {
      const response = await api.get<{ ok: boolean; canciones: Cancion[] }>(
        "/biblioteca/canciones"
      );
      return response.data.canciones || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error loading liked songs:", errorData);
      return [];
    }
  },

  // Obtener playlists guardadas
  async getLikedPlaylists(): Promise<Playlist[]> {
    try {
      const response = await api.get<{ ok: boolean; playlists: Playlist[] }>(
        "/biblioteca/playlists"
      );
      return response.data.playlists || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error loading liked playlists:", errorData);
      return [];
    }
  },

  // Toggle guardar playlist
  async toggleSavePlaylist(id: string): Promise<{ saved: boolean }> {
    try {
      const response = await api.post<{
        ok: boolean;
        saved: boolean;
        message: string;
      }>(`/biblioteca/playlists/${id}`);
      return { saved: response.data.saved };
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener álbumes guardados
  async getLikedAlbums(): Promise<Album[]> {
    try {
      const response = await api.get<{ ok: boolean; albumes: Album[] }>(
        "/biblioteca/albumes"
      );
      return response.data.albumes || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error loading liked albums:", errorData);
      return [];
    }
  },

  // Toggle guardar álbum
  async toggleSaveAlbum(id: string): Promise<{ saved: boolean }> {
    try {
      const response = await api.post<{
        ok: boolean;
        saved: boolean;
        message: string;
      }>(`/biblioteca/albumes/${id}`);
      return { saved: response.data.saved };
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener artistas guardados
  async getLikedArtists(): Promise<any[]> {
    try {
      const response = await api.get<{ ok: boolean; artistas: any[] }>(
        "/biblioteca/artistas"
      );
      return response.data.artistas || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error loading liked artists:", errorData);
      return [];
    }
  },

  // Toggle guardar artista
  async toggleSaveArtist(id: string): Promise<{ saved: boolean }> {
    try {
      const response = await api.post<{
        ok: boolean;
        saved: boolean;
        message: string;
      }>(`/biblioteca/artistas/${id}`);
      return { saved: response.data.saved };
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Subir audio solamente
  async subirAudio(archivo: File): Promise<{
    audioUrl: string;
    metadatos: {
      nombreOriginal: string;
      tamanioMB: string;
      formato: string;
    };
  }> {
    try {
      const formData = new FormData();
      formData.append("audio", archivo);

      const response = await api.post<{
        ok: boolean;
        audioUrl: string;
        metadatos: {
          nombreOriginal: string;
          tamanioMB: string;
          formato: string;
        };
      }>("/upload/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        audioUrl: response.data.audioUrl,
        metadatos: response.data.metadatos,
      };
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Subir imagen (portada)
  async subirImagen(archivo: File): Promise<{
    imagenUrl: string;
    metadatos: {
      nombreOriginal: string;
      tamanioKB: string;
      formato: string;
    };
  }> {
    try {
      const formData = new FormData();
      formData.append("imagen", archivo);

      const response = await api.post<{
        ok: boolean;
        imagenUrl: string;
        metadatos: {
          nombreOriginal: string;
          tamanioKB: string;
          formato: string;
        };
      }>("/upload/imagen", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        imagenUrl: response.data.imagenUrl,
        metadatos: response.data.metadatos,
      };
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Crear canción (después de subir audio y portada)
  async createSong(data: {
    titulo: string;
    audioUrl: string;
    duracionSegundos: number;
    portadaUrl?: string;
    album?: string;
    generos?: string[];
    esPrivada?: boolean;
    esExplicita?: boolean;
  }): Promise<Cancion> {
    try {
      const response = await api.post<{
        ok: boolean;
        message: string;
        cancion: Cancion;
      }>("/canciones", data);
      return response.data.cancion;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Subir canción completa (audio + portada + datos en una sola petición)
  async uploadCompleteSong(data: UploadCancionCompleta): Promise<Cancion> {
    try {
      const formData = new FormData();
      formData.append("audio", data.audio);

      if (data.portada) {
        formData.append("portada", data.portada);
      }

      formData.append("titulo", data.titulo);
      formData.append("duracionSegundos", data.duracionSegundos.toString());

      if (data.generos) {
        formData.append("generos", data.generos);
      }

      if (data.album) {
        formData.append("album", data.album);
      }

      formData.append("esPrivada", String(data.esPrivada || false));
      formData.append("esExplicita", String(data.esExplicita || false));

      const response = await api.post<{
        ok: boolean;
        message: string;
        cancion: Cancion;
      }>("/upload/cancion-completa", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.cancion;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Actualizar canción
  async updateSong(
    id: string,
    data: Partial<{
      titulo: string;
      generos: string[];
      esPrivada: boolean;
      esExplicita: boolean;
      portadaUrl: string;
      album: string;
    }>
  ): Promise<Cancion> {
    try {
      const response = await api.put<{
        ok: boolean;
        message: string;
        cancion: Cancion;
      }>(`/canciones/${id}`, data);
      return response.data.cancion;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar canción
  async deleteSong(id: string): Promise<void> {
    try {
      await api.delete(`/canciones/${id}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // ============================================
  // ÁLBUMES
  // ============================================

  // Buscar álbumes
  async searchAlbums(query: string): Promise<Album[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        albumes: Album[];
        total: number;
      }>(`/albumes/buscar?q=${encodeURIComponent(query)}`);
      return response.data.albumes || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error searching albums:", errorData);
      return [];
    }
  },

  // Obtener mis álbumes
  async getMyAlbums(): Promise<Album[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        usuario: {
          misAlbumes: Album[];
        };
      }>("/usuarios/perfil");
      return response.data.usuario?.misAlbumes || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error loading my albums:", errorData);
      return [];
    }
  },

  // Obtener álbumes públicos de todos los usuarios
  async getPublicAlbums(): Promise<Album[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        albumes: Album[];
      }>("/albumes/publicos");
      return response.data.albumes || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error loading public albums:", errorData);
      return [];
    }
  },

  // Obtener álbum por ID
  async getAlbumById(id: string): Promise<Album> {
    try {
      const response = await api.get<{ ok: boolean; album: Album }>(
        `/albumes/${id}`
      );
      return response.data.album;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Crear álbum
  async createAlbum(data: any): Promise<Album> {
    try {
      const formData = createFormData({
        titulo: data.titulo,
        descripcion: data.descripcion,
        genero: data.genero,
        fechaLanzamiento: data.fechaLanzamiento,
        esPrivado: data.esPrivado,
        canciones: data.canciones,
        portada: data.portada,
      });

      const response = await api.post<{ ok: boolean; album: Album }>(
        "/albumes",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.album;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Agregar canción a álbum
  async addSongToAlbum(albumId: string, songId: string): Promise<Album> {
    try {
      const response = await api.post<{ ok: boolean; album: Album }>(
        `/albumes/${albumId}/canciones/${songId}`,
        {}
      );
      return response.data.album;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar álbum
  async deleteAlbum(id: string): Promise<void> {
    try {
      await api.delete(`/albumes/${id}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar canción de álbum
  async removeSongFromAlbum(albumId: string, songId: string): Promise<Album> {
    try {
      const response = await api.delete<{
        ok: boolean;
        message: string;
        album: Album;
      }>(`/albumes/${albumId}/canciones/${songId}`);
      return response.data.album;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // ============================================
  // PLAYLISTS
  // ============================================

  // Obtener mis playlists
  async getMyPlaylists(): Promise<Playlist[]> {
    try {
      // Las playlists están en el perfil del usuario
      const response = await api.get<{
        ok: boolean;
        usuario: {
          playlistsCreadas: Playlist[];
          biblioteca: {
            playlistsGuardadas: Playlist[];
          };
        };
      }>("/usuarios/perfil");

      // Combinar playlists creadas y guardadas
      const playlistsCreadas = response.data.usuario?.playlistsCreadas || [];
      const playlistsGuardadas =
        response.data.usuario?.biblioteca?.playlistsGuardadas || [];

      // Retornar SOLO las playlists creadas, no las guardadas
      return playlistsCreadas;
    } catch (error) {
      const errorData = handleApiError(error);
      // Si falla, retornar array vacío en lugar de error
      console.error("Error loading playlists:", errorData);
      return [];
    }
  },

  // Obtener playlists públicas de todos los usuarios
  async getPublicPlaylists(): Promise<Playlist[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        playlists: Playlist[];
      }>("/playlists/publicas");
      return response.data.playlists || [];
    } catch (error) {
      const errorData = handleApiError(error);
      console.error("Error loading public playlists:", errorData);
      return [];
    }
  },

  // Obtener playlist por ID
  async getPlaylistById(id: string): Promise<Playlist> {
    try {
      const response = await api.get<{ ok: boolean; playlist: Playlist }>(
        `/playlists/${id}`
      );
      return response.data.playlist;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Crear playlist
  async createPlaylist(data: {
    titulo: string;
    descripcion?: string;
    esPublica?: boolean;
    esColaborativa?: boolean;
    portadaUrl?: string;
  }): Promise<Playlist> {
    try {
      const response = await api.post<{
        ok: boolean;
        message: string;
        playlist: Playlist;
      }>("/playlists", data);
      return response.data.playlist;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Agregar canción a playlist
  async addSongToPlaylist(
    playlistId: string,
    songId: string
  ): Promise<Playlist> {
    try {
      const response = await api.post<{
        ok: boolean;
        message: string;
        playlist: Playlist;
      }>(`/playlists/${playlistId}/canciones`, { cancionId: songId });
      return response.data.playlist;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar canción de playlist
  async removeSongFromPlaylist(
    playlistId: string,
    songId: string
  ): Promise<Playlist> {
    try {
      const response = await api.delete<{
        ok: boolean;
        message: string;
        playlist: Playlist;
      }>(`/playlists/${playlistId}/canciones/${songId}`);
      return response.data.playlist;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar playlist
  async deletePlaylist(id: string): Promise<boolean> {
    try {
      await api.delete(`/playlists/${id}`);
      return true;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  async updatePlaylist(
    id: string,
    data: {
      titulo?: string;
      descripcion?: string;
      esPublica?: boolean;
      esColaborativa?: boolean;
    }
  ): Promise<Playlist> {
    try {
      const response = await api.patch<{
        ok: boolean;
        playlist: Playlist;
        message: string;
      }>(`/playlists/${id}`, data);
      return response.data.playlist;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Invitar colaborador a playlist
  async inviteCollaborator(
    playlistId: string,
    colaboradorId: string
  ): Promise<void> {
    try {
      await api.post(`/playlists/${playlistId}/colaboradores`, {
        colaboradorId,
      });
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Actualizar portada de playlist
  async updatePlaylistCover(
    playlistId: string,
    nuevaPortadaUrl: string
  ): Promise<Playlist> {
    try {
      const response = await api.patch<{
        ok: boolean;
        playlist: Playlist;
        message: string;
      }>(`/playlists/${playlistId}/portada`, { nuevaPortadaUrl });
      return response.data.playlist;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },
};
