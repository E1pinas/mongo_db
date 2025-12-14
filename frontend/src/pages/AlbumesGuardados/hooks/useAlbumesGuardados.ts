import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";
import type { Album } from "../../../types";

export function useAlbumesGuardados() {
  const [albumes, setAlbumes] = useState<Album[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAlbumesGuardados();
  }, []);

  const cargarAlbumesGuardados = async () => {
    try {
      setCargando(true);
      const albumesGuardados = await musicService.getLikedAlbums();
      setAlbumes(albumesGuardados);
    } catch (error) {
      console.error("Error cargando álbumes guardados:", error);
    } finally {
      setCargando(false);
    }
  };

  return {
    albumes,
    cargando,
    recargar: cargarAlbumesGuardados,
  };
}
