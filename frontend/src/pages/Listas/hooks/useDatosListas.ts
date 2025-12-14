import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import type { Playlist } from "../../../types";
import { servicioListas } from "../servicios/listasApi";

interface UseDatosListasResult {
  misPlaylists: Playlist[];
  playlistsPublicas: Playlist[];
  cargando: boolean;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  recargarPlaylists: () => Promise<void>;
}

export const useDatosListas = (): UseDatosListasResult => {
  const { user } = useAuth();
  const [misPlaylists, setMisPlaylists] = useState<Playlist[]>([]);
  const [playlistsPublicas, setPlaylistsPublicas] = useState<Playlist[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPlaylists = async () => {
    try {
      setCargando(true);
      setError("");

      const [createdPlaylists, publicPlaylists] = await Promise.all([
        servicioListas.obtenerMisPlaylists(),
        servicioListas.obtenerPlaylistsPublicas(),
      ]);

      console.log("Mis playlists creadas:", createdPlaylists);
      console.log("Playlists públicas:", publicPlaylists);

      // Filtrar playlists públicas excluyendo las del usuario actual
      const playlistsDeOtros = publicPlaylists.filter((playlist) => {
        const creadorId =
          typeof playlist.creador === "string"
            ? playlist.creador
            : playlist.creador?._id;
        return creadorId !== user?._id;
      });

      setMisPlaylists(createdPlaylists);
      setPlaylistsPublicas(playlistsDeOtros);
    } catch (err: any) {
      console.error("Error loading playlists:", err);
      if (!err.message?.includes("404")) {
        setError(err.message || "Error al cargar playlists");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlaylists();
  }, []);

  return {
    misPlaylists,
    playlistsPublicas,
    cargando,
    error,
    setError,
    recargarPlaylists: cargarPlaylists,
  };
};
