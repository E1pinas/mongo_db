import { useState, useEffect } from "react";
import { Reporte } from "../tipos";
import { servicioAdmin } from "../servicios";

export const useReportes = (filtro: string = "pendiente") => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReportes = async () => {
    try {
      setCargando(true);
      const data = await servicioAdmin.obtenerReportes(filtro);
      setReportes(data.reportes || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [filtro]);

  const resolverReporte = async (
    reporteId: string,
    accion: string,
    comentarioResolucion: string
  ) => {
    try {
      await servicioAdmin.resolverReporte(
        reporteId,
        accion,
        comentarioResolucion
      );
      await cargarReportes();
      return { success: true };
    } catch (err) {
      console.error("Error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  const cambiarEstado = async (reporteId: string, estado: string) => {
    try {
      await servicioAdmin.cambiarEstadoReporte(reporteId, estado);
      await cargarReportes();
      return { success: true };
    } catch (err) {
      console.error("Error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  return {
    reportes,
    cargando,
    error,
    recargar: cargarReportes,
    resolverReporte,
    cambiarEstado,
  };
};
