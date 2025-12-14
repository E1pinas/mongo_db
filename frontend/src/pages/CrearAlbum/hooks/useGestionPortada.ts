import { useState } from "react";
import type { ArchivosAlbum } from "../tipos";

export const useGestionPortada = () => {
  const [archivos, setArchivos] = useState<ArchivosAlbum>({
    portadaFile: null,
    portadaPreview: "",
  });
  const [errorImagen, setErrorImagen] = useState("");

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorImagen("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorImagen("La imagen no puede superar los 5MB");
      return;
    }

    setArchivos({
      portadaFile: file,
      portadaPreview: URL.createObjectURL(file),
    });
    setErrorImagen("");
  };

  const eliminarPortada = () => {
    setArchivos({
      portadaFile: null,
      portadaPreview: "",
    });
  };

  return {
    archivos,
    errorImagen,
    handlePortadaChange,
    eliminarPortada,
  };
};
