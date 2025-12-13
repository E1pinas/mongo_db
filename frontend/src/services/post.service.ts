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
      post: Post;
      message: string;
    }>("/posts", data);
    return response.data.post;
  },

  /**
   * Obtener posts de un usuario
   */
  async obtenerPostsUsuario(usuarioId: string, limit = 50, offset = 0) {
    const response = await api.get<{ success: boolean; posts: Post[] }>(
      `/posts/usuario/${usuarioId}`,
      {
        params: { limit, offset },
      }
    );
    return response.data.posts;
  },

  /**
   * Obtener feed de posts (usuarios seguidos)
   */
  async obtenerFeed(limit = 50, offset = 0) {
    const response = await api.get<{ success: boolean; posts: Post[] }>(
      "/posts/feed",
      {
        params: { limit, offset },
      }
    );
    return response.data.posts;
  },

  /**
   * Obtener un post específico
   */
  async obtenerPost(postId: string) {
    const response = await api.get<{ success: boolean; post: Post }>(
      `/posts/${postId}`
    );
    return response.data;
  },

  /**
   * Alias de obtenerPost para mayor claridad
   */
  async obtenerPostPorId(postId: string) {
    return this.obtenerPost(postId);
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
      comentario: PostComentario;
      message: string;
    }>(`/posts/${postId}/comentarios`, { contenido });
    return response.data.comentario;
  },

  /**
   * Obtener comentarios de un post
   */
  async obtenerComentarios(postId: string, limit = 50, offset = 0) {
    const response = await api.get<{
      success: boolean;
      comentarios: PostComentario[];
    }>(`/posts/${postId}/comentarios`, {
      params: { limit, offset },
    });
    return response.data.comentarios;
  },

  /**
   * Responder a un comentario
   */
  async responderComentario(
    postId: string,
    comentarioId: string,
    contenido: string
  ) {
    const response = await api.post<{
      success: boolean;
      data: any;
      message: string;
    }>(`/posts/${postId}/comentarios/${comentarioId}/responder`, { contenido });
    return response.data;
  },

  /**
   * Dar/quitar like a un comentario
   */
  async toggleLikeComentario(postId: string, comentarioId: string) {
    const response = await api.post<{
      success: boolean;
      data: { liked: boolean; totalLikes: number };
    }>(`/posts/${postId}/comentarios/${comentarioId}/like`);
    return response.data;
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
