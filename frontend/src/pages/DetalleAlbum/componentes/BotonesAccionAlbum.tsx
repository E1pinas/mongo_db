import { Play, Heart, Plus, Lock, Unlock, Trash2 } from "lucide-react";
import type { Album } from "../../../types";

interface BotonesAccionAlbumProps {
  album: Album;
  leGusta: boolean;
  puedeEditar: boolean;
  cambiandoPrivacidad: boolean;
  onReproducirTodo: () => void;
  onToggleLike: () => void;
  onAgregarCanciones: () => void;
  onCambiarPrivacidad: () => void;
  onEliminar: () => void;
}

export const BotonesAccionAlbum = ({
  album,
  leGusta,
  puedeEditar,
  cambiandoPrivacidad,
  onReproducirTodo,
  onToggleLike,
  onAgregarCanciones,
  onCambiarPrivacidad,
  onEliminar,
}: BotonesAccionAlbumProps) => {
  const canciones = album.canciones?.filter((c) => typeof c !== "string") || [];

  return (
    <div className="bg-black px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <button
          onClick={onReproducirTodo}
          disabled={canciones.length === 0}
          className="px-8 py-4 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-full flex items-center gap-3 font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
        >
          <Play size={20} fill="currentColor" />
          Reproducir todo
        </button>

        <button
          onClick={onToggleLike}
          className="w-12 h-12 flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full transition-all hover:scale-110"
          title={leGusta ? "Quitar me gusta" : "Me gusta"}
        >
          <Heart
            size={22}
            className={
              leGusta ? "fill-orange-500 text-orange-500" : "text-neutral-400"
            }
          />
        </button>

        {puedeEditar && (
          <>
            <button
              onClick={onAgregarCanciones}
              className="w-12 h-12 flex items-center justify-center hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-full transition-all hover:scale-110"
              title="Agregar canciones"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={onCambiarPrivacidad}
              disabled={cambiandoPrivacidad}
              className="w-12 h-12 flex items-center justify-center hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full transition-all hover:scale-110 disabled:opacity-50"
              title={album.esPrivado ? "Hacer público" : "Hacer privado"}
            >
              {album.esPrivado ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
            <button
              onClick={onEliminar}
              className="w-12 h-12 flex items-center justify-center hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full transition-all hover:scale-110"
              title="Eliminar álbum"
            >
              <Trash2 size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
