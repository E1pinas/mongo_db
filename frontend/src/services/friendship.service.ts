import api, { handleApiError } from "./api";
import type { Usuario } from "../types";

export interface SolicitudAmistad {
  _id: string;
  solicitante: Usuario;
  receptor: Usuario | string;
  estado: "pendiente" | "aceptada" | "rechazada" | "bloqueada";
  createdAt: string;
  updatedAt: string;
}

export const friendshipService = {
  // Enviar solicitud de amistad
  async sendFriendRequest(usuarioId: string): Promise<void> {
    try {
      const url = `/amistad/solicitud/${usuarioId}`;
      console.log("📨 Servicio: Enviando solicitud a ID:", usuarioId);
      console.log("📨 Servicio: Tipo de usuarioId:", typeof usuarioId);
      console.log("📨 Servicio: Longitud del ID:", usuarioId?.length);
      console.log("📨 Servicio: URL construida:", url);
      const response = await api.post(url);
      console.log("✅ Respuesta del servidor:", response.data);
    } catch (error: any) {
      console.error("❌ Error completo:", error);
      console.error("❌ Error response:", error.response);
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Aceptar solicitud de amistad
  async acceptFriendRequest(solicitudId: string): Promise<void> {
    try {
      await api.post(`/amistad/aceptar/${solicitudId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Rechazar solicitud de amistad
  async rejectFriendRequest(solicitudId: string): Promise<void> {
    try {
      await api.post(`/amistad/rechazar/${solicitudId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Cancelar solicitud enviada
  async cancelFriendRequest(usuarioId: string): Promise<void> {
    try {
      await api.delete(`/amistad/cancelar/${usuarioId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Bloquear usuario desde perfil
  async blockUser(usuarioId: string): Promise<void> {
    try {
      await api.post(`/amistad/bloquear/${usuarioId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Bloquear usuario desde solicitud pendiente
  async blockFromRequest(solicitudId: string): Promise<void> {
    try {
      await api.post(`/amistad/bloquear-solicitud/${solicitudId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Desbloquear usuario
  async unblockUser(usuarioId: string): Promise<void> {
    try {
      await api.delete(`/amistad/desbloquear/${usuarioId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener lista de usuarios bloqueados
  async getBlockedUsers(): Promise<Usuario[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        bloqueados: Usuario[];
      }>("/amistad/bloqueados");
      return response.data.bloqueados || [];
    } catch (error: any) {
      const errorData = handleApiError(error);
      console.error("Error fetching blocked users:", errorData);
      return [];
    }
  },

  // Eliminar amistad
  async removeFriend(usuarioId: string): Promise<void> {
    try {
      await api.delete(`/amistad/amigo/${usuarioId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener solicitudes pendientes
  async getPendingRequests(): Promise<SolicitudAmistad[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        solicitudes: SolicitudAmistad[];
      }>("/amistad/solicitudes");
      return response.data.solicitudes || [];
    } catch (error: any) {
      const errorData = handleApiError(error);
      console.error("Error fetching pending requests:", errorData);
      return [];
    }
  },

  // Obtener lista de amigos
  async getFriends(): Promise<Usuario[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        amigos: Usuario[];
      }>("/amistad/amigos");
      return response.data.amigos || [];
    } catch (error: any) {
      const errorData = handleApiError(error);
      console.error("Error fetching friends:", errorData);
      return [];
    }
  },

  // Verificar el estado de relación con un usuario
  async getRelationshipStatus(usuarioId: string): Promise<{
    estado:
      | "ninguno"
      | "pendiente_enviada"
      | "pendiente_recibida"
      | "amigos"
      | "bloqueado";
    solicitudId?: string;
    aceptaSolicitudes?: boolean;
  }> {
    try {
      const response = await api.get(`/amistad/estado/${usuarioId}`);
      return {
        estado: response.data.estado,
        solicitudId: response.data.solicitudId,
        aceptaSolicitudes: response.data.aceptaSolicitudes,
      };
    } catch (error) {
      console.error("Error checking relationship status:", error);
      return { estado: "ninguno", aceptaSolicitudes: true };
    }
  },
};
