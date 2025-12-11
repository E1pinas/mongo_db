import api, { handleApiError } from "./api";

export const followerService = {
  // Seguir a un usuario
  async followUser(usuarioId: string): Promise<void> {
    try {
      await api.post(`/seguidores/seguir/${usuarioId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Dejar de seguir a un usuario
  async unfollowUser(usuarioId: string): Promise<void> {
    try {
      await api.delete(`/seguidores/seguir/${usuarioId}`);
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Verificar si estoy siguiendo a un usuario
  async checkIfFollowing(usuarioId: string): Promise<boolean> {
    try {
      const response = await api.get<any>(`/seguidores/verificar/${usuarioId}`);
      return response.data.siguiendo || false;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener seguidores de un usuario
  async getFollowers(usuarioId: string): Promise<any[]> {
    try {
      const response = await api.get<any>(
        `/seguidores/seguidores/${usuarioId}`
      );
      return response.data.seguidores || [];
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener usuarios que sigue un usuario
  async getFollowing(usuarioId: string): Promise<any[]> {
    try {
      const response = await api.get<any>(`/seguidores/seguidos/${usuarioId}`);
      return response.data.siguiendo || [];
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener usuarios sugeridos para seguir
  async getSuggestedUsers(): Promise<any[]> {
    try {
      const response = await api.get<any>("/seguidores/sugeridos");
      return response.data.usuarios || [];
    } catch (error: any) {
      console.error("Error getting suggested users:", error);
      return [];
    }
  },
};
