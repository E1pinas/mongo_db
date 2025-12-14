import SongRow from "../../../components/musica/SongRow";
import type { Cancion } from "../../../types";

interface ListaFavoritasProps {
  canciones: Cancion[];
  currentSong: Cancion | null;
  isPlaying: boolean;
  onPlay: (index: number) => void;
  onOpenComments: (cancion: Cancion) => void;
  onLikeChange: (cancion: Cancion, liked: boolean) => void;
}

export const ListaFavoritas = ({
  canciones,
  currentSong,
  isPlaying,
  onPlay,
  onOpenComments,
  onLikeChange,
}: ListaFavoritasProps) => {
  return (
    <div className="space-y-2">
      {canciones.map((cancion, index) => {
        const isCurrentSong = currentSong?._id === cancion._id;
        return (
          <SongRow
            key={cancion._id}
            cancion={cancion}
            index={index}
            isCurrentSong={isCurrentSong}
            isPlaying={isPlaying}
            onPlay={() => onPlay(index)}
            onOpenComments={() => onOpenComments(cancion)}
            onLikeChange={(liked) => onLikeChange(cancion, liked)}
          />
        );
      })}
    </div>
  );
};
