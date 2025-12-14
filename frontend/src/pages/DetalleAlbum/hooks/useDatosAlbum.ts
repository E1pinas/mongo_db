import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts";
import type { Album } from "../../../types";
import type { ErrorAlbum } from "../tipos";
import { servicioAlbum } from "../servicios/albumApi";

interface UseDatosAlbumResult {
  album: Album | null;
  cargando: boolean;
  error: ErrorAlbum | null;
  leGusta: boolean;
  recargarAlbum: () => Promise<void>;
}

export const useDatosAlbum = (albumId?: string): UseDatosAlbumResult => {
  const { user } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorAlbum | null>(null);
  const [leGusta, setLeGusta] = useState(false);

  const cargarAlbum = async () => {
    if (!albumId) return;

    try {
      setCargando(true);
      setError(null);
      const datos = await servicioAlbum.obtenerAlbumPorId(albumId);

      if (!datos) {
        console.error("No se recibió datos del álbum");
        setAlbum(null);
        return;
      }

      setAlbum(datos);

      // Sincronizar estado de like
      if (user && datos.likes) {
        setLeGusta(datos.likes.includes(user._id));
      }

      // Agregar a recientes
      await servicioAlbum.agregarARecientes(datos);
    } catch (err: any) {
      console.error("Error al cargar álbum:", err);

      // Manejar errores específicos
      if (
        err.response?.status === 403 ||
        err.response?.data?.esPrivado ||
        err.message.includes("privado")
      ) {
        setError({
          tipo: "private",
          mensaje: "Este álbum es privado. Solo los artistas pueden verlo.",
        });
      } else if (err.response?.status === 404) {
        setError({
          tipo: "not_found",
          mensaje: "Este álbum no existe o fue eliminado.",
        });
      } else {
        setError({
          tipo: "unavailable",
          mensaje: "No se pudo cargar este álbum. Intenta nuevamente.",
        });
      }
      setAlbum(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlbum();
  }, [albumId]);

  return {
    album,
    cargando,
    error,
    leGusta,
    recargarAlbum: cargarAlbum,
  };
};
