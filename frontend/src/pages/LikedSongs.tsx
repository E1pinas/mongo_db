import { useState, useEffect } from "react";
import { Heart, Play } from "lucide-react";
import { musicService } from "../services/music.service";
import { usePlayer } from "../contexts/PlayerContext";
import type { Cancion } from "../types";
import SongRow from "../components/musica/SongRow";
import { SongCommentsModal } from "../components/musica";
import { LoadingSpinner, EmptyState } from "../components/common";

/**
 * LikedSongs - Página de canciones que me gustan
 * Muestra todas las canciones guardadas en la biblioteca del usuario
 */

export default function LikedSongs() {
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);

  useEffect(() => {
    loadLikedSongs();

    // Escuchar eventos de cambios en likes
    const handleLikeChange = () => {
      loadLikedSongs();
    };

    window.addEventListener("likeChanged", handleLikeChange);

    return () => {
      window.removeEventListener("likeChanged", handleLikeChange);
    };
  }, []);

  const loadLikedSongs = async () => {
    try {
      setLoading(true);
      const songs = await musicService.getLikedSongs();
      setCanciones(songs);
    } catch (error) {
      console.error("Error cargando canciones guardadas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (canciones.length > 0) {
      playQueue(canciones, 0, {
        type: "playlist",
        id: "liked-songs",
        name: "Canciones que me gustan",
      });
    }
  };

  const handlePlaySong = (index: number) => {
    playQueue(canciones, index, {
      type: "playlist",
      id: "liked-songs",
      name: "Canciones que me gustan",
    });
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
            <Heart size={80} className="text-white" fill="white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">PLAYLIST</p>
            <h1 className="text-6xl font-black mb-6">
              Canciones que me gustan
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {canciones.length}{" "}
                {canciones.length === 1 ? "canción" : "canciones"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-8 py-6 flex items-center gap-6">
        {canciones.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            <Play size={24} className="text-white ml-1" fill="white" />
          </button>
        )}
      </div>

      {/* Lista de canciones */}
      <div className="px-8 pb-8">
        {canciones.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No tienes canciones guardadas"
            description="Dale like a las canciones que te gusten para verlas aquí"
          />
        ) : (
          <div className="space-y-1">
            {canciones.map((cancion, index) => {
              const isCurrentSong = currentSong?._id === cancion._id;
              return (
                <SongRow
                  key={cancion._id}
                  cancion={cancion}
                  index={index}
                  isCurrentSong={isCurrentSong}
                  isPlaying={isPlaying}
                  onPlay={() => handlePlaySong(index)}
                  onOpenComments={() => setSelectedSongForComments(cancion)}
                  onLikeChange={(liked) => {
                    if (!liked) {
                      // Remover de la lista local
                      setCanciones((prev) =>
                        prev.filter((c) => c._id !== cancion._id)
                      );
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de comentarios */}
      {selectedSongForComments && (
        <SongCommentsModal
          song={selectedSongForComments}
          onClose={() => setSelectedSongForComments(null)}
        />
      )}
    </div>
  );
}
