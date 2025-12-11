import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Disc } from "lucide-react";
import { musicService } from "../services/music.service";
import type { Album } from "../types";
import { LoadingSpinner, EmptyState, MediaGrid } from "../components/common";
import { AlbumCard } from "../components/musica";

export default function LikedAlbums() {
  const [albumes, setAlbumes] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLikedAlbums();
  }, []);

  const loadLikedAlbums = async () => {
    try {
      setLoading(true);
      const albums = await musicService.getLikedAlbums();
      setAlbumes(albums);
    } catch (error) {
      console.error("Error cargando álbumes guardados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAlbum = async (e: React.MouseEvent, albumId: string) => {
    e.stopPropagation();
    try {
      await musicService.toggleLikeAlbum(albumId);
      // Recargar la lista
      loadLikedAlbums();
    } catch (error) {
      console.error("Error eliminando álbum:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      {/* Header con diseño único */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 blur-3xl" />
        <div className="relative px-6 pt-8 pb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
              <Disc size={32} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-400 font-semibold mb-1">
                TU COLECCIÓN
              </p>
              <h1 className="text-5xl font-black bg-linear-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                Álbumes
              </h1>
            </div>
          </div>

          <div className="px-4 py-2 bg-neutral-800/50 backdrop-blur-sm rounded-full text-sm inline-block">
            <span className="text-neutral-400">Total:</span>
            <span className="ml-2 font-bold text-white">
              {albumes.length} {albumes.length === 1 ? "álbum" : "álbumes"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de álbumes */}
      <div className="px-6 pb-20">
        {albumes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Disc size={48} className="text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              No tienes álbumes guardados
            </h3>
            <p className="text-neutral-400">
              Guarda álbumes que te gusten para verlos aquí
            </p>
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
                  {album.portadaUrl ? (
                    <img
                      src={album.portadaUrl}
                      alt={album.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-500 to-red-600">
                      <Disc size={48} className="text-white" />
                    </div>
                  )}
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
                  {album.artistas && album.artistas.length > 0
                    ? typeof album.artistas[0] === "string"
                      ? "Artista"
                      : album.artistas
                          .map(
                            (a: any) => a.nombreArtistico || a.nick || a.nombre
                          )
                          .join(", ")
                    : "Artista"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
