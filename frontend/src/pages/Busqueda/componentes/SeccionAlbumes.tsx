import { Disc3, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Album, Usuario } from "../../../types";

interface SeccionAlbumesProps {
  albumes: Album[];
}

const obtenerNombreArtista = (artistas: string[] | Usuario[]) => {
  if (!artistas || artistas.length === 0) return "Artista desconocido";
  if (typeof artistas[0] === "string") return "Artista";
  const artistasPopulados = artistas as Usuario[];
  return artistasPopulados
    .map((a) => a.nombreArtistico || a.nick || a.nombre)
    .join(", ");
};

export const SeccionAlbumes = ({ albumes }: SeccionAlbumesProps) => {
  const navigate = useNavigate();

  if (albumes.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <Disc3 size={20} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold">Álbumes</h2>
        <span className="text-sm text-neutral-500">({albumes.length})</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {albumes.map((album) => (
          <div
            key={album._id}
            onClick={() => navigate(`/album/${album._id}`)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-neutral-900">
              {album.portadaUrl ? (
                <img
                  src={album.portadaUrl}
                  alt={album.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 size={48} className="text-neutral-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center shadow-lg">
                <Play size={20} fill="white" className="ml-0.5" />
              </div>
            </div>
            <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
              {album.titulo}
            </h3>
            <p className="text-sm text-neutral-400 truncate">
              {obtenerNombreArtista(album.artistas)} •{" "}
              {Array.isArray(album.canciones) ? album.canciones.length : 0}{" "}
              canciones
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
