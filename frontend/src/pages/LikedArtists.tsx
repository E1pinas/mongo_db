import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Music } from "lucide-react";
import { musicService } from "../services/music.service";
import { LoadingSpinner, EmptyState, MediaGrid } from "../components/common";
import { ArtistCard } from "../components/musica";

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
    return <LoadingSpinner />;
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
          <EmptyState
            icon={User}
            title="No sigues a ningún artista"
            description="Sigue a artistas que te gusten para verlos aquí"
          />
        ) : (
          <MediaGrid>
            {artistas.map((artista) => (
              <ArtistCard
                key={artista._id}
                artist={artista}
                onClick={() => navigate(`/profile/${artista.nick}`)}
              />
            ))}
          </MediaGrid>
        )}
      </div>
    </div>
  );
}
