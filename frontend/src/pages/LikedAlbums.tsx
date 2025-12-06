import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Disc, Play, Heart } from "lucide-react";
import { musicService } from "../services/music.service";
import type { Album, Usuario } from "../types";

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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 via-neutral-900 to-neutral-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-600/40 to-transparent p-8 pb-6">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-2xl">
            <Disc size={80} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">COLECCIÓN</p>
            <h1 className="text-6xl font-black mb-6">Álbumes que me gustan</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {albumes.length} {albumes.length === 1 ? "álbum" : "álbumes"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de álbumes */}
      <div className="px-8 py-6">
        {albumes.length === 0 ? (
          <div className="text-center py-16">
            <Disc size={64} className="mx-auto mb-4 text-neutral-600" />
            <h3 className="text-2xl font-bold mb-2">
              No tienes álbumes guardados
            </h3>
            <p className="text-neutral-400">
              Guarda álbumes que te gusten para verlos aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {albumes.map((album) => {
              const artistaNombre =
                typeof album.artistas?.[0] === "object"
                  ? (album.artistas[0] as Usuario).nombreArtistico ||
                    (album.artistas[0] as Usuario).nombre
                  : "";

              return (
                <div
                  key={album._id}
                  onClick={() => navigate(`/album/${album._id}`)}
                  className="group bg-neutral-800/40 hover:bg-neutral-800 p-4 rounded-lg transition-all cursor-pointer"
                >
                  <div className="relative mb-4">
                    <img
                      src={
                        album.portadaUrl && album.portadaUrl.trim() !== ""
                          ? album.portadaUrl
                          : "/cover.jpg"
                      }
                      alt={album.titulo}
                      className="w-full aspect-square object-cover rounded-md shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/cover.jpg";
                      }}
                    />
                    <button
                      onClick={(e) => handleRemoveAlbum(e, album._id)}
                      className="absolute top-2 right-2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Heart
                        size={20}
                        className="fill-orange-500 text-orange-500"
                      />
                    </button>
                    <button className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 transition-all shadow-lg">
                      <Play
                        size={20}
                        className="text-white ml-1"
                        fill="white"
                      />
                    </button>
                  </div>
                  <h3 className="font-semibold text-white truncate mb-1">
                    {album.titulo}
                  </h3>
                  <p className="text-sm text-neutral-400 truncate">
                    {artistaNombre}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
