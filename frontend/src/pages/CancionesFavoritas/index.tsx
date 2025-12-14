import { useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import type { Cancion } from "../../types";
import { SongCommentsModal } from "../../components/musica";
import { LoadingSpinner } from "../../components/common";
import { useCancionesFavoritas } from "./hooks";
import { CabeceraFavoritas, ListaFavoritas, EstadoVacio } from "./componentes";

export default function CancionesFavoritas() {
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const { canciones, setCanciones, cargando } = useCancionesFavoritas();
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);

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

  const handleLikeChange = (cancion: Cancion, liked: boolean) => {
    if (!liked) {
      setCanciones((prev) => prev.filter((c) => c._id !== cancion._id));
    }
  };

  if (cargando) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      <CabeceraFavoritas
        totalCanciones={canciones.length}
        onReproducirTodo={handlePlayAll}
      />

      <div className="px-6 pb-20">
        {canciones.length === 0 ? (
          <EstadoVacio />
        ) : (
          <ListaFavoritas
            canciones={canciones}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlaySong}
            onOpenComments={setSelectedSongForComments}
            onLikeChange={handleLikeChange}
          />
        )}
      </div>

      {selectedSongForComments && (
        <SongCommentsModal
          song={selectedSongForComments}
          onClose={() => setSelectedSongForComments(null)}
        />
      )}
    </div>
  );
}
