import { Heart, Play } from "lucide-react";

interface CabeceraFavoritasProps {
  totalCanciones: number;
  onReproducirTodo: () => void;
}

export const CabeceraFavoritas = ({
  totalCanciones,
  onReproducirTodo,
}: CabeceraFavoritasProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 blur-3xl" />
      <div className="relative px-6 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Heart size={32} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm text-purple-400 font-semibold mb-1">
              TU COLECCIÓN
            </p>
            <h1 className="text-5xl font-black bg-linear-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              Favoritas
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {totalCanciones > 0 && (
            <button
              onClick={onReproducirTodo}
              className="px-8 py-4 bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              <Play size={20} fill="white" />
              Reproducir todo
            </button>
          )}
          <div className="px-4 py-2 bg-neutral-800/50 backdrop-blur-sm rounded-full text-sm">
            <span className="text-neutral-400">Total:</span>
            <span className="ml-2 font-bold text-white">
              {totalCanciones} {totalCanciones === 1 ? "canción" : "canciones"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
