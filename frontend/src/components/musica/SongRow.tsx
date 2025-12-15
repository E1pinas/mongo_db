import { useState, useEffect } from "react";
import {
  Play,
  Heart,
  MessageCircle,
  Flag,
  Edit2,
  Trash2,
  X as XIcon,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Cancion } from "../../types";
import { musicService } from "../../services/music.service";
import { useAuth } from "../../contexts";
import { ReportModal } from "../common/ReportModal";
import { formatDuration } from "../../utils/formatHelpers";

interface SongRowProps {
  cancion: Cancion;
  index: number;
  isCurrentSong: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onOpenComments?: () => void;
  onLikeChange?: (liked: boolean) => void;
  hideComments?: boolean;
  // Opciones para creador
  showCreatorActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  // Opciones para quitar de playlist/álbum
  showRemoveFromCollection?: boolean;
  onRemoveFromCollection?: () => void;
}

export default function SongRow({
  cancion,
  index,
  isCurrentSong,
  isPlaying,
  onPlay,
  onOpenComments,
  onLikeChange,
  hideComments = false,
  showCreatorActions = false,
  onEdit,
  onDelete,
  showRemoveFromCollection = false,
  onRemoveFromCollection,
}: SongRowProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [showRemoveLikeModal, setShowRemoveLikeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOwnSongModal, setShowOwnSongModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Verificar si el usuario es propietario de la canción
  const isOwnSong = cancion.artistas?.some((artista) =>
    typeof artista === "string"
      ? artista === user?._id
      : artista._id === user?._id
  );

  // Sincronizar el estado de like con la canción
  useEffect(() => {
    if (user && cancion.likes) {
      const liked = cancion.likes.includes(user._id);
      setIsLiked(liked);
    } else {
      setIsLiked(false);
    }
  }, [cancion, cancion.likes, user]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Si ya le gusta, mostrar modal de confirmación
    if (isLiked) {
      setShowRemoveLikeModal(true);
      return;
    }

    // Si no le gusta, agregarlo directamente
    try {
      // Actualizar inmediatamente el estado local
      setIsLiked(true);

      await musicService.toggleLikeCancion(cancion._id);

      // Verificar si es canción propia
      if (user) {
        const esCancionPropia = cancion.artistas?.some((artista) =>
          typeof artista === "string"
            ? artista === user._id
            : artista._id === user._id
        );

        // Si es canción propia, mostrar modal informativo
        if (esCancionPropia) {
          setShowOwnSongModal(true);
        }
      }

      // Actualizar el array de likes inmediatamente
      if (user) {
        if (!cancion.likes) {
          cancion.likes = [user._id];
        } else if (!cancion.likes.includes(user._id)) {
          cancion.likes.push(user._id);
        }
      }

      // Notificar al padre para recargar datos (en segundo plano)
      onLikeChange?.(true);
    } catch (error) {
      console.error("Error al dar like:", error);
      // Revertir el cambio si falla
      setIsLiked(false);
    }
  };

  const confirmRemoveLike = async () => {
    try {
      // Actualizar inmediatamente el estado local
      setIsLiked(false);
      setShowRemoveLikeModal(false);

      await musicService.toggleLikeCancion(cancion._id);

      // Actualizar el array de likes inmediatamente
      if (user && cancion.likes) {
        cancion.likes = cancion.likes.filter((id) => id !== user._id);
      }

      // Notificar al padre para recargar datos (en segundo plano)
      onLikeChange?.(false);
    } catch (error) {
      console.error("Error al quitar like:", error);
      // Revertir el cambio si falla
      setIsLiked(true);
      setShowRemoveLikeModal(false);
    }
  };

  const handleShareSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/cancion/${cancion._id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShowCopyModal(true);
        setTimeout(() => setShowCopyModal(false), 2000);
      })
      .catch((err) => {
        console.error("Error al copiar URL:", err);
        setMensajeError("Error al copiar la URL");
      });
  };

  const getArtistNames = () => {
    if (!cancion.artistas || cancion.artistas.length === 0) return "Artista";
    return cancion.artistas
      .map((a: any) =>
        typeof a === "string" ? a : a.nombreArtistico || a.nick || a.nombre
      )
      .join(", ");
  };

  return (
    <>
      <div
        className="group flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
        onClick={onPlay}
      >
        {/* Número / Play / Music icon */}
        <div className="w-8 text-center flex items-center justify-center">
          {isCurrentSong && isPlaying ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-orange-500"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          ) : (
            <>
              <span className="group-hover:hidden text-neutral-400 text-sm">
                {index + 1}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
                className="hidden group-hover:block text-white"
              >
                <Play size={16} fill="currentColor" />
              </button>
            </>
          )}
        </div>

        {/* Portada y título */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-neutral-800 rounded overflow-hidden shrink-0">
            <img
              src={cancion.portadaUrl || "/cover.jpg"}
              alt={cancion.titulo}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p
              className={`font-medium truncate ${
                isCurrentSong ? "text-orange-500" : ""
              }`}
            >
              {cancion.titulo}
              {cancion.esExplicita && (
                <span className="ml-2 text-xs font-bold text-red-500 bg-red-500/20 px-1.5 py-0.5 rounded">
                  E
                </span>
              )}
            </p>
            <p className="text-sm text-neutral-400 truncate">
              {getArtistNames()}
            </p>
          </div>
        </div>

        {/* Duración */}
        <div className="text-sm text-neutral-400 w-[60px] text-right shrink-0">
          {formatDuration(cancion.duracionSegundos)}
        </div>

        {/* Acciones - Siempre visibles */}
        <div className="flex items-center gap-2 shrink-0">
          {showCreatorActions && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 hover:bg-blue-500/20 rounded-full transition-colors text-blue-400 hover:text-blue-300"
              title="Editar canción"
            >
              <Edit2 size={16} />
            </button>
          )}

          {showCreatorActions && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-red-400 hover:text-red-300"
              title="Eliminar canción"
            >
              <Trash2 size={16} />
            </button>
          )}

          {showRemoveFromCollection && onRemoveFromCollection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromCollection();
              }}
              className="p-2 hover:bg-orange-500/20 rounded-full transition-colors text-orange-400 hover:text-orange-300"
              title="Quitar de esta colección"
            >
              <XIcon size={16} />
            </button>
          )}

          {!hideComments && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments?.();
              }}
              className="p-2 hover:bg-neutral-700 rounded-full transition-colors text-neutral-400 hover:text-white"
              title="Ver comentarios"
            >
              <MessageCircle size={16} />
            </button>
          )}

          <button
            onClick={handleShareSong}
            className="p-2 hover:bg-neutral-700 rounded-full transition-colors text-neutral-400 hover:text-blue-400"
            title="Compartir canción"
          >
            <Share2 size={16} />
          </button>

          <button
            onClick={handleToggleLike}
            className={`p-2 hover:bg-neutral-700 rounded-full transition-colors ${
              isLiked ? "text-orange-500" : "text-neutral-400 hover:text-white"
            }`}
            title={isLiked ? "Quitar de me gusta" : "Me gusta"}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>

          {/* Botón reportar - Solo mostrar si NO es canción propia y NO son acciones de creador */}
          {!showCreatorActions && !isOwnSong && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReportModal(true);
              }}
              className="p-2 hover:bg-neutral-700 rounded-full transition-colors text-neutral-400 hover:text-red-500"
              title="Reportar canción"
            >
              <Flag size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación para quitar like */}
      {showRemoveLikeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-800 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              ¿Eliminar de canciones que te gustan?
            </h3>
            <p className="text-neutral-400 mb-6">
              Esta canción se eliminará de tu colección de canciones que te
              gustan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRemoveLikeModal(false)}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-full font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemoveLike}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-full font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal informativo para canciones propias */}
      {showOwnSongModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-orange-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Heart
                  size={24}
                  className="text-orange-500"
                  fill="currentColor"
                />
              </div>
              <h3 className="text-xl font-bold">Esta es tu canción</h3>
            </div>
            <p className="text-neutral-300 mb-6">
              Tus propias canciones no se agregan a "Canciones que me gustan".
              Puedes escucharlas desde tu perfil en la sección "Mis Canciones".
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOwnSongModal(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors font-medium"
              >
                Entendido
              </button>
              <button
                onClick={() => {
                  setShowOwnSongModal(false);
                  navigate(`/perfil/${user?.nick}`);
                }}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-medium"
              >
                Ir a mi perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reportar */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        tipoContenido="cancion"
        contenidoId={cancion._id}
        nombreContenido={cancion.titulo}
      />

      {/* Modal de URL copiada */}
      {showCopyModal && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <Share2 size={20} />
            <span className="font-semibold">¡URL copiada al portapapeles!</span>
          </div>
        </div>
      )}
    </>
  );
}
