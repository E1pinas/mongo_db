import api, { handleApiError } from "./api";
import type { ApiResponse } from "../types";

export const socialService = {
  // ============================================
  // SEGUIDORES
  // ============================================

  // Seguir usuario
  async followUser(userId: string): Promise<void> {
    try {
      await api.post(`/seguidores/seguir/${userId}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Dejar de seguir
  async unfollowUser(userId: string): Promise<void> {
    try {
      await api.delete(`/seguidores/dejar-seguir/${userId}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Verificar si sigo a un usuario
  async isFollowing(userId: string): Promise<boolean> {
    try {
      const response = await api.get<ApiResponse<{ siguiendo: boolean }>>(
        `/seguidores/siguiendo/${userId}`
      );
      return response.data.data?.siguiendo || false;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener seguidores
  async getFollowers(userId: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/seguidores/${userId}/seguidores`
      );
      return response.data.data || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener seguidos
  async getFollowing(userId: string): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/seguidores/${userId}/seguidos`
      );
      return response.data.data || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // ============================================
  // AMISTAD
  // ============================================

  // Enviar solicitud de amistad
  async sendFriendRequest(userId: string): Promise<void> {
    try {
      await api.post("/amistad/enviar", { destinatarioId: userId });
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Aceptar solicitud
  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      await api.patch(`/amistad/aceptar/${requestId}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Rechazar solicitud
  async rejectFriendRequest(requestId: string): Promise<void> {
    try {
      await api.patch(`/amistad/rechazar/${requestId}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener solicitudes pendientes
  async getPendingRequests(): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>("/amistad/pendientes");
      return response.data.data || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener lista de amigos
  async getFriends(): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>("/amistad/amigos");
      return response.data.data || [];
    } catch (error) {
      const errorData = handleApiError(error);
      // Retornar array vacío en lugar de lanzar error para evitar bloqueos
      console.error("Error fetching friends:", errorData);
      return [];
    }
  },

  // Eliminar amistad
  async removeFriend(friendshipId: string): Promise<void> {
    try {
      await api.delete(`/amistad/${friendshipId}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },
};
