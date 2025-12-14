import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts";
import type { Album } from "../../../types";
import type { GeneroConTodo } from "../tipos";
import { servicioAlbumes } from "../servicios/albumesApi";

interface UseAlbumesParams {
  generoSeleccionado: GeneroConTodo;
}

interface UseAlbumesResult {
  misAlbumes: Album[];
  albumesPublicos: Album[];
  cargando: boolean;
  albumesFiltradosMios: Album[];
  albumesFiltradosPublicos: Album[];
  recargarAlbumes: () => Promise<void>;
}

export const useAlbumes = ({
  generoSeleccionado,
}: UseAlbumesParams): UseAlbumesResult => {
  const { user } = useAuth();
  const [misAlbumes, setMisAlbumes] = useState<Album[]>([]);
  const [albumesPublicos, setAlbumesPublicos] = useState<Album[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarAlbumes = async () => {
    try {
      setCargando(true);
      const [misAlbumsData, albumesPublicosData] = await Promise.all([
        servicioAlbumes.obtenerMisAlbumes(),
        servicioAlbumes.obtenerAlbumesPublicos(),
      ]);
      console.log("Mis álbumes:", misAlbumsData);
      console.log("Álbumes públicos:", albumesPublicosData);
      setMisAlbumes(misAlbumsData);
      setAlbumesPublicos(albumesPublicosData);
    } catch (error) {
      console.error("Error al cargar álbumes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlbumes();
  }, []);

  // Filtrar álbumes por género
  const albumesFiltradosMios =
    generoSeleccionado === "Todo"
      ? misAlbumes
      : misAlbumes.filter((album) =>
          album.generos?.includes(generoSeleccionado)
        );

  // Filtrar álbumes públicos excluyendo los del usuario actual
  const albumesDeOtros = albumesPublicos.filter((album) => {
    const esDelUsuario = album.artistas?.some((artista: any) =>
      typeof artista === "string"
        ? artista === user?._id
        : artista._id === user?._id
    );
    return !esDelUsuario;
  });

  const albumesFiltradosPublicos =
    generoSeleccionado === "Todo"
      ? albumesDeOtros
      : albumesDeOtros.filter((album) =>
          album.generos?.includes(generoSeleccionado)
        );

  return {
    misAlbumes,
    albumesPublicos,
    cargando,
    albumesFiltradosMios,
    albumesFiltradosPublicos,
    recargarAlbumes: cargarAlbumes,
  };
};
