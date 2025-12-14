import {
  Play,
  Heart,
  Plus,
  Lock,
  Unlock,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import type { Playlist } from "../../../types";

interface BotonesAccionPlaylistProps {
  playlist: Playlist;
  estaSiguiendo: boolean;
  esCreador: boolean;
  cambiandoPrivacidad: boolean;
  onReproducirTodo: () => void;
  onToggleSeguir: () => void;
  onAgregarCanciones: () => void;
  onCambiarPrivacidad: () => void;
  onEliminar: () => void;
}

export const BotonesAccionPlaylist = ({
  playlist,
  estaSiguiendo,
  esCreador,
  cambiandoPrivacidad,
  onReproducirTodo,
  onToggleSeguir,
  onAgregarCanciones,
  onCambiarPrivacidad,
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

        {esCreador && (
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
              title={playlist.esPublica ? "Hacer privada" : "Hacer pública"}
            >
              {playlist.esPublica ? <Unlock size={20} /> : <Lock size={20} />}
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

        <button className="w-12 h-12 flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full transition-all">
          <MoreHorizontal size={22} className="text-neutral-400" />
        </button>
      </div>
    </div>
  );
};
