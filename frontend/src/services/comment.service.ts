import api from "./api";

export interface Comentario {
  _id: string;
  autor: {
    _id: string;
    nick: string;
    nombre?: string;
    nombreArtistico?: string;
    avatarUrl?: string;
  };
  texto: string;
  likes: string[];
  respuestas: Array<{
    _id: string;
    autor: {
      _id: string;
      nick: string;
      nombreArtistico?: string;
      avatarUrl?: string;
    };
    texto: string;
    createdAt: string;
    estaEditado: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  estaEditado?: boolean;
}

export interface ComentariosResponse {
  ok: boolean;
  comentarios: Comentario[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

class CommentService {
  // Obtener comentarios de una canción
  async getCancionComments(
    cancionId: string,
    pagina = 1,
    limite = 20
  ): Promise<ComentariosResponse> {
    const response = await api.get(
      `/comentarios/cancion/${cancionId}?pagina=${pagina}&limite=${limite}`
    );
    return response.data;
  }

  // Crear comentario en una canción
  async createCancionComment(
    cancionId: string,
    texto: string
  ): Promise<Comentario> {
    const response = await api.post("/comentarios/cancion", {
      cancionDestino: cancionId,
      texto,
    });
    return response.data.comentario;
  }

  // Responder a un comentario
  async replyToComment(
    comentarioId: string,
    texto: string
  ): Promise<Comentario> {
    const response = await api.post(`/comentarios/${comentarioId}/responder`, {
      texto,
    });
    return response.data.comentario;
  }

  // Dar/quitar like a un comentario
  async toggleLike(comentarioId: string): Promise<{ likes: string[] }> {
    const response = await api.post(`/comentarios/${comentarioId}/like`);
    return response.data;
  }

  // Eliminar comentario
  async deleteComment(comentarioId: string): Promise<void> {
    await api.delete(`/comentarios/${comentarioId}`);
  }

  // Editar comentario
  async editComment(comentarioId: string, texto: string): Promise<Comentario> {
    const response = await api.put(`/comentarios/${comentarioId}`, { texto });
    return response.data.comentario;
  }
}

export const commentService = new CommentService();
