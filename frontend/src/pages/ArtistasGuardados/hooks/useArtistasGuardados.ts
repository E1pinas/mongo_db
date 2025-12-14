import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";

export function useArtistasGuardados() {
  const [artistas, setArtistas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarArtistasGuardados();
  }, []);

  const cargarArtistasGuardados = async () => {
    try {
      setCargando(true);
      const artistasGuardados = await musicService.getLikedArtists();
      setArtistas(artistasGuardados);
    } catch (error) {
      console.error("Error cargando artistas guardados:", error);
    } finally {
      setCargando(false);
    }
  };

  return {
    artistas,
    cargando,
    recargar: cargarArtistasGuardados,
  };
}
