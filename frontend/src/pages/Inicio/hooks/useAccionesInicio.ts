import { useState } from "react";
import { musicService } from "../../../services/music.service";
import { followerService } from "../../../services/follower.service";
import { useAuth } from "../../../contexts";
import type { Cancion, Usuario } from "../../../types";

interface UseAccionesInicioParams {
  misCanciones: Cancion[];
  setMisCanciones: (canciones: Cancion[]) => void;
  setUsuariosSugeridos: (fn: (prev: Usuario[]) => Usuario[]) => void;
}

export const useAccionesInicio = ({
  misCanciones,
  setMisCanciones,
  setUsuariosSugeridos,
}: UseAccionesInicioParams) => {
  const { user } = useAuth();
  const [comentariosCancion, setComentariosCancion] = useState<Cancion | null>(
    null
  );
  const [mensajeError, setMensajeError] = useState("");

  const limpiarError = () => setMensajeError("");

  const handleToggleLike = async (cancionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await musicService.toggleLike(cancionId);
      setMisCanciones(
        misCanciones.map((song) => {
          if (song._id === cancionId) {
            return {
              ...song,
              likes: result.liked
                ? [...song.likes, user?._id || ""]
                : song.likes.filter((id) => id !== user?._id),
            };
          }
          return song;
        })
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await followerService.followUser(userId);
      setUsuariosSugeridos((prev: Usuario[]) =>
        prev.filter((u) => u._id !== userId)
      );
    } catch (err: any) {
      console.error("Error following user:", err);
      setMensajeError("Error al seguir usuario");
    }
  };

  return {
    comentariosCancion,
    setComentariosCancion,
    handleToggleLike,
    handleFollowUser,
    mensajeError,
    limpiarError,
  };
};
