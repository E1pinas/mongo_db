import api from "./api";

/**
 * Servicio de presencia de usuarios
 */
class PresenceService {
  /**
   * Enviar heartbeat para mantener estado online
   */
  async heartbeat() {
    try {
      await api.post("/presence/heartbeat");
    } catch (error) {
      // Silenciar errores de heartbeat (usuario probablemente desconectado)
      console.debug("Heartbeat failed:", error.message);
    }
  }
}

export const presenceService = new PresenceService();
