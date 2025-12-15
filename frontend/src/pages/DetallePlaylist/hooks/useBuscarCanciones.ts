import { useState } from "react";
import type { Cancion } from "../../../types";
import { servicioPlaylist } from "../servicios/playlistApi";

interface UseBuscarCancionesParams {
  playlistId: string;
  cancionesExistentes: Cancion[];
  onCancionesAgregadas: () => Promise<void>;
}

interface UseBuscarCancionesResult {
  // Estados
  consulta: string;
  resultados: Cancion[];
  buscando: boolean;
  agregandoCancionId: string | null;
  idsCancionesSeleccionadas: Set<string>;
  agregandoMultiple: boolean;
  mensajeError: string;

  // Acciones
  setConsulta: (consulta: string) => void;
  buscarCanciones: () => Promise<void>;
  agregarCancion: (cancionId: string) => Promise<void>;
  toggleSeleccionCancion: (cancionId: string) => void;
  agregarCancionesSeleccionadas: () => Promise<void>;
  limpiarResultados: () => void;
  limpiarError: () => void;
}

export const useBuscarCanciones = ({
  playlistId,
  cancionesExistentes,
  onCancionesAgregadas,
}: UseBuscarCancionesParams): UseBuscarCancionesResult => {
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<Cancion[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [agregandoCancionId, setAgregandoCancionId] = useState<string | null>(
    null
  );
  const [idsCancionesSeleccionadas, setIdsCancionesSeleccionadas] = useState<
    Set<string>
  >(new Set());
  const [agregandoMultiple, setAgregandoMultiple] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const buscarCanciones = async () => {
    if (!consulta.trim()) return;

    setBuscando(true);
    try {
      const resultadosBusqueda = await servicioPlaylist.buscarCanciones(
        consulta
      );

      // Filtrar canciones que ya están en la playlist
      const idsExistentes = new Set(cancionesExistentes.map((c) => c._id));
      const cancionesDisponibles = resultadosBusqueda.filter(
        (cancion) => !idsExistentes.has(cancion._id)
      );

      setResultados(cancionesDisponibles);
    } catch (error) {
      console.error("Error al buscar canciones:", error);
      setMensajeError("Error al buscar canciones");
    } finally {
      setBuscando(false);
    }
  };

  const agregarCancion = async (cancionId: string) => {
    setAgregandoCancionId(cancionId);
    try {
      await servicioPlaylist.agregarCancionAPlaylist(playlistId, cancionId);
      await onCancionesAgregadas();
      // Remover de resultados
      setResultados((prev) => prev.filter((c) => c._id !== cancionId));
    } catch (error: any) {
      console.error("Error al agregar canción:", error);
      setMensajeError(
        error.response?.data?.message ||
          "Error al agregar canción a la playlist"
      );
    } finally {
      setAgregandoCancionId(null);
    }
  };

  const toggleSeleccionCancion = (cancionId: string) => {
    setIdsCancionesSeleccionadas((prev) => {
      const nuevoSet = new Set(prev);
      if (nuevoSet.has(cancionId)) {
        nuevoSet.delete(cancionId);
      } else {
        nuevoSet.add(cancionId);
      }
      return nuevoSet;
    });
  };

  const agregarCancionesSeleccionadas = async () => {
    if (idsCancionesSeleccionadas.size === 0) return;

    setAgregandoMultiple(true);
    try {
      const idsArray = Array.from(idsCancionesSeleccionadas);
      await servicioPlaylist.agregarVariasCancionesAPlaylist(
        playlistId,
        idsArray
      );
      await onCancionesAgregadas();
      // Remover canciones agregadas de los resultados
      setResultados((prev) =>
        prev.filter((c) => !idsCancionesSeleccionadas.has(c._id))
      );
      // Limpiar selección
      setIdsCancionesSeleccionadas(new Set());
    } catch (error: any) {
      console.error("Error al agregar canciones:", error);
      setMensajeError(
        error.response?.data?.message ||
          "Error al agregar las canciones a la playlist"
      );
    } finally {
      setAgregandoMultiple(false);
    }
  };

  const limpiarResultados = () => {
    setConsulta("");
    setResultados([]);
    setIdsCancionesSeleccionadas(new Set());
  };

  const limpiarError = () => {
    setMensajeError("");
  };

  return {
    // Estados
    consulta,
    resultados,
    buscando,
    agregandoCancionId,
    idsCancionesSeleccionadas,
    agregandoMultiple,
    mensajeError,

    // Acciones
    setConsulta,
    buscarCanciones,
    agregarCancion,
    toggleSeleccionCancion,
    agregarCancionesSeleccionadas,
    limpiarResultados,
    limpiarError,
  };
};
