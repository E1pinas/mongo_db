import { musicService } from "../../../services/music.service";
import type { Album, Cancion } from "../../../types";
import type { DatosAlbum } from "../tipos";

export const servicioAlbumes = {
  // Obtener mis álbumes
  obtenerMisAlbumes: async (): Promise<Album[]> => {
    return await musicService.getMyAlbums();
  },

  // Obtener álbumes públicos
  obtenerAlbumesPublicos: async (): Promise<Album[]> => {
    return await musicService.getPublicAlbums();
  },

  // Buscar canciones propias
  buscarMisCanciones: async (query: string): Promise<Cancion[]> => {
    if (!query.trim()) return [];
    return await musicService.searchMySongs(query);
  },

  // Subir imagen de portada
  subirImagen: async (archivo: File): Promise<{ imagenUrl: string }> => {
    return await musicService.subirImagen(archivo);
  },

  // Crear álbum
  crearAlbum: async (datos: DatosAlbum): Promise<Album> => {
    const respuesta = await fetch("http://localhost:3900/api/albumes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
      credentials: "include",
    });

    const data = await respuesta.json();
    if (!respuesta.ok || !data.ok) {
      throw new Error(data.message || "Error al crear el álbum");
    }

    return data.album;
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
    for (const cancionId of cancionIds) {
      try {
        await musicService.addSongToAlbum(albumId, cancionId);
      } catch (err) {
        console.error("Error adding song to album:", err);
      }
    }
  },
};
