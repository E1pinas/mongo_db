import { Play, Music2, Heart, MessageCircle, Disc3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../../contexts/PlayerContext";
import { useAuth } from "../../../contexts";
import type { Cancion } from "../../../types";
import { obtenerNombreArtista, estaLiked } from "../utils";

interface SeccionMisCancionesProps {
  canciones: Cancion[];
  alReproducir: (cancion: Cancion, index: number) => void;
  alToggleLike: (cancionId: string, e: React.MouseEvent) => void;
  alAbrirComentarios: (cancion: Cancion) => void;
}

export const SeccionMisCanciones = ({
  canciones,
  alReproducir,
  alToggleLike,
  alAbrirComentarios,
}: SeccionMisCancionesProps) => {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const { user } = useAuth();

  if (canciones.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
          <Music2 size={40} className="text-neutral-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Aún no tienes canciones</h3>
        <p className="text-neutral-400 mb-6">
          Sube tu primera canción y comparte tu música con el mundo
        </p>
        <button
          onClick={() => navigate("/subir")}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full font-semibold transition-all hover:scale-105"
        >
          Subir Canción
        </button>
      </div>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Music2 size={20} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold">Tu Música</h2>
        </div>
        <button
          onClick={() => playQueue(canciones, 0)}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full font-semibold transition-all hover:scale-105 flex items-center gap-2"
        >
          <Play size={18} fill="white" />
          Reproducir todo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canciones.slice(0, 6).map((cancion, index) => (
          <div
            key={cancion._id}
            onClick={() => alReproducir(cancion, index)}
            className="group relative bg-neutral-900/50 hover:bg-neutral-800/80 border border-neutral-800 hover:border-orange-500/50 rounded-xl p-4 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 group-hover:from-orange-500/10 to-transparent transition-all" />

            <div className="relative flex items-center gap-4">
              {/* Portada */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                {cancion.portadaUrl ? (
                  <img
                    src={cancion.portadaUrl}
                    alt={cancion.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Disc3 size={24} className="text-neutral-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <Play size={16} fill="white" className="ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                  {cancion.titulo}
                  {cancion.esExplicita && (
                    <span className="ml-2 text-xs font-bold text-red-500 bg-red-500/20 px-1.5 py-0.5 rounded">
                      E
                    </span>
                  )}
                </h3>
                <p className="text-sm text-neutral-400 truncate">
                  {obtenerNombreArtista(cancion.artistas)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => alToggleLike(cancion._id, e)}
                  className={`p-2 rounded-full transition-all hover:scale-110 ${
                    estaLiked(cancion, user?._id)
                      ? "text-orange-500"
                      : "text-neutral-400 hover:text-orange-500"
                  }`}
                >
                  <Heart
                    size={18}
                    fill={
                      estaLiked(cancion, user?._id) ? "currentColor" : "none"
                    }
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alAbrirComentarios(cancion);
                  }}
                  className="p-2 rounded-full text-neutral-400 hover:text-blue-400 transition-all hover:scale-110"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canciones.length > 6 && (
        <button
          onClick={() => navigate("/mis-canciones")}
          className="mt-6 w-full py-3 border-2 border-neutral-800 hover:border-orange-500 rounded-xl font-semibold transition-all hover:bg-neutral-900"
        >
          Ver todas tus canciones ({canciones.length})
        </button>
      )}
    </section>
  );
};
