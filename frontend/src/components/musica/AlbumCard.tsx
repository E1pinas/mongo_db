import { Play } from "lucide-react";
import type { Album, Usuario } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
}

/**
 * AlbumCard - Tarjeta de álbum reutilizable
 */
export default function AlbumCard({ album, onClick, onPlay }: AlbumCardProps) {
  const { user } = useAuth();

  const getArtistName = () => {
    if (!album.artistas || album.artistas.length === 0)
      return "Artista desconocido";

    if (typeof album.artistas[0] === "string") {
      return "Artista";
    }

    const artistas = album.artistas as Usuario[];

    // Si el usuario actual es uno de los artistas, mostrar "Tú"
    if (user && artistas.some((a) => a._id === user._id)) {
      if (artistas.length === 1) {
        return "Tú";
      }
      // Si hay múltiples artistas, reemplazar el nombre del usuario con "Tú"
      return artistas
        .map((a) =>
          a._id === user._id ? "Tú" : a.nombreArtistico || a.nick || a.nombre
        )
        .join(", ");
    }

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
            <img
              src="/cover.jpg"
              alt={album.titulo}
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
      <p className="font-semibold text-sm mb-2 truncate">{album.titulo}</p>
      <p className="text-xs text-neutral-400 line-clamp-2">
        {getArtistName()} • {getYear()}
      </p>
    </div>
  );
}
