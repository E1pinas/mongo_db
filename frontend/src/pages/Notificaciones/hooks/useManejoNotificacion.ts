import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../../contexts/PlayerContext";
import { musicService } from "../../../services/music.service";
import { albumService } from "../../../services/album.service";
import type { Notificacion } from "../../../types";

interface UseManejoNotificacionParams {
  markAsRead: (id: string) => Promise<void>;
  abrirModalPost: (
    postId: string,
    opciones?: { highlightCommentId?: string; autoOpenComments?: boolean }
  ) => void;
  abrirModalCancionComentario: (
    cancionId: string,
    comentarioId: string
  ) => void;
}

export const useManejoNotificacion = ({
  markAsRead,
  abrirModalPost,
  abrirModalCancionComentario,
}: UseManejoNotificacionParams) => {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [mensajeError, setMensajeError] = useState("");

  const limpiarError = () => setMensajeError("");

  const manejarClickNotificacion = async (notif: Notificacion) => {
    // Marcar como leída
    if (!notif.leida) {
      await markAsRead(notif._id);
    }

    // Notificaciones de usuario (seguidor, amistad)
    if (
      (notif.tipo === "nuevo_seguidor" ||
        notif.tipo === "solicitud_amistad" ||
        notif.tipo === "amistad_aceptada") &&
      notif.usuarioOrigen &&
      typeof notif.usuarioOrigen === "object"
    ) {
      navigate(`/perfil/${notif.usuarioOrigen.nick}`);
      return;
    }

    // Navegar según el tipo de recurso
    if (!notif.recurso) {
      // Si no hay recurso pero hay usuario origen, ir al perfil
      if (notif.usuarioOrigen && typeof notif.usuarioOrigen === "object") {
        navigate(`/perfil/${notif.usuarioOrigen.nick}`);
      }
      return;
    }

    switch (notif.recurso.tipo) {
      case "song":
      case "cancion":
        await manejarCancion(notif);
        break;

      case "album":
        await manejarAlbum(notif.recurso.id);
        break;

      case "playlist":
        await manejarPlaylist(notif.recurso.id);
        break;

      case "usuario":
        navigate(`/perfil/${notif.recurso.id}`);
        break;

      case "post":
        manejarPost(notif);
        break;

      case "comentario":
        manejarComentario(notif);
        break;
    }
  };

  const manejarCancion = async (notif: Notificacion) => {
    if (!notif.recurso) return;

    // Si es comentario en canción con comentarioId
    if (notif.recurso.comentarioId) {
      abrirModalCancionComentario(notif.recurso.id, notif.recurso.comentarioId);
      return;
    }

    // Cargar y reproducir la canción
    try {
      console.log("🎵 Intentando cargar canción con ID:", notif.recurso.id);
      const cancion = await musicService.getSongById(notif.recurso.id);
      console.log("✅ Canción cargada:", cancion);

      if (cancion.esSingle) {
        const contexto = {
          type: "album" as const,
          id: "single",
          name: `Single: ${cancion.titulo}`,
        };
        console.log("📁 Reproduciendo con contexto:", contexto);
        playQueue([cancion], 0, contexto);
      } else {
        console.log("📁 Reproduciendo sin contexto (tiene álbum)");
        playQueue([cancion], 0);
      }
    } catch (error: any) {
      console.error("❌ Error al cargar la canción:", error);
      setMensajeError(
        error.response?.status === 404
          ? "Esta canción ya no está disponible o fue eliminada"
          : "No se pudo cargar la canción. Intenta más tarde."
      );
    }
  };

  const manejarAlbum = async (albumId: string) => {
    try {
      const album = await albumService.getAlbumById(albumId);
      if (album && album.canciones && album.canciones.length > 0) {
        const canciones = (album.canciones as any[]).filter(
          (c: any) => typeof c !== "string"
        );
        if (canciones.length > 0) {
          playQueue(canciones, 0, {
            type: "album",
            id: album._id,
            name: album.titulo,
          });
        }
      }
    } catch (error: any) {
      console.error("Error al cargar el álbum:", error);
      setMensajeError(
        error.response?.status === 404
          ? "Este álbum fue retirado de la página"
          : "No se pudo cargar el álbum. Intenta más tarde."
      );
    }
  };

  const manejarPlaylist = async (playlistId: string) => {
    // Navegar directamente a la página de la playlist
    navigate(`/playlist/${playlistId}`);
  };

  const manejarPost = (notif: Notificacion) => {
    if (!notif.recurso) return;

    abrirModalPost(notif.recurso.id, {
      autoOpenComments:
        notif.tipo === "like_post" || notif.tipo === "repost" ? true : false,
    });
  };

  const manejarComentario = (notif: Notificacion) => {
    // Navegar al perfil donde está el comentario
    if (typeof notif.usuarioOrigen === "object" && notif.usuarioOrigen) {
      navigate(`/perfil/${notif.usuarioOrigen.nick}`);
    }
  };

  return {
    manejarClickNotificacion,
    mensajeError,
    limpiarError,
  };
};
