import { Music, Play } from "lucide-react";
import SongRow from "../../../components/musica/SongRow";
import type { Cancion } from "../../../types";

interface SeccionCancionesProps {
  canciones: Cancion[];
  currentSong: Cancion | null;
  isPlaying: boolean;
  alReproducir: (index: number) => void;
  alReproducirTodo: () => void;
  alCambioLike: () => void;
}

export const SeccionCanciones = ({
  canciones,
  currentSong,
  isPlaying,
  alReproducir,
  alReproducirTodo,
  alCambioLike,
}: SeccionCancionesProps) => {
  if (canciones.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Music size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Canciones</h2>
          <span className="text-sm text-neutral-500">({canciones.length})</span>
        </div>
        <button
          onClick={alReproducirTodo}
          className="px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full font-semibold transition-all hover:scale-105 flex items-center gap-2"
        >
          <Play size={16} fill="white" />
          Reproducir todo
        </button>
      </div>

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
              onPlay={() => alReproducir(index)}
              onLikeChange={alCambioLike}
              hideComments={true}
            />
          );
        })}
      </div>
    </section>
  );
};
