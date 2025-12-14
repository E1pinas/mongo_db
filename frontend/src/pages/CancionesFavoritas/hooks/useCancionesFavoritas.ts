import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";
import type { Cancion } from "../../../types";

export const useCancionesFavoritas = () => {
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCanciones();

    const handleLikeChange = () => {
      cargarCanciones();
    };

    window.addEventListener("likeChanged", handleLikeChange);

    return () => {
      window.removeEventListener("likeChanged", handleLikeChange);
    };
  }, []);

  const cargarCanciones = async () => {
    try {
      setCargando(true);
      const songs = await musicService.getLikedSongs();
      const sortedSongs = songs.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      setCanciones(sortedSongs);
    } catch (error) {
      console.error("Error cargando canciones guardadas:", error);
    } finally {
      setCargando(false);
    }
  };

  return { canciones, setCanciones, cargando };
};
