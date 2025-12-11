import axios from "axios";
import type { Album } from "../types";

const API_URL = "http://localhost:3900/api";

interface CreateAlbumData {
  titulo: string;
  descripcion?: string;
  portadaUrl?: string;
  generos?: string[];
  fechaLanzamiento?: string;
  esPrivado?: boolean;
}

export const albumService = {
  // Listar álbumes públicos
  async getPublicAlbums(): Promise<Album[]> {
    try {
      const { data } = await axios.get(`${API_URL}/albumes/publicos`, {
        withCredentials: true,
      });
      return data.albumes || [];
    } catch (error) {
      console.error("Error fetching public albums:", error);
      return [];
    }
  },

  // Buscar álbumes
  async searchAlbums(query: string): Promise<Album[]> {
    try {
      const { data } = await axios.get(`${API_URL}/albumes/buscar`, {
        params: { q: query },
        withCredentials: true,
      });
      return data.albumes || [];
    } catch (error) {
      console.error("Error searching albums:", error);
      return [];
    }
  },

  // Obtener álbum por ID
  async getAlbumById(id: string): Promise<Album | null> {
    try {
      const { data } = await axios.get(`${API_URL}/albumes/${id}`, {
        withCredentials: true,
      });
      return data.album || null;
    } catch (error) {
      console.error("Error fetching album:", error);
      return null;
    }
  },

  // Crear álbum
  async createAlbum(albumData: CreateAlbumData): Promise<Album | null> {
    try {
      const { data } = await axios.post(`${API_URL}/albumes`, albumData, {
        withCredentials: true,
      });
      return data.album || null;
    } catch (error) {
      console.error("Error creating album:", error);
      throw error;
    }
  },

  // Eliminar álbum
  async deleteAlbum(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/albumes/${id}`, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      console.error("Error deleting album:", error);
      return false;
    }
  },

  // Actualizar álbum (privacidad, título, descripción, etc.)
  async updateAlbum(
    id: string,
    data: {
      titulo?: string;
      descripcion?: string;
      esPrivado?: boolean;
    }
  ): Promise<Album | null> {
    try {
      const { data: response } = await axios.patch(
        `${API_URL}/albumes/${id}`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.album || null;
    } catch (error) {
      console.error("Error updating album:", error);
      return null;
    }
  },

  // Agregar canción a álbum
  async addSongToAlbum(albumId: string, songId: string): Promise<boolean> {
    try {
      await axios.post(
        `${API_URL}/albumes/${albumId}/canciones/${songId}`,
        {},
        {
          withCredentials: true,
        }
      );
      return true;
    } catch (error) {
      console.error("Error adding song to album:", error);
      return false;
    }
  },

  // Actualizar portada del álbum
  async updateAlbumCover(albumId: string, file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("portada", file);

      const { data } = await axios.patch(
        `${API_URL}/albumes/${albumId}/portada`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      return data.portadaUrl || null;
    } catch (error) {
      console.error("Error updating album cover:", error);
      return null;
    }
  },

  // Obtener mis álbumes (del usuario autenticado)
  async getMyAlbums(): Promise<Album[]> {
    try {
      const { data } = await axios.get(`${API_URL}/usuarios/perfil`, {
        withCredentials: true,
      });
      // Devuelve los álbumes del usuario
      return data.usuario?.misAlbumes || [];
    } catch (error) {
      console.error("Error fetching my albums:", error);
      return [];
    }
  },
};
