import { Disc, Plus } from "lucide-react";
import { FiltrosGenero } from "./FiltrosGenero";
import type { GeneroConTodo } from "../tipos";

interface CabeceraAlbumesProps {
  onClickCrear: () => void;
  generoSeleccionado: GeneroConTodo;
  onCambiarGenero: (genero: GeneroConTodo) => void;
}

export const CabeceraAlbumes = ({
  onClickCrear,
  generoSeleccionado,
  onCambiarGenero,
}: CabeceraAlbumesProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 blur-3xl" />
      <div className="relative px-6 pt-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
              <Disc size={32} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-400 font-semibold mb-1">
                TU COLECCIÓN
              </p>
              <h1 className="text-5xl font-black bg-linear-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                Mis Álbumes
              </h1>
            </div>
          </div>

          <button
            onClick={onClickCrear}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-orange-500/50"
          >
            <Plus size={20} />
            Crear Álbum
          </button>
        </div>

        <p className="text-neutral-400 text-sm mb-6">
          Crea y gestiona tus álbumes musicales
        </p>

        <FiltrosGenero
          generoSeleccionado={generoSeleccionado}
          onCambiarGenero={onCambiarGenero}
        />
      </div>
    </div>
  );
};
