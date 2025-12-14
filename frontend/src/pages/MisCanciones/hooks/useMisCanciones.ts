import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";
import type { Cancion } from "../../../types";

export const useMisCanciones = () => {
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCanciones();
  }, []);

  const cargarCanciones = async () => {
    try {
      setCargando(true);
      const songs = await musicService.getMySongs();
      setCanciones(songs);
    } catch (err: any) {
      console.error("Error loading songs:", err);
      setError(err.message || "Error al cargar canciones");
    } finally {
      setCargando(false);
    }
  };

  return {
    canciones,
    setCanciones,
    cargando,
    error,
    setError,
    cargarCanciones,
  };
};
