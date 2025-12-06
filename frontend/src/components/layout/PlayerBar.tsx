import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  Maximize2,
  Heart,
  Disc3,
} from "lucide-react";
import { usePlayer } from "../../contexts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts";
import { musicService } from "../../services/music.service";
import { useState, useEffect } from "react";

/**
 * PlayerBar - Reproductor de música fijo en la parte inferior
 *
 * FUNCIONALIDAD:
 * - Controles de reproducción: play/pause, skip, shuffle, repeat
 * - Barra de progreso con tiempo actual y duración
 * - Información de canción actual (imagen, título, artista)
 * - Control de volumen
 * - Botones adicionales: cola, letra, pantalla completa
 *
 * ESTRUCTURA:
 * - Grid de 3 columnas: info canción | controles | opciones/volumen
 * - Altura fija (h-24)
 * - Fondo oscuro con borde superior
 *
 * RESPONSIVE:
 * - Controles centrales siempre visibles
 * - Info y opciones reducen en móvil
 */

// Helper para formatear tiempo
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    shuffle,
    currentContext,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showRemoveLikeModal, setShowRemoveLikeModal] = useState(false);

  // Sincronizar el estado de like con la canción actual
  useEffect(() => {
    if (user && currentSong?.likes) {
      setIsLiked(currentSong.likes.includes(user._id));
    } else {
      setIsLiked(false);
    }
  }, [currentSong, currentSong?.likes, user]);

  const handleToggleLike = async () => {
    if (!currentSong || !user) return;

    // Si ya le gusta, mostrar modal de confirmación
    if (isLiked) {
      setShowRemoveLikeModal(true);
      return;
    }

    // Si no le gusta, agregarlo directamente
    try {
      await musicService.toggleLikeCancion(currentSong._id);
      // Actualizar el array de likes localmente
      if (currentSong.likes) {
        currentSong.likes = [...currentSong.likes, user._id];
      } else {
        currentSong.likes = [user._id];
      }
      setIsLiked(true);
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  };

  const confirmRemoveLike = async () => {
    if (!currentSong || !user) return;
    try {
      await musicService.toggleLikeCancion(currentSong._id);
      // Actualizar el array de likes localmente
      if (currentSong.likes) {
        currentSong.likes = currentSong.likes.filter((id) => id !== user._id);
      }
      setIsLiked(false);
      setShowRemoveLikeModal(false);
    } catch (error) {
      console.error("Error al quitar like:", error);
      setShowRemoveLikeModal(false);
    }
  };

  const handleGoToContext = () => {
    if (!currentContext) return;

    if (currentContext.type === "album") {
      navigate(`/albums/${currentContext.id}`);
    } else if (currentContext.type === "playlist") {
      navigate(`/playlists/${currentContext.id}`);
    }
  };
  return (
    <footer className="h-24 bg-black border-t border-neutral-800 px-4 flex items-center gap-4 shrink-0">
      {/* IZQUIERDA - Información de la canción */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {currentSong ? (
          <>
            {/* Thumbnail */}
            <div className="w-14 h-14 bg-neutral-700 rounded shrink-0 overflow-hidden">
              <img
                src={currentSong.portadaUrl || "/cover.jpg"}
                alt={currentSong.titulo}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="overflow-hidden min-w-0 hidden sm:block">
              <p className="text-sm font-medium truncate">
                {currentSong.titulo}
                {currentSong.esExplicita && (
                  <span className="ml-2 text-xs bg-neutral-700 px-1.5 py-0.5 rounded">
                    E
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {currentSong.artistas && currentSong.artistas.length > 0
                  ? typeof currentSong.artistas[0] === "string"
                    ? "Artista"
                    : (currentSong.artistas[0] as any)?.nombreArtistico ||
                      (currentSong.artistas[0] as any)?.nick ||
                      (currentSong.artistas[0] as any)?.nombre ||
                      "Artista desconocido"
                  : "Artista desconocido"}
              </p>
              {currentContext && (
                <button
                  onClick={handleGoToContext}
                  className="text-xs text-neutral-500 hover:text-white hover:underline transition-colors flex items-center gap-1 w-fit mt-0.5"
                  title={`Ir a ${
                    currentContext.type === "album" ? "álbum" : "playlist"
                  }`}
                >
                  <Disc3 size={12} />
                  <span className="truncate">{currentContext.name}</span>
                </button>
              )}
            </div>

            {/* Botón like */}
            <button
              onClick={handleToggleLike}
              className={`p-2 transition-colors hidden md:block ${
                isLiked
                  ? "text-orange-500"
                  : "text-neutral-400 hover:text-orange-500"
              }`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-neutral-700 rounded shrink-0" />
            <div className="hidden sm:block">
              <p className="text-sm text-neutral-400">
                No hay canción reproduciéndose
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CENTRO - Controles de reproducción */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl">
        {/* Botones de control */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              shuffle ? "text-green-500" : "text-neutral-400 hover:text-white"
            }`}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={skipPrevious}
            disabled={!currentSong}
            className="p-2 hover:text-white text-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Anterior"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="ml-0.5" />
            )}
          </button>

          <button
            onClick={skipNext}
            disabled={!currentSong}
            className="p-2 hover:text-white text-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Siguiente"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${
              repeat !== "off"
                ? "text-green-500"
                : "text-neutral-400 hover:text-white"
            }`}
            title={
              repeat === "off"
                ? "Repetir"
                : repeat === "all"
                ? "Repetir todo"
                : "Repetir una"
            }
          >
            {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-neutral-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-1 bg-neutral-700 rounded-full overflow-hidden group cursor-pointer"
            onClick={(e) => {
              if (!currentSong || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              seek(percentage * duration);
            }}
          >
            <div
              className="h-full bg-white group-hover:bg-green-500 transition-colors relative"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-neutral-400 w-10">
            {duration ? formatTime(duration) : "0:00"}
          </span>
        </div>
      </div>

      {/* DERECHA - Opciones adicionales */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        {/* Botones adicionales */}
        <button className="p-2 hover:text-white text-neutral-400 transition-colors hidden lg:block">
          <Mic2 size={18} />
        </button>

        <button className="p-2 hover:text-white text-neutral-400 transition-colors hidden lg:block">
          <ListMusic size={18} />
        </button>

        {/* Control de volumen */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.75)}
            className="p-2 hover:text-white text-neutral-400 transition-colors"
            title={volume > 0 ? "Silenciar" : "Activar sonido"}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div
            className="w-24 h-1 bg-neutral-700 rounded-full overflow-hidden group cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              setVolume(percentage);
            }}
          >
            <div
              className="h-full bg-white group-hover:bg-green-500 transition-colors relative"
              style={{ width: `${volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Pantalla completa */}
        <button className="p-2 hover:text-white text-neutral-400 transition-colors hidden xl:block">
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Modal de confirmación para quitar like */}
      {showRemoveLikeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              ¿Quitar de Canciones que te gustan?
            </h3>
            <p className="text-neutral-400 mb-6">
              Esto eliminará "{currentSong?.titulo}" de tu colección de
              canciones favoritas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveLikeModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemoveLike}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
