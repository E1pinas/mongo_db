import { Plus, Music } from "lucide-react";
import type { Cancion } from "../../../types";

interface SelectorCancionesProps {
  canciones: Cancion[];
  seleccionadas: string[];
  mostrarSelector: boolean;
  alToggleMostrar: () => void;
  alToggleCancion: (songId: string) => void;
}

export const SelectorCanciones = ({
  canciones,
  seleccionadas,
  mostrarSelector,
  alToggleMostrar,
  alToggleCancion,
}: SelectorCancionesProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Canciones del álbum
      </label>
      <button
        type="button"
        onClick={alToggleMostrar}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
      >
        <Plus size={16} />
        <span>Agregar canciones</span>
        <span className="ml-2 text-xs text-neutral-400">
          ({seleccionadas.length} seleccionadas)
        </span>
      </button>

      {mostrarSelector && (
        <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg max-h-60 overflow-y-auto">
          {canciones.length === 0 ? (
            <p className="text-neutral-400 text-sm text-center py-4">
              No tienes canciones para agregar
            </p>
          ) : (
            <div className="space-y-2">
              {canciones.map((song) => (
                <label
                  key={song._id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(song._id)}
                    onChange={() => alToggleCancion(song._id)}
                    className="w-4 h-4"
                  />
                  <div className="w-10 h-10 bg-neutral-700 rounded flex-shrink-0 overflow-hidden">
                    {song.portadaUrl ? (
                      <img
                        src={song.portadaUrl}
                        alt={song.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={16} className="text-neutral-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {song.titulo}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
