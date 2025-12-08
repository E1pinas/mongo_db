import api from "./api";

export const reporteService = {
  /**
   * Crear un reporte
   */
  async crearReporte(data: {
    tipoContenido: "cancion" | "album" | "playlist" | "usuario" | "comentario";
    contenidoId: string;
    motivo: string;
    descripcion?: string;
  }) {
    const response = await api.post<{
      ok: boolean;
      mensaje: string;
      reporte: any;
    }>("/reportes", data);
    return response.data;
  },

  /**
   * Obtener mis reportes
   */
  async obtenerMisReportes(estado?: string) {
    const response = await api.get<{
      ok: boolean;
      reportes: any[];
    }>("/reportes/mis-reportes", {
      params: { estado },
    });
    return response.data;
  },
};
