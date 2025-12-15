import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts";
import type { Playlist, Cancion } from "../../../types";
import { servicioPlaylist } from "../servicios/playlistApi";

interface UseAccionesPlaylistParams {
  playlist: Playlist | null;
  recargarPlaylist: () => Promise<void>;
}

interface UseAccionesPlaylistResult {
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
  manejarToggleSeguir: () => Promise<void>;
  manejarQuitarCancion: () => Promise<void>;
  manejarEliminarPlaylist: () => Promise<void>;
  manejarCambiarPrivacidad: () => Promise<void>;
  limpiarError: () => void;

  // Permisos
  esCreador: () => boolean;
  puedeEditar: () => boolean;
}

export const useAccionesPlaylist = ({
  playlist,
  recargarPlaylist,
}: UseAccionesPlaylistParams): UseAccionesPlaylistResult => {
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

  const esCreador = (): boolean => {
    if (!user || !playlist) return false;
    return typeof playlist.creador === "string"
      ? playlist.creador === user._id
      : playlist.creador._id === user._id;
  };

  const puedeEditar = (): boolean => {
    if (!user || !playlist) return false;
    const esElCreador = esCreador();
    const esColaborador =
      playlist.esColaborativa &&
      playlist.colaboradores?.some((c) =>
        typeof c === "string" ? c === user._id : c._id === user._id
      );
    return esElCreador || esColaborador;
  };

  const manejarToggleSeguir = async () => {
    if (!playlist) return;
    try {
      await servicioPlaylist.toggleSeguirPlaylist(playlist._id);
      await recargarPlaylist();
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    }
  };

  const manejarQuitarCancion = async () => {
    if (!cancionAQuitar || !playlist) return;

    try {
      setEliminandoCancion(true);
      await servicioPlaylist.quitarCancionDePlaylist(
        playlist._id,
        cancionAQuitar._id
      );
      setCancionAQuitar(null);
      await recargarPlaylist();
    } catch (error: any) {
      console.error("Error al quitar canción:", error);
      setMensajeError(error.message || "Error al quitar la canción");
    } finally {
      setEliminandoCancion(false);
    }
  };

  const manejarEliminarPlaylist = async () => {
    if (!playlist) return;

    setBorrando(true);
    setMostrarConfirmarEliminar(false);

    try {
      await servicioPlaylist.eliminarPlaylist(playlist._id);
      navigate("/playlists");
    } catch (error: any) {
      console.error("Error al eliminar playlist:", error);
      setMensajeError(error.message || "Error al eliminar la playlist");
      setBorrando(false);
    }
  };

  const manejarCambiarPrivacidad = async () => {
    if (!playlist) return;

    setCambiandoPrivacidad(true);

    try {
      await servicioPlaylist.actualizarPrivacidad(
        playlist._id,
        !playlist.esPublica
      );
      setMostrarConfirmarPrivacidad(false);
      await recargarPlaylist();
    } catch (error: any) {
      console.error("Error al cambiar privacidad:", error);
      setMensajeError(
        error.response?.data?.message ||
          "Error al cambiar la privacidad de la playlist"
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
    manejarToggleSeguir,
    manejarQuitarCancion,
    manejarEliminarPlaylist,
    manejarCambiarPrivacidad,
    limpiarError,

    // Permisos
    esCreador,
    puedeEditar,
  };
};
