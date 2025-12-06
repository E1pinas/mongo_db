import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Music } from "lucide-react";
import { musicService } from "../services/music.service";

export default function LikedArtists() {
  const [artistas, setArtistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLikedArtists();
  }, []);

  const loadLikedArtists = async () => {
    try {
      setLoading(true);
      const artists = await musicService.getLikedArtists();
      setArtistas(artists);
    } catch (error) {
      console.error("Error cargando artistas guardados:", error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-neutral-900 to-neutral-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-600/40 to-transparent p-8 pb-6">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-2xl">
            <Music size={80} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">COLECCIÓN</p>
            <h1 className="text-6xl font-black mb-6">Artistas que sigo</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {artistas.length}{" "}
                {artistas.length === 1 ? "artista" : "artistas"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de artistas */}
      <div className="px-8 py-6">
        {artistas.length === 0 ? (
          <div className="text-center py-16">
            <User size={64} className="mx-auto mb-4 text-neutral-600" />
            <h3 className="text-2xl font-bold mb-2">
              No sigues a ningún artista
            </h3>
            <p className="text-neutral-400">
              Sigue a artistas que te gusten para verlos aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artistas.map((artista) => (
              <div
                key={artista._id}
                onClick={() => navigate(`/profile/${artista.nick}`)}
                className="group bg-neutral-800/40 hover:bg-neutral-800 p-4 rounded-lg transition-all cursor-pointer"
              >
                <div className="relative mb-4">
                  <img
                    src={
                      artista.avatarUrl && artista.avatarUrl.trim() !== ""
                        ? artista.avatarUrl
                        : "/avatar.png"
                    }
                    alt={artista.nombreArtistico || artista.nombre}
                    className="w-full aspect-square object-cover rounded-full shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.png";
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white truncate mb-1 text-center">
                  {artista.nombreArtistico || artista.nombre}
                </h3>
                <p className="text-sm text-neutral-400 truncate text-center">
                  @{artista.nick}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
