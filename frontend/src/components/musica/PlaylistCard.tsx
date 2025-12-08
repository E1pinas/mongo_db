import { Play } from "lucide-react";
import type { Playlist, Usuario } from "../../types";

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
}

/**
 * PlaylistCard - Tarjeta de playlist reutilizable
 */
export default function PlaylistCard({
  playlist,
  onClick,
  onPlay,
}: PlaylistCardProps) {
  const getCreatorName = () => {
    if (!playlist.creador) return "Desconocido";

    if (typeof playlist.creador === "string") {
      return "Usuario";
    }

    const creador = playlist.creador as Usuario;
    return creador.nombreArtistico || creador.nick || creador.nombre;
  };

  return (
    <div
      className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative mb-4">
        <div className="aspect-square bg-neutral-700 rounded-lg overflow-hidden">
          {playlist.portadaUrl ? (
            <img
              src={playlist.portadaUrl}
              alt={playlist.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-neutral-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
          )}
        </div>
        {onPlay && (
          <button
            onClick={onPlay}
            className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-105"
          >
            <Play size={24} fill="currentColor" />
          </button>
        )}
      </div>
      <p className="font-semibold text-sm mb-2 truncate">{playlist.titulo}</p>
      <p className="text-xs text-neutral-400 line-clamp-2">
        {playlist.descripcion || `Por ${getCreatorName()}`}
      </p>
    </div>
  );
}
