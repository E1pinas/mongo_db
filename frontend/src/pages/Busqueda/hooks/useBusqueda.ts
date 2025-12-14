import { useState } from "react";
import { musicService } from "../../../services/music.service";
import { authService } from "../../../services/auth.service";
import type { ResultadosBusqueda, EstadoBusqueda } from "../tipos";

export const useBusqueda = () => {
  const [resultados, setResultados] = useState<ResultadosBusqueda>({
    canciones: [],
    albumes: [],
    playlists: [],
    usuarios: [],
  });

  const [estado, setEstado] = useState<EstadoBusqueda>({
    query: "",
    cargando: false,
    searched: false,
  });

  const handleSearch = async (searchQuery: string) => {
    setEstado((prev) => ({ ...prev, query: searchQuery }));

    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResultados({
        canciones: [],
        albumes: [],
        playlists: [],
        usuarios: [],
      });
      setEstado((prev) => ({ ...prev, searched: false }));
      return;
    }

    try {
      setEstado((prev) => ({ ...prev, cargando: true, searched: true }));

      const [songs, albums, playlistResults, users] = await Promise.all([
        musicService.searchSongs(searchQuery),
        musicService.searchAlbums(searchQuery),
        musicService.getPublicPlaylists(),
        authService.searchUsers(searchQuery),
      ]);

      const queryLower = searchQuery.toLowerCase();
      const filteredPlaylists = playlistResults.filter((p) => {
        const matchTitle = p.titulo?.toLowerCase().includes(queryLower);
        const matchDescription = p.descripcion
          ?.toLowerCase()
          .includes(queryLower);
        return matchTitle || matchDescription;
      });

      setResultados({
        canciones: songs,
        albumes: albums,
        playlists: filteredPlaylists,
        usuarios: users,
      });
    } catch (err: any) {
      console.error("Error searching:", err);
      setResultados({
        canciones: [],
        albumes: [],
        playlists: [],
        usuarios: [],
      });
    } finally {
      setEstado((prev) => ({ ...prev, cargando: false }));
    }
  };

  const reloadSongs = async () => {
    if (estado.query.trim() && estado.query.length >= 2) {
      try {
        const songs = await musicService.searchSongs(estado.query);
        setResultados((prev) => ({ ...prev, canciones: songs }));
      } catch (error) {
        console.error("Error reloading search:", error);
      }
    }
  };

  const totalResults =
    resultados.canciones.length +
    resultados.albumes.length +
    resultados.playlists.length +
    resultados.usuarios.length;

  return {
    resultados,
    estado,
    totalResults,
    handleSearch,
    reloadSongs,
  };
};
