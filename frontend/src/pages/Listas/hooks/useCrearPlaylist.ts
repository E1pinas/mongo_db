import { useState } from "react";
import type { Cancion } from "../../../types";
import { servicioListas } from "../servicios/listasApi";

interface UseCrearPlaylistParams {
  onPlaylistCreada: () => Promise<void>;
}

interface UseCrearPlaylistResult {
  nombre: string;
  descripcion: string;
  esPublica: boolean;
  esColaborativa: boolean;
  portadaFile: File | null;
  portadaPreview: string;
  cancionesBuscadas: Cancion[];
  selectedSongs: string[];
  searchQuery: string;
  buscando: boolean;
  creando: boolean;
  error: string;
  setNombre: (nombre: string) => void;
  setDescripcion: (descripcion: string) => void;
  setEsPublica: (publica: boolean) => void;
  setEsColaborativa: (colaborativa: boolean) => void;
  setPortadaFile: (file: File | null) => void;
  setPortadaPreview: (preview: string) => void;
  setSearchQuery: (query: string) => void;
  setError: (error: string) => void;
  manejarCambioPortada: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleCancion: (cancionId: string) => void;
  buscarCanciones: () => Promise<void>;
  resetearFormulario: () => void;
  crearPlaylist: (e: React.FormEvent) => Promise<void>;
}

export const useCrearPlaylist = ({
  onPlaylistCreada,
}: UseCrearPlaylistParams): UseCrearPlaylistResult => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esPublica, setEsPublica] = useState(true);
  const [esColaborativa, setEsColaborativa] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState("");
  const [cancionesBuscadas, setCancionesBuscadas] = useState<Cancion[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

  const manejarCambioPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      return;
    }

    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
    setError("");
  };

  const buscarCanciones = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    try {
      setBuscando(true);
      console.log("Buscando canciones:", searchQuery);
      const results = await servicioListas.buscarCanciones(searchQuery);
      console.log("Resultados encontrados:", results);
      setCancionesBuscadas(results);
    } catch (err: any) {
      console.error("Error searching songs:", err);
      setError(err.message || "Error al buscar canciones");
    } finally {
      setBuscando(false);
    }
  };

  const toggleCancion = (cancionId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(cancionId)
        ? prev.filter((id) => id !== cancionId)
        : [...prev, cancionId]
    );
  };

  const resetearFormulario = () => {
    setNombre("");
    setDescripcion("");
    setEsPublica(true);
    setEsColaborativa(false);
    setPortadaFile(null);
    setPortadaPreview("");
    setSelectedSongs([]);
    setCancionesBuscadas([]);
    setSearchQuery("");
    setError("");
  };

  const crearPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El título de la playlist es obligatorio");
      return;
    }

    try {
      setCreando(true);
      setError("");

      // 1. Subir portada si existe
      let portadaUrl = "";
      if (portadaFile) {
        try {
          const imageData = await servicioListas.subirImagen(portadaFile);
          portadaUrl = imageData.imagenUrl;
        } catch (uploadError: any) {
          setError(
            uploadError.message || "Error al subir la imagen de portada"
          );
          setCreando(false);
          return;
        }
      }

      // 2. Crear la playlist
      const nuevaPlaylist = await servicioListas.crearPlaylist({
        titulo: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        esPublica,
        esColaborativa,
        portadaUrl: portadaUrl || undefined,
      });

      // 3. Agregar canciones seleccionadas
      if (selectedSongs.length > 0 && nuevaPlaylist._id) {
        await servicioListas.agregarVariasCancionesAPlaylist(
          nuevaPlaylist._id,
          selectedSongs
        );
      }

      // Recargar playlists
      await onPlaylistCreada();
      resetearFormulario();
    } catch (err: any) {
      console.error("Error creating playlist:", err);
      setError(err.message || "Error al crear playlist");
    } finally {
      setCreando(false);
    }
  };

  return {
    nombre,
    descripcion,
    esPublica,
    esColaborativa,
    portadaFile,
    portadaPreview,
    cancionesBuscadas,
    selectedSongs,
    searchQuery,
    buscando,
    creando,
    error,
    setNombre,
    setDescripcion,
    setEsPublica,
    setEsColaborativa,
    setPortadaFile,
    setPortadaPreview,
    setSearchQuery,
    setError,
    manejarCambioPortada,
    toggleCancion,
    buscarCanciones,
    resetearFormulario,
    crearPlaylist,
  };
};
