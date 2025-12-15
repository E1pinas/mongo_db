import { Play, Heart, Plus, Edit3, Trash2 } from "lucide-react";
import type { Playlist } from "../../../types";

interface BotonesAccionPlaylistProps {
  playlist: Playlist;
  estaSiguiendo: boolean;
  esCreador: boolean;
  puedeEditar: boolean;
  onReproducirTodo: () => void;
  onToggleSeguir: () => void;
  onAgregarCanciones: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

export const BotonesAccionPlaylist = ({
  playlist,
  estaSiguiendo,
  esCreador,
  puedeEditar,
  onReproducirTodo,
  onToggleSeguir,
  onAgregarCanciones,
  onEditar,
  onEliminar,
}: BotonesAccionPlaylistProps) => {
  const canciones =
    playlist.canciones?.filter((c) => typeof c !== "string") || [];

  return (
    <div className="bg-black px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <button
          onClick={onReproducirTodo}
          disabled={canciones.length === 0}
          className="px-8 py-4 bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-full flex items-center gap-3 font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
        >
          <Play size={20} fill="currentColor" />
          Reproducir todo
        </button>

        <button
          onClick={onToggleSeguir}
          className="w-12 h-12 flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full transition-all hover:scale-110"
          title={estaSiguiendo ? "Dejar de seguir" : "Seguir"}
        >
          <Heart
            size={22}
            className={
              estaSiguiendo
                ? "fill-orange-500 text-orange-500"
                : "text-neutral-400"
            }
          />
        </button>

        {puedeEditar && (
          <button
            onClick={onAgregarCanciones}
            className="w-12 h-12 flex items-center justify-center hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-full transition-all hover:scale-110"
            title="Agregar canciones"
          >
            <Plus size={20} />
          </button>
        )}

        {esCreador && (
          <>
            <button
              onClick={onEditar}
              className="w-12 h-12 flex items-center justify-center hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full transition-all hover:scale-110"
              title="Editar playlist"
            >
              <Edit3 size={20} />
            </button>
            <button
              onClick={onEliminar}
              className="w-12 h-12 flex items-center justify-center hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full transition-all hover:scale-110"
              title="Eliminar playlist"
            >
              <Trash2 size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
