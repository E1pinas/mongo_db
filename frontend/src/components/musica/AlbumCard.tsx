import { Play } from "lucide-react";
import type { Album, Usuario } from "../../types";

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
}

/**
 * AlbumCard - Tarjeta de álbum reutilizable
 */
export default function AlbumCard({ album, onClick, onPlay }: AlbumCardProps) {
  const getArtistName = () => {
    if (!album.artistas || album.artistas.length === 0)
      return "Artista desconocido";

    if (typeof album.artistas[0] === "string") {
      return "Artista";
    }

    const artistas = album.artistas as Usuario[];
    return artistas
      .map((a) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  const getYear = () => {
    if (!album.createdAt) return "";
    return new Date(album.createdAt).getFullYear();
  };

  return (
    <div
      className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative mb-4">
        <div className="aspect-square bg-neutral-700 rounded-lg overflow-hidden">
          {album.portadaUrl ? (
            <img
              src={album.portadaUrl}
              alt={album.titulo}
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
      <p className="font-semibold text-sm mb-2 truncate">{album.titulo}</p>
      <p className="text-xs text-neutral-400 line-clamp-2">
        {getArtistName()} • {getYear()}
      </p>
    </div>
  );
}
