import { useState } from "react";
import { musicService } from "../../../services/music.service";
import type { Cancion } from "../../../types";

export const useBusquedaCanciones = (
  cargarCanciones: () => Promise<void>,
  setCanciones: (canciones: Cancion[]) => void
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      cargarCanciones();
      return;
    }

    if (query.length < 2) return;

    try {
      setSearching(true);
      const results = await musicService.searchMySongs(query);
      setCanciones(results);
    } catch (err: any) {
      console.error("Error searching:", err);
    } finally {
      setSearching(false);
    }
  };

  return { searchQuery, searching, handleSearch };
};
