import { User } from "lucide-react";
import type { Usuario } from "../../types";

interface ArtistCardProps {
  artist: Usuario;
  onClick?: () => void;
}

/**
 * ArtistCard - Tarjeta de artista reutilizable
 */
export default function ArtistCard({ artist, onClick }: ArtistCardProps) {
  return (
    <div
      className="group bg-neutral-800/40 hover:bg-neutral-800 p-4 rounded-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-4">
        <img
          src={
            artist.avatarUrl && artist.avatarUrl.trim() !== ""
              ? artist.avatarUrl
              : "/avatar.png"
          }
          alt={artist.nombreArtistico || artist.nombre}
          className="w-full aspect-square object-cover rounded-full shadow-lg"
          onError={(e) => {
            e.currentTarget.src = "/avatar.png";
          }}
        />
      </div>
      <h3 className="font-semibold text-white truncate mb-1 text-center">
        {artist.nombreArtistico || artist.nombre}
      </h3>
      <p className="text-sm text-neutral-400 truncate text-center">
        @{artist.nick}
      </p>
    </div>
  );
}
