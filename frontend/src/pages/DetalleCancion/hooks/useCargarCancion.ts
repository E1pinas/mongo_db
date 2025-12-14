import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";
import type { Cancion } from "../../../types";

export const useCargarCancion = (id: string | undefined) => {
  const [cancion, setCancion] = useState<Cancion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarCancion();
  }, [id]);

  const cargarCancion = async () => {
    if (!id) return;

    try {
      setCargando(true);
      setError("");
      const response = await musicService.getSongPublic(id);
      setCancion(response.cancion);
      setMensaje(response.mensaje || "");
    } catch (err: any) {
      console.error("Error cargando canción:", err);
      setError(err.message || "Error al cargar la canción");
    } finally {
      setCargando(false);
    }
  };

  return { cancion, cargando, error, mensaje };
};
