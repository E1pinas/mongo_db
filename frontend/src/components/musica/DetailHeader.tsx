import {
  Play,
  Heart,
  MoreHorizontal,
  Clock,
  Music,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../common";

interface DetailHeaderProps {
  type: "album" | "playlist";
  imageUrl?: string;
  title: string;
  subtitle: string;
  year?: number | string;
  totalSongs?: number;
  totalDuration?: string;
  isPlaying?: boolean;
  isLiked?: boolean;
  isFollowing?: boolean;
  onPlayAll: () => void;
  onToggleLike?: () => void;
  onToggleFollow?: () => void;
  onBack?: () => void;
}

/**
 * DetailHeader - Componente para el header de álbumes y playlists
 *
 * Muestra portada, título, información y botones de acción
 */
export default function DetailHeader({
  type,
  imageUrl,
  title,
  subtitle,
  year,
  totalSongs,
  totalDuration,
  isPlaying = false,
  isLiked = false,
  isFollowing = false,
  onPlayAll,
  onToggleLike,
  onToggleFollow,
  onBack,
}: DetailHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 p-8">
      {/* Botón de volver */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      )}

      <div className="flex gap-6">
        {/* Portada */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-56 h-56 object-cover rounded-lg shadow-2xl"
            />
          ) : (
            <div className="w-56 h-56 bg-neutral-700 rounded-lg shadow-2xl flex items-center justify-center">
              <Music size={64} className="text-neutral-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-end flex-grow">
          <p className="text-sm font-medium mb-2 uppercase text-neutral-400">
            {type === "album" ? "Álbum" : "Playlist"}
          </p>
          <h1 className="text-6xl font-bold mb-4 text-white break-words">
            {title}
          </h1>
          <div className="flex items-center gap-2 text-neutral-300 text-sm">
            <span className="font-medium">{subtitle}</span>
            {year && (
              <>
                <span>•</span>
                <span>{year}</span>
              </>
            )}
            {totalSongs !== undefined && (
              <>
                <span>•</span>
                <span>
                  {totalSongs} {totalSongs === 1 ? "canción" : "canciones"}
                </span>
              </>
            )}
            {totalDuration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {totalDuration}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-4 mt-8">
        <Button onClick={onPlayAll} size="lg" className="rounded-full px-8">
          <Play size={20} fill="currentColor" />
          {isPlaying ? "Reproduciendo" : "Reproducir"}
        </Button>

        {onToggleLike && (
          <button
            onClick={onToggleLike}
            className={`p-3 rounded-full transition ${
              isLiked
                ? "text-green-500 hover:text-green-400"
                : "text-neutral-400 hover:text-white"
            }`}
            title={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
          </button>
        )}

        {onToggleFollow && (
          <Button
            onClick={onToggleFollow}
            variant={isFollowing ? "secondary" : "ghost"}
          >
            {isFollowing ? "Siguiendo" : "Seguir"}
          </Button>
        )}

        <button className="p-3 rounded-full text-neutral-400 hover:text-white transition">
          <MoreHorizontal size={28} />
        </button>
      </div>
    </div>
  );
}
