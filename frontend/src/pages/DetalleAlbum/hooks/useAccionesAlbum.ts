import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts";
import type { Album, Cancion } from "../../../types";
import { servicioAlbum } from "../servicios/albumApi";

interface UseAccionesAlbumParams {
  album: Album | null;
  recargarAlbum: () => Promise<void>;
}

interface UseAccionesAlbumResult {
  // Estados
  cancionAQuitar: Cancion | null;
  eliminandoCancion: boolean;
  borrando: boolean;
  cambiandoPrivacidad: boolean;
  mostrarConfirmarEliminar: boolean;
  mostrarConfirmarPrivacidad: boolean;
  mensajeError: string;

  // Acciones
  setCancionAQuitar: (cancion: Cancion | null) => void;
  setMostrarConfirmarEliminar: (mostrar: boolean) => void;
  setMostrarConfirmarPrivacidad: (mostrar: boolean) => void;
  manejarToggleLike: () => Promise<void>;
  manejarQuitarCancion: () => Promise<void>;
  manejarEliminarAlbum: () => Promise<void>;
  manejarCambiarPrivacidad: () => Promise<void>;
  limpiarError: () => void;

  // Permisos
  puedeEditar: () => boolean;
}

export const useAccionesAlbum = ({
  album,
  recargarAlbum,
}: UseAccionesAlbumParams): UseAccionesAlbumResult => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cancionAQuitar, setCancionAQuitar] = useState<Cancion | null>(null);
  const [eliminandoCancion, setEliminandoCancion] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [cambiandoPrivacidad, setCambiandoPrivacidad] = useState(false);
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] =
    useState(false);
  const [mostrarConfirmarPrivacidad, setMostrarConfirmarPrivacidad] =
    useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const puedeEditar = (): boolean => {
    if (!user || !album) return false;
    return (
      album.artistas?.some((a) =>
        typeof a === "string" ? a === user._id : a._id === user._id
      ) || false
    );
  };

  const manejarToggleLike = async () => {
    if (!album) return;
    try {
      await servicioAlbum.toggleLikeAlbum(album._id);
      await recargarAlbum();
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  };

  const manejarQuitarCancion = async () => {
    if (!cancionAQuitar || !album) return;

    try {
      setEliminandoCancion(true);
      await servicioAlbum.quitarCancionDeAlbum(album._id, cancionAQuitar._id);
      setCancionAQuitar(null);
      await recargarAlbum();
    } catch (error: any) {
      console.error("Error al quitar canción:", error);
      setMensajeError(error.message || "Error al quitar la canción");
    } finally {
      setEliminandoCancion(false);
    }
  };

  const manejarEliminarAlbum = async () => {
    if (!album) return;

    setBorrando(true);
    setMostrarConfirmarEliminar(false);

    try {
      const exito = await servicioAlbum.eliminarAlbum(album._id);
      if (exito) {
        navigate("/albumes");
      } else {
        setMensajeError("Error al eliminar el álbum");
        setBorrando(false);
      }
    } catch (error: any) {
      console.error("Error al eliminar álbum:", error);
      setMensajeError(
        error.response?.data?.message || "Error al eliminar el álbum"
      );
      setBorrando(false);
    }
  };

  const manejarCambiarPrivacidad = async () => {
    if (!album) return;

    setCambiandoPrivacidad(true);

    try {
      await servicioAlbum.actualizarPrivacidad(album._id, !album.esPrivado);
      setMostrarConfirmarPrivacidad(false);
      await recargarAlbum();
    } catch (error: any) {
      console.error("Error al cambiar privacidad:", error);
      setMensajeError(
        error.response?.data?.message ||
          "Error al cambiar la privacidad del álbum"
      );
    } finally {
      setCambiandoPrivacidad(false);
    }
  };

  const limpiarError = () => {
    setMensajeError("");
  };

  return {
    // Estados
    cancionAQuitar,
    eliminandoCancion,
    borrando,
    cambiandoPrivacidad,
    mostrarConfirmarEliminar,
    mostrarConfirmarPrivacidad,
    mensajeError,

    // Acciones
    setCancionAQuitar,
    setMostrarConfirmarEliminar,
    setMostrarConfirmarPrivacidad,
    manejarToggleLike,
    manejarQuitarCancion,
    manejarEliminarAlbum,
    manejarCambiarPrivacidad,
    limpiarError,

    // Permisos
    puedeEditar,
  };
};
