import { Heart, MessageCircle, Play } from "lucide-react";
import type { Cancion, Usuario } from "../../types";
import { formatTimeAgo } from "../../utils/dateFormat";
import { formatDuration } from "../../utils/formatHelpers";

interface SongListItemProps {
  song: Cancion;
  index: number;
  isLiked: boolean;
  onPlay: () => void;
  onToggleLike: (e: React.MouseEvent) => void;
  onOpenComments?: (e: React.MouseEvent) => void;
  showCommentButton?: boolean;
}

/**
 * SongListItem - Item de canción en lista
 * Componente reutilizable para mostrar canciones en listas
 */
export default function SongListItem({
  song,
  index,
  isLiked,
  onPlay,
  onToggleLike,
  onOpenComments,
  showCommentButton = true,
}: SongListItemProps) {
  const getArtistName = (artistas: string[] | Usuario[]) => {
    if (!artistas || artistas.length === 0) return "Artista desconocido";

    if (typeof artistas[0] === "string") {
      return "Artista";
    }

    const artistasPopulados = artistas as Usuario[];
    return artistasPopulados
      .map((a) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors group items-center cursor-pointer"
      onClick={onPlay}
    >
      {/* Número / Play button */}
      <div className="flex items-center justify-center w-8">
        <span className="text-neutral-400 text-sm group-hover:hidden">
          {index + 1}
        </span>
        <button className="hidden group-hover:flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
          <Play size={14} fill="currentColor" />
        </button>
      </div>

      {/* Portada y título */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-neutral-700 rounded shrink-0 overflow-hidden">
          <img
            src={song.portadaUrl || "/cover.jpg"}
            alt={song.titulo}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">
            {song.titulo}
            {song.esExplicita && (
              <span className="ml-2 text-xs bg-neutral-700 px-2 py-0.5 rounded">
                E
              </span>
            )}
          </p>
          <p className="text-xs text-neutral-400 truncate">
            {getArtistName(song.artistas)} • {formatTimeAgo(song.createdAt)}
          </p>
        </div>
      </div>

      {/* Duración y acciones */}
      <div className="flex items-center gap-4">
        {showCommentButton && onOpenComments && (
          <button
            onClick={onOpenComments}
            className="p-2 hover:scale-110 transition-transform text-neutral-400 opacity-0 group-hover:opacity-100"
            title="Ver comentarios"
          >
            <MessageCircle size={16} />
          </button>
        )}
        <button
          onClick={onToggleLike}
          className={`p-2 hover:scale-110 transition-transform ${
            isLiked
              ? "text-green-500"
              : "text-neutral-400 opacity-0 group-hover:opacity-100"
          }`}
          title={isLiked ? "Quitar de Me gusta" : "Me gusta"}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
        </button>
        <span className="text-sm text-neutral-400">
          {formatDuration(song.duracionSegundos)}
        </span>
      </div>
    </div>
  );
}
