import api from "./api";
import type { Post, PostComentario } from "../types";

export const postService = {
  /**
   * Crear un nuevo post
   */
  async crearPost(data: {
    tipo: "texto" | "repost_cancion" | "repost_album" | "repost_playlist";
    contenido?: string;
    recursoId?: string;
  }) {
    const response = await api.post<{
      success: boolean;
      data: Post;
      message: string;
    }>("/posts", data);
    return response.data.data;
  },

  /**
   * Obtener posts de un usuario
   */
  async obtenerPostsUsuario(usuarioId: string, limit = 50, offset = 0) {
    const response = await api.get<{ success: boolean; data: Post[] }>(
      `/posts/usuario/${usuarioId}`,
      {
        params: { limit, offset },
      }
    );
    return response.data.data;
  },

  /**
   * Obtener feed de posts (usuarios seguidos)
   */
  async obtenerFeed(limit = 50, offset = 0) {
    const response = await api.get<{ success: boolean; data: Post[] }>(
      "/posts/feed",
      {
        params: { limit, offset },
      }
    );
    return response.data.data;
  },

  /**
   * Obtener un post específico
   */
  async obtenerPost(postId: string) {
    const response = await api.get<{ success: boolean; data: Post }>(
      `/posts/${postId}`
    );
    return response.data.data;
  },

  /**
   * Eliminar un post
   */
  async eliminarPost(postId: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/posts/${postId}`
    );
    return response.data;
  },

  /**
   * Dar/quitar like a un post
   */
  async toggleLike(postId: string) {
    const response = await api.post<{
      success: boolean;
      liked: boolean;
      message: string;
    }>(`/posts/${postId}/like`);
    return response.data;
  },

  /**
   * Agregar comentario a un post
   */
  async agregarComentario(postId: string, contenido: string) {
    const response = await api.post<{
      success: boolean;
      data: PostComentario;
      message: string;
    }>(`/posts/${postId}/comentarios`, { contenido });
    return response.data.data;
  },

  /**
   * Obtener comentarios de un post
   */
  async obtenerComentarios(postId: string, limit = 50, offset = 0) {
    const response = await api.get<{
      success: boolean;
      data: PostComentario[];
    }>(`/posts/${postId}/comentarios`, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  /**
   * Hacer repost
   */
  async crearRepost(postId: string, comentario?: string) {
    const response = await api.post<{
      success: boolean;
      data: any;
      message: string;
    }>(`/posts/${postId}/repost`, { comentario });
    return response.data;
  },

  /**
   * Eliminar repost
   */
  async eliminarRepost(postId: string) {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/posts/${postId}/repost`
    );
    return response.data;
  },
};
