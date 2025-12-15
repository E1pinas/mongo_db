import { useNavigate } from "react-router-dom";
import { Disc } from "lucide-react";
import type { Album } from "../../../types";

interface ListaAlbumesProps {
  titulo: string;
  albumes: Album[];
  cargando: boolean;
  mensajeSinAlbumes?: string;
}

export const ListaAlbumes = ({
  titulo,
  albumes,
  cargando,
  mensajeSinAlbumes = "No hay álbumes disponibles",
}: ListaAlbumesProps) => {
  const navigate = useNavigate();

  const obtenerNombresArtistas = (album: Album) => {
    if (!album.artistas || album.artistas.length === 0) return "Tú";

    if (typeof album.artistas[0] === "string") return "Tú";

    return album.artistas
      .map((a: any) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-linear-to-b from-orange-500 to-red-600 rounded-full" />
        <h2 className="text-3xl font-bold text-white">{titulo}</h2>
        {!cargando && albumes.length > 0 && (
          <span className="ml-2 px-3 py-1 text-sm font-semibold text-orange-400 bg-orange-500/10 rounded-full border border-orange-500/20">
            {albumes.length}
          </span>
        )}
      </div>
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-600/30 border-t-orange-600"></div>
            <Disc
              className="absolute inset-0 m-auto text-orange-500 animate-pulse"
              size={20}
            />
          </div>
        </div>
      ) : albumes.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-800/50 mb-4">
            <Disc size={40} className="text-neutral-600" />
          </div>
          <p className="text-neutral-400 text-lg">{mensajeSinAlbumes}</p>
        </div>
      ) : (
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
              <div className="space-y-1">
                <h3 className="font-bold text-white truncate group-hover:text-orange-500 transition-colors text-base">
                  {album.titulo}
                </h3>
                <p className="text-sm text-neutral-500 truncate font-medium">
                  {obtenerNombresArtistas(album)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
