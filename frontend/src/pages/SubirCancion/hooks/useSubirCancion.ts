import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { musicService } from "../../../services/music.service";
import type { DatosFormularioCancion, ArchivosSubida } from "../tipos";

interface UseSubirCancionParams {
  formData: DatosFormularioCancion;
  archivos: ArchivosSubida;
  setError: (error: string) => void;
}

export const useSubirCancion = ({
  formData,
  archivos,
  setError,
}: UseSubirCancionParams) => {
  const navigate = useNavigate();
  const [subiendo, setSubiendo] = useState(false);
  const [exitoso, setExitoso] = useState(false);

  const validarFormulario = (): boolean => {
    if (!formData.titulo.trim()) {
      setError("El título es obligatorio");
      return false;
    }

    if (!archivos.audioFile) {
      setError("Debes seleccionar un archivo de audio");
      return false;
    }

    if (archivos.duracionSegundos === 0) {
      setError("No se pudo obtener la duración del audio");
      return false;
    }

    return true;
  };

  const subirCancion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validarFormulario()) {
      return;
    }

    setSubiendo(true);

    try {
      await musicService.uploadCompleteSong({
        audio: archivos.audioFile!,
        portada: archivos.portadaFile || undefined,
        titulo: formData.titulo.trim(),
        duracionSegundos: archivos.duracionSegundos,
        generos: formData.generos.join(","),
        esPrivada: formData.esPrivada,
        esExplicita: formData.esExplicita,
      });

      setExitoso(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      console.error("Error al subir canción:", err);
      setError(err.message || "Error al subir la canción");
    } finally {
      setSubiendo(false);
    }
  };

  return {
    subiendo,
    exitoso,
    subirCancion,
  };
};
