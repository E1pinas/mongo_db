import api from "./api";

/**
 * Servicio para gestión de bloqueos de usuarios
 */
class BloqueoService {
  async bloquearUsuario(usuarioId: string, razon?: string) {
    const response = await api.post(`/bloqueos/${usuarioId}/bloquear`, {
      razon: razon || "",
    });
    return response.data;
  }

  async desbloquearUsuario(usuarioId: string) {
    const response = await api.delete(`/bloqueos/${usuarioId}/desbloquear`);
    return response.data;
  }

  async verificarBloqueo(usuarioId: string) {
    const response = await api.get(`/bloqueos/${usuarioId}/verificar`);
    return response.data;
  }

  async obtenerBloqueados() {
    const response = await api.get("/bloqueos/mis-bloqueados");
    return response.data;
  }
}

export const bloqueoService = new BloqueoService();
