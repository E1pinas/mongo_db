import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts";
import type { Playlist } from "../../../types";
import type { ErrorPlaylist } from "../tipos";
import { servicioPlaylist } from "../servicios/playlistApi";

interface UseDatosPlaylistResult {
  playlist: Playlist | null;
  cargando: boolean;
  error: ErrorPlaylist | null;
  estaSiguiendo: boolean;
  recargarPlaylist: () => Promise<void>;
}

export const useDatosPlaylist = (
  playlistId?: string
): UseDatosPlaylistResult => {
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorPlaylist | null>(null);
  const [estaSiguiendo, setEstaSiguiendo] = useState(false);

  const cargarPlaylist = async () => {
    if (!playlistId) return;

    try {
      setCargando(true);
      setError(null);
      const datos = await servicioPlaylist.obtenerPlaylistPorId(playlistId);
      setPlaylist(datos);

      // Sincronizar estado de seguimiento
      if (user && datos.seguidores) {
        setEstaSiguiendo(datos.seguidores.includes(user._id));
      }

      // Agregar a recientes
      await servicioPlaylist.agregarARecientes(datos);
    } catch (err: any) {
      console.error("Error al cargar playlist:", err);

      // Manejar errores específicos
      if (
        err.response?.status === 403 ||
        err.response?.data?.esPrivada ||
        err.message.includes("privada")
      ) {
        setError({
          tipo: "private",
          mensaje: "Esta playlist es privada. Solo el creador puede verla.",
        });
      } else if (err.response?.status === 404) {
        setError({
          tipo: "not_found",
          mensaje: "Esta playlist no existe o fue eliminada.",
        });
      } else {
        setError({
          tipo: "unavailable",
          mensaje: "No se pudo cargar esta playlist. Intenta nuevamente.",
        });
      }
      setPlaylist(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlaylist();
  }, [playlistId]);

  return {
    playlist,
    cargando,
    error,
    estaSiguiendo,
    recargarPlaylist: cargarPlaylist,
  };
};
