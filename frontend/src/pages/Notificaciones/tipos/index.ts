export type TipoFiltro = "todas" | "musica" | "social" | "sistema";

export interface EstadoModales {
  mostrarPostModal: boolean;
  mostrarCommentModal: boolean;
  mostrarSongCommentModal: boolean;
}

export interface DatosModales {
  postIdSeleccionado: string | null;
  comentarioIdSeleccionado: string | null;
  cancionIdSeleccionada: string | null;
  highlightCommentId?: string;
  autoOpenComments: boolean;
}
