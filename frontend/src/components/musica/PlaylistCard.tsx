import { Play } from "lucide-react";
import type { Playlist, Usuario } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

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
  const { user } = useAuth();

  const getCreatorName = () => {
    if (!playlist.creador) return "Desconocido";

    if (typeof playlist.creador === "string") {
      return "Usuario";
    }

    const creador = playlist.creador as Usuario;

    // Si el usuario actual es el creador, mostrar "Tú"
    if (user && creador._id === user._id) {
      return "Tú";
    }

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
            <img
              src="/cover.jpg"
              alt={playlist.titulo}
              className="w-full h-full object-cover opacity-50"
            />
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
      <p className="text-xs text-neutral-400 truncate">
        Por {getCreatorName()}
      </p>
    </div>
  );
}
