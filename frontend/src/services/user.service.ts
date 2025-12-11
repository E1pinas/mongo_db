import api, { handleApiError } from "./api";
import type { Usuario, Comentario, ApiResponse } from "../types";

export const userService = {
  // Buscar usuarios por nick
  async searchUsers(query: string): Promise<Usuario[]> {
    try {
      const response = await api.get<{ ok: boolean; usuarios: Usuario[] }>(
        `/usuarios/buscar?q=${encodeURIComponent(query)}`
      );
      return response.data.usuarios || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener perfil público de usuario
  async getUserProfile(userId: string): Promise<Usuario> {
    try {
      const response = await api.get<{ ok: boolean; usuario: Usuario }>(
        `/perfil/${userId}`
      );
      return response.data.usuario;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Actualizar avatar
  async updateAvatar(file: File): Promise<Usuario> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.patch<ApiResponse<Usuario>>(
        "/usuarios/avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.data!;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Actualizar banner
  async updateBanner(file: File): Promise<Usuario> {
    try {
      const formData = new FormData();
      formData.append("banner", file);

      const response = await api.patch<ApiResponse<Usuario>>(
        "/usuarios/banner",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.data!;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Actualizar perfil
  async updateProfile(data: {
    nombre?: string;
    bio?: string;
  }): Promise<Usuario> {
    try {
      const response = await api.patch<ApiResponse<Usuario>>(
        "/usuarios/perfil",
        data
      );
      return response.data.data!;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // ============================================
  // COMENTARIOS
  // ============================================

  // Obtener comentarios del perfil
  async getProfileComments(userId: string): Promise<Comentario[]> {
    try {
      const response = await api.get<ApiResponse<Comentario[]>>(
        `/comentarios/perfil/${userId}`
      );
      return response.data.data || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Crear comentario
  async createComment(
    perfilDestino: string,
    contenido: string
  ): Promise<Comentario> {
    try {
      const response = await api.post<ApiResponse<Comentario>>("/comentarios", {
        perfilDestino,
        contenido,
      });
      return response.data.data!;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Responder comentario
  async replyComment(
    commentId: string,
    contenido: string
  ): Promise<Comentario> {
    try {
      const response = await api.post<ApiResponse<Comentario>>(
        `/comentarios/${commentId}/responder`,
        {
          contenido,
        }
      );
      return response.data.data!;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Toggle like en comentario
  async toggleLikeComment(commentId: string): Promise<Comentario> {
    try {
      const response = await api.post<ApiResponse<Comentario>>(
        `/comentarios/${commentId}/like`
      );
      return response.data.data!;
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar comentario
  async deleteComment(commentId: string): Promise<void> {
    try {
      await api.delete(`/comentarios/${commentId}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },
};
