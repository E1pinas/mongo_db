import { useState } from "react";
import type { ArchivosSubida } from "../tipos";
import { LIMITES_ARCHIVO } from "../utils/constantes";

export const useGestionArchivos = () => {
  const [archivos, setArchivos] = useState<ArchivosSubida>({
    audioFile: null,
    portadaFile: null,
    audioPreview: "",
    portadaPreview: "",
    duracionSegundos: 0,
  });

  const [error, setError] = useState("");

  const manejarCambioAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("audio/")) {
      setError("Por favor selecciona un archivo de audio válido");
      return;
    }

    // Validar tamaño
    if (file.size > LIMITES_ARCHIVO.AUDIO_MAX_MB * 1024 * 1024) {
      setError(
        `El archivo de audio no debe superar los ${LIMITES_ARCHIVO.AUDIO_MAX_MB}MB`
      );
      return;
    }

    setError("");

    // Crear preview y obtener duración
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);

    audio.addEventListener("loadedmetadata", () => {
      setArchivos((prev) => ({
        ...prev,
        audioFile: file,
        audioPreview: url,
        duracionSegundos: Math.floor(audio.duration),
      }));
    });
  };

  const manejarCambioPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño
    if (file.size > LIMITES_ARCHIVO.PORTADA_MAX_MB * 1024 * 1024) {
      setError(
        `La portada no debe superar los ${LIMITES_ARCHIVO.PORTADA_MAX_MB}MB`
      );
      return;
    }

    setError("");

    // Crear preview
    const url = URL.createObjectURL(file);
    setArchivos((prev) => ({
      ...prev,
      portadaFile: file,
      portadaPreview: url,
    }));
  };

  return {
    archivos,
    error,
    setError,
    manejarCambioAudio,
    manejarCambioPortada,
  };
};
