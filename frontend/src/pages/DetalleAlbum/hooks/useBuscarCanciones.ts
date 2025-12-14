import { useState } from "react";
import { useAuth } from "../../../contexts";
import type { Cancion } from "../../../types";
import { servicioAlbum } from "../servicios/albumApi";

interface UseBuscarCancionesParams {
  albumId: string;
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

  // Acciones
  setConsulta: (consulta: string) => void;
  buscarCanciones: () => Promise<void>;
  agregarCancion: (cancionId: string) => Promise<void>;
  toggleSeleccionCancion: (cancionId: string) => void;
  agregarCancionesSeleccionadas: () => Promise<void>;
  limpiarResultados: () => void;
}

export const useBuscarCanciones = ({
  albumId,
  cancionesExistentes,
  onCancionesAgregadas,
}: UseBuscarCancionesParams): UseBuscarCancionesResult => {
  const { user } = useAuth();
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

  const buscarCanciones = async () => {
    if (!consulta.trim() || !user) return;

    setBuscando(true);
    try {
      const cancionesDisponibles = await servicioAlbum.buscarCancionesPropias(
        consulta,
        user._id,
        cancionesExistentes
      );
      setResultados(cancionesDisponibles);
    } catch (error) {
      console.error("Error al buscar canciones:", error);
    } finally {
      setBuscando(false);
    }
  };

  const agregarCancion = async (cancionId: string) => {
    setAgregandoCancionId(cancionId);
    try {
      await servicioAlbum.agregarCancionAlAlbum(albumId, cancionId);
      await onCancionesAgregadas();
      // Remover de resultados
      setResultados((prev) => prev.filter((c) => c._id !== cancionId));
    } catch (error: any) {
      console.error("Error al agregar canción:", error);
      alert(error.response?.data?.mensaje || "Error al agregar la canción");
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
      await servicioAlbum.agregarVariasCancionesAlAlbum(albumId, idsArray);
      await onCancionesAgregadas();
      // Remover canciones agregadas de los resultados
      setResultados((prev) =>
        prev.filter((c) => !idsCancionesSeleccionadas.has(c._id))
      );
      // Limpiar selección
      setIdsCancionesSeleccionadas(new Set());
    } catch (error: any) {
      console.error("Error al agregar canciones:", error);
      alert(error.response?.data?.mensaje || "Error al agregar las canciones");
    } finally {
      setAgregandoMultiple(false);
    }
  };

  const limpiarResultados = () => {
    setConsulta("");
    setResultados([]);
    setIdsCancionesSeleccionadas(new Set());
  };

  return {
    // Estados
    consulta,
    resultados,
    buscando,
    agregandoCancionId,
    idsCancionesSeleccionadas,
    agregandoMultiple,

    // Acciones
    setConsulta,
    buscarCanciones,
    agregarCancion,
    toggleSeleccionCancion,
    agregarCancionesSeleccionadas,
    limpiarResultados,
  };
};
