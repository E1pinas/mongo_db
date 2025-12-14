import { Music } from "lucide-react";
import SongRow from "../../../components/musica/SongRow";
import { EmptyState } from "../../../components/common";
import type { Cancion } from "../../../types";

interface ListaCancionesPlaylistProps {
  canciones: Cancion[];
  cancionActual: Cancion | null;
  estaReproduciendo: boolean;
  puedeEditar: boolean;
  onReproducir: (index: number) => void;
  onAbrirComentarios: (cancion: Cancion) => void;
  onCambioLike: () => void;
  onQuitar: (cancion: Cancion) => void;
}

export const ListaCancionesPlaylist = ({
  canciones,
  cancionActual,
  estaReproduciendo,
  puedeEditar,
  onReproducir,
  onAbrirComentarios,
  onCambioLike,
  onQuitar,
}: ListaCancionesPlaylistProps) => {
  if (canciones.length === 0) {
    return (
      <div className="px-8 py-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={Music}
            title="Esta playlist aún no tiene canciones"
            description="Agrega canciones para empezar a escuchar."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-2">
          {canciones.map((cancion, index) => {
            const esCancionActual = cancionActual?._id === cancion._id;
            return (
              <SongRow
                key={cancion._id}
                cancion={cancion}
                index={index}
                isCurrentSong={esCancionActual}
                isPlaying={estaReproduciendo}
                onPlay={() => onReproducir(index)}
                onOpenComments={() => onAbrirComentarios(cancion)}
                onLikeChange={onCambioLike}
                showRemoveFromCollection={puedeEditar}
                onRemoveFromCollection={() => onQuitar(cancion)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
