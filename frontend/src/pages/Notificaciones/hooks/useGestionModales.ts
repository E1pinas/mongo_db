import { useState } from "react";
import type { EstadoModales, DatosModales } from "../tipos";

export const useGestionModales = () => {
  const [estadoModales, setEstadoModales] = useState<EstadoModales>({
    mostrarPostModal: false,
    mostrarCommentModal: false,
    mostrarSongCommentModal: false,
  });

  const [datosModales, setDatosModales] = useState<DatosModales>({
    postIdSeleccionado: null,
    comentarioIdSeleccionado: null,
    cancionIdSeleccionada: null,
    highlightCommentId: undefined,
    autoOpenComments: false,
  });

  const abrirModalPost = (
    postId: string,
    opciones?: {
      highlightCommentId?: string;
      autoOpenComments?: boolean;
    }
  ) => {
    setDatosModales({
      postIdSeleccionado: postId,
      comentarioIdSeleccionado: null,
      cancionIdSeleccionada: null,
      highlightCommentId: opciones?.highlightCommentId,
      autoOpenComments: opciones?.autoOpenComments || false,
    });
    setEstadoModales((prev) => ({ ...prev, mostrarPostModal: true }));
  };

  const abrirModalComentario = (postId: string, comentarioId: string) => {
    setDatosModales({
      postIdSeleccionado: postId,
      comentarioIdSeleccionado: comentarioId,
      cancionIdSeleccionada: null,
      highlightCommentId: undefined,
      autoOpenComments: false,
    });
    setEstadoModales((prev) => ({ ...prev, mostrarCommentModal: true }));
  };

  const abrirModalCancionComentario = (
    cancionId: string,
    comentarioId: string
  ) => {
    setDatosModales({
      postIdSeleccionado: null,
      comentarioIdSeleccionado: comentarioId,
      cancionIdSeleccionada: cancionId,
      highlightCommentId: undefined,
      autoOpenComments: false,
    });
    setEstadoModales((prev) => ({ ...prev, mostrarSongCommentModal: true }));
  };

  const cerrarModalPost = () => {
    setEstadoModales((prev) => ({ ...prev, mostrarPostModal: false }));
    setDatosModales((prev) => ({
      ...prev,
      postIdSeleccionado: null,
      highlightCommentId: undefined,
      autoOpenComments: false,
    }));
  };

  const cerrarModalComentario = () => {
    setEstadoModales((prev) => ({ ...prev, mostrarCommentModal: false }));
    setDatosModales((prev) => ({
      ...prev,
      postIdSeleccionado: null,
      comentarioIdSeleccionado: null,
    }));
  };

  const cerrarModalCancionComentario = () => {
    setEstadoModales((prev) => ({
      ...prev,
      mostrarSongCommentModal: false,
    }));
    setDatosModales((prev) => ({
      ...prev,
      cancionIdSeleccionada: null,
      comentarioIdSeleccionado: null,
    }));
  };

  return {
    estadoModales,
    datosModales,
    abrirModalPost,
    abrirModalComentario,
    abrirModalCancionComentario,
    cerrarModalPost,
    cerrarModalComentario,
    cerrarModalCancionComentario,
  };
};
