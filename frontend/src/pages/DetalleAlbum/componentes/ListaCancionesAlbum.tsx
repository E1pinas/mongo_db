import { Music } from "lucide-react";
import SongRow from "../../../components/musica/SongRow";
import { EmptyState } from "../../../components/common";
import type { Cancion } from "../../../types";

interface ListaCancionesAlbumProps {
  canciones: Cancion[];
  cancionActual: Cancion | null;
  estaReproduciendo: boolean;
  puedeEditar: boolean;
  onReproducir: (index: number) => void;
  onAbrirComentarios: (cancion: Cancion) => void;
  onCambioLike: (cancion: Cancion, liked: boolean) => void;
  onQuitar: (cancion: Cancion) => void;
}

export const ListaCancionesAlbum = ({
  canciones,
  cancionActual,
  estaReproduciendo,
  puedeEditar,
  onReproducir,
  onAbrirComentarios,
  onCambioLike,
  onQuitar,
}: ListaCancionesAlbumProps) => {
  if (canciones.length === 0) {
    return (
      <div className="px-8 py-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={Music}
            title="Este álbum no tiene canciones"
            description="Aún no se han agregado canciones a este álbum."
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
                onLikeChange={(liked) => onCambioLike(cancion, liked)}
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
