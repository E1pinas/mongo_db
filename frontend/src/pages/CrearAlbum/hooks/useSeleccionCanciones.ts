import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";
import type { Cancion } from "../../../types";

export const useSeleccionCanciones = () => {
  const [misCanciones, setMisCanciones] = useState<Cancion[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [showSongSelector, setShowSongSelector] = useState(false);

  useEffect(() => {
    cargarMisCanciones();
  }, []);

  const cargarMisCanciones = async () => {
    try {
      const canciones = await musicService.getMySongs();
      setMisCanciones(canciones);
    } catch (error) {
      console.error("Error loading songs:", error);
    }
  };

  const toggleSong = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  return {
    misCanciones,
    selectedSongs,
    showSongSelector,
    setShowSongSelector,
    toggleSong,
  };
};
