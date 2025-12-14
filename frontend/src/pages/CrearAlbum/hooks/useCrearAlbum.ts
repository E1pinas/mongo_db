import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { albumService } from "../../../services/album.service";
import type { DatosAlbum, ArchivosAlbum } from "../tipos";

interface UseCrearAlbumParams {
  datos: DatosAlbum;
  archivos: ArchivosAlbum;
  selectedSongs: string[];
}

export const useCrearAlbum = ({
  datos,
  archivos,
  selectedSongs,
}: UseCrearAlbumParams) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subirPortada = async (): Promise<string> => {
    if (!archivos.portadaFile) return "";

    const formData = new FormData();
    formData.append("imagen", archivos.portadaFile);

    console.log("Uploading image:", {
      name: archivos.portadaFile.name,
      type: archivos.portadaFile.type,
      size: archivos.portadaFile.size,
    });

    const response = await fetch("http://localhost:3900/api/upload/imagen", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();
    console.log("Upload response:", data);

    if (!response.ok || !data.ok) {
      console.error("Error uploading image:", data);
      throw new Error(data.message || "Error al subir la imagen de portada");
    }

    if (!data.imagenUrl) {
      throw new Error("No se recibió la URL de la imagen");
    }

    return data.imagenUrl;
  };

  const manejarEnvio = async () => {
    setError("");

    if (!datos.titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Subir portada si existe
      let portadaUrl = "";
      if (archivos.portadaFile) {
        try {
          portadaUrl = await subirPortada();
          console.log("Image uploaded successfully:", portadaUrl);
        } catch (uploadError: any) {
          console.error("Error uploading image:", uploadError);
          setError(`Error al subir la imagen: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Crear álbum
      const album = await albumService.createAlbum({
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        generos: datos.generos,
        fechaLanzamiento: datos.fechaLanzamiento || undefined,
        esPrivado: datos.esPrivado,
        portadaUrl: portadaUrl || undefined,
      });

      if (!album) {
        throw new Error("Error al crear el álbum");
      }

      // 3. Agregar canciones seleccionadas
      if (selectedSongs.length > 0) {
        for (const songId of selectedSongs) {
          await albumService.addSongToAlbum(album._id, songId);
        }
      }

      navigate(`/album/${album._id}`);
    } catch (err: any) {
      console.error("Error creating album:", err);
      setError(err.message || "Error al crear el álbum");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    manejarEnvio,
  };
};
