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
          <EmptyState
            icon={Disc}
            title="No tienes álbumes guardados"
            description="Guarda álbumes que te gusten para verlos aquí"
          />
        ) : (
          <MediaGrid>
            {albumes.map((album) => (
              <AlbumCard
                key={album._id}
                album={album}
                onClick={() => navigate(`/album/${album._id}`)}
              />
            ))}
          </MediaGrid>
        )}
      </div>
    </div>
  );
}
