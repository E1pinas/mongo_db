import { useState, useEffect } from "react";
import { Estadisticas } from "../tipos";

export const useEstadisticasAdmin = () => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3900/api/admin/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Error al cargar estadísticas");

      const data = await response.json();
      setEstadisticas(data.estadisticas);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return { estadisticas, cargando, error, recargar: cargarEstadisticas };
};
