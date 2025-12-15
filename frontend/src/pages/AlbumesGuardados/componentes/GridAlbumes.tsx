import { useNavigate } from "react-router-dom";
import { Disc } from "lucide-react";
import type { Album } from "../../../types";

interface GridAlbumesProps {
  albumes: Album[];
}

export function GridAlbumes({ albumes }: GridAlbumesProps) {
  const navigate = useNavigate();

  const obtenerNombresArtistas = (album: Album) => {
    if (!album.artistas || album.artistas.length === 0) return "Artista";

    if (typeof album.artistas[0] === "string") return "Artista";

    return album.artistas
      .map((a: any) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {albumes.map((album) => (
        <div
          key={album._id}
          onClick={() => navigate(`/album/${album._id}`)}
          className="group cursor-pointer"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-neutral-900">
            <img
              src={album.portadaUrl || "/cover.jpg"}
              alt={album.titulo}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
          <h3 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
            {album.titulo}
          </h3>
          <p className="text-sm text-neutral-400 truncate">
            {obtenerNombresArtistas(album)}
          </p>
        </div>
      ))}
    </div>
  );
}
