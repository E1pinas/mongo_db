import { usePlayer } from "../../../contexts";
import type { Cancion } from "../../../types";

export const useReproduccionCancion = () => {
  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();

  const handlePlayCancion = (cancion: Cancion | null) => {
    if (!cancion) return;

    if (currentSong?._id === cancion._id) {
      togglePlay();
    } else {
      playQueue([cancion], 0);
    }
  };

  const isCurrentSong = (cancion: Cancion | null) => {
    return currentSong?._id === cancion?._id;
  };

  return { handlePlayCancion, isCurrentSong, isPlaying };
};
