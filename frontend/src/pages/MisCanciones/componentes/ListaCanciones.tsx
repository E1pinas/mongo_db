import SongRow from "../../../components/musica/SongRow";
import type { Cancion } from "../../../types";

interface ListaCancionesProps {
  canciones: Cancion[];
  currentSong: Cancion | null;
  isPlaying: boolean;
  onPlay: (cancion: Cancion, index: number) => void;
  onOpenComments: (cancion: Cancion) => void;
  onRecargar: () => void;
  onEdit: (cancion: Cancion) => void;
  onDelete: (cancion: Cancion) => void;
}

export const ListaCanciones = ({
  canciones,
  currentSong,
  isPlaying,
  onPlay,
  onOpenComments,
  onRecargar,
  onEdit,
  onDelete,
}: ListaCancionesProps) => {
  return (
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
            onPlay={() => onPlay(cancion, index)}
            onOpenComments={() => onOpenComments(cancion)}
            onLikeChange={onRecargar}
            showCreatorActions={true}
            onEdit={() => onEdit(cancion)}
            onDelete={() => onDelete(cancion)}
          />
        );
      })}
    </div>
  );
};
