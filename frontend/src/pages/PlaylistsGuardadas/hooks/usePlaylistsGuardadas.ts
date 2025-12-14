import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";
import { useAuth } from "../../../contexts";
import type { Playlist } from "../../../types";

export function usePlaylistsGuardadas() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [cargando, setCargando] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    cargarPlaylistsGuardadas();
  }, []);

  const cargarPlaylistsGuardadas = async () => {
    try {
      setCargando(true);
      const playlistsGuardadas = await musicService.getLikedPlaylists();
      // Filtrar solo las playlists que NO son creadas por el usuario
      const playlistsFiltradas = playlistsGuardadas.filter((playlist) => {
        const creadorId =
          typeof playlist.creador === "string"
            ? playlist.creador
            : playlist.creador?._id;
        return creadorId !== user?._id;
      });
      setPlaylists(playlistsFiltradas);
    } catch (error) {
      console.error("Error cargando playlists guardadas:", error);
    } finally {
      setCargando(false);
    }
  };

  return {
    playlists,
    cargando,
    recargar: cargarPlaylistsGuardadas,
  };
}
