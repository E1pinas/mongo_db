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
  Heart,
  Disc3,
  Flag,
} from "lucide-react";
import { usePlayer } from "../../contexts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts";
import { musicService } from "../../services/music.service";
import { useState, useEffect } from "react";
import { ReportModal } from "../common/ReportModal";

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOwnSongModal, setShowOwnSongModal] = useState(false);

  // Verificar si el usuario es propietario de la canción actual
  const isOwnSong = currentSong?.artistas?.some(
    (artista: any) => artista._id === user?._id || artista === user?._id
  );

  // Sincronizar el estado de like con la canción actual
  useEffect(() => {
    if (user && currentSong?.likes) {
      setIsLiked(currentSong.likes.includes(user._id));
    } else {
      setIsLiked(false);
    }
  }, [currentSong, currentSong?.likes, user]);

  // Agregar listener para la tecla Espacio
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Verificar si la tecla presionada es Espacio
      if (e.code !== "Space") return;

      // Verificar si el usuario está escribiendo en un input, textarea o elemento editable
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute("role") === "textbox";

      // Si está en un campo de texto, no hacer nada
      if (isInputField) return;

      // Prevenir el scroll de la página al presionar Espacio
      e.preventDefault();

      // Alternar reproducción/pausa
      if (currentSong) {
        togglePlay();
      }
    };

    // Agregar el event listener
    window.addEventListener("keydown", handleKeyPress);

    // Limpiar el event listener al desmontar
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentSong, togglePlay]);

  const handleToggleLike = async () => {
    if (!currentSong || !user) return;

    // Verificar si es canción propia
    const esCancionPropia = currentSong.artistas?.some((artista) =>
      typeof artista === "string"
        ? artista === user._id
        : artista._id === user._id
    );

    // Si ya le gusta, mostrar modal de confirmación
    if (isLiked) {
      setShowRemoveLikeModal(true);
      return;
    }

    // Si no le gusta, agregarlo directamente
    try {
      await musicService.toggleLikeCancion(currentSong._id);

      // Si es canción propia, mostrar modal informativo
      if (esCancionPropia) {
        setShowOwnSongModal(true);
      }

      // Actualizar el array de likes localmente
      if (currentSong.likes) {
        currentSong.likes = [...currentSong.likes, user._id];
      } else {
        currentSong.likes = [user._id];
      }
      setIsLiked(true);

      // Disparar evento para notificar cambios
      window.dispatchEvent(new Event("likeChanged"));
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

      // Disparar evento para notificar cambios
      window.dispatchEvent(new Event("likeChanged"));
    } catch (error) {
      console.error("Error al quitar like:", error);
      setShowRemoveLikeModal(false);
    }
  };

  const handleGoToContext = () => {
    if (!currentContext) return;

    if (currentContext.type === "album") {
      navigate(`/album/${currentContext.id}`);
    } else if (currentContext.type === "playlist") {
      // Si es la playlist especial de favoritos
      if (currentContext.id === "liked-songs") {
        navigate("/canciones-favoritas");
      } else {
        navigate(`/playlist/${currentContext.id}`);
      }
    }
  };

  // Ocultar el PlayerBar si no hay canción
  if (!currentSong) {
    return null;
  }

  return (
    <>
      <footer className="h-28 bg-linear-to-t from-neutral-900 via-black to-black border-t border-neutral-800/50 px-6 flex items-center gap-6 shrink-0 backdrop-blur-xl">
        {/* IZQUIERDA - Información de la canción */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {currentSong ? (
            <>
              {/* Thumbnail con hover effect */}
              <div className="relative w-16 h-16 bg-neutral-700 rounded-lg shrink-0 overflow-hidden group shadow-lg">
                <img
                  src={currentSong.portadaUrl || "/cover.jpg"}
                  alt={currentSong.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>

              {/* Info */}
              <div className="overflow-hidden min-w-0 hidden sm:block flex-1">
                <button
                  onClick={() => {
                    // Navegar al álbum si existe, si no al single
                    if (
                      currentSong.album &&
                      typeof currentSong.album === "object"
                    ) {
                      navigate(`/album/${currentSong.album._id}`);
                    } else if (
                      currentSong.album &&
                      typeof currentSong.album === "string"
                    ) {
                      navigate(`/album/${currentSong.album}`);
                    }
                  }}
                  className="text-base font-bold truncate text-white hover:underline cursor-pointer text-left w-full block"
                >
                  {currentSong.titulo}
                  {currentSong.esExplicita && (
                    <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold border border-red-500/30">
                      E
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    // Navegar al perfil del artista
                    if (
                      currentSong.artistas &&
                      currentSong.artistas.length > 0
                    ) {
                      const artista = currentSong.artistas[0];
                      if (typeof artista !== "string") {
                        navigate(`/perfil/${artista.nick}`);
                      }
                    }
                  }}
                  className="text-xs text-neutral-400 hover:text-white hover:underline truncate cursor-pointer text-left w-full block"
                >
                  {currentSong.artistas && currentSong.artistas.length > 0
                    ? typeof currentSong.artistas[0] === "string"
                      ? "Artista"
                      : (currentSong.artistas[0] as any)?.nombreArtistico ||
                        (currentSong.artistas[0] as any)?.nick ||
                        (currentSong.artistas[0] as any)?.nombre ||
                        "Artista desconocido"
                    : "Artista desconocido"}
                </button>
                {currentContext && (
                  <button
                    onClick={handleGoToContext}
                    className="text-xs text-neutral-500 hover:text-green-400 hover:underline transition-colors flex items-center gap-1.5 w-fit mt-1 font-medium"
                    title={`Ir a ${
                      currentContext.type === "album"
                        ? "álbum"
                        : currentContext.id === "liked-songs"
                        ? "canciones favoritas"
                        : "playlist"
                    }`}
                  >
                    <Disc3 size={14} className="text-green-500" />
                    <span className="truncate">{currentContext.name}</span>
                  </button>
                )}
              </div>

              {/* Botón like mejorado */}
              <button
                onClick={handleToggleLike}
                className={`p-2.5 rounded-full transition-all hidden md:flex items-center justify-center hover:scale-110 ${
                  isLiked
                    ? "bg-orange-500/20 text-orange-500"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-orange-500"
                }`}
                title={isLiked ? "Quitar de me gusta" : "Me gusta"}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </button>

              {/* Botón reportar mejorado - Solo mostrar si NO es canción propia */}
              {!isOwnSong && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2.5 rounded-full bg-neutral-800 text-neutral-400 hover:bg-red-500/20 hover:text-red-400 transition-all hidden md:flex items-center justify-center hover:scale-110"
                  title="Reportar canción"
                >
                  <Flag size={18} />
                </button>
              )}
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
        <div className="flex-1 flex flex-col items-center gap-3 max-w-2xl">
          {/* Botones de control */}
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-all hover:scale-110 ${
                shuffle
                  ? "bg-green-500/20 text-green-500"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              title="Aleatorio"
            >
              <Shuffle size={18} />
            </button>

            <button
              onClick={skipPrevious}
              disabled={!currentSong}
              className="p-2 rounded-full hover:bg-white/10 hover:text-white text-neutral-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              title="Anterior"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentSong}
              className="p-4 bg-white text-black rounded-full hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/20"
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} className="ml-1" fill="currentColor" />
              )}
            </button>

            <button
              onClick={skipNext}
              disabled={!currentSong}
              className="p-2 rounded-full hover:bg-white/10 hover:text-white text-neutral-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              title="Siguiente"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-all hover:scale-110 ${
                repeat !== "off"
                  ? "bg-green-500/20 text-green-500"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              title={
                repeat === "off"
                  ? "Repetir"
                  : repeat === "all"
                  ? "Repetir todo"
                  : "Repetir una"
              }
            >
              {repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Barra de progreso mejorada */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-neutral-400 w-12 text-right font-medium tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1.5 bg-neutral-700/50 rounded-full overflow-hidden group cursor-pointer relative"
              onClick={(e) => {
                if (!currentSong || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                seek(percentage * duration);
              }}
            >
              <div
                className="h-full bg-linear-to-r from-orange-400 to-orange-500 group-hover:from-orange-500 group-hover:to-orange-600
 transition-all relative shadow-lg shadow-green-500/50"
                style={{
                  width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-neutral-400 w-12 font-medium tabular-nums">
              {duration ? formatTime(duration) : "0:00"}
            </span>
          </div>
        </div>

        {/* DERECHA - Control de volumen */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Control de volumen mejorado */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.75)}
              className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all hover:scale-110"
              title={volume > 0 ? "Silenciar" : "Activar sonido"}
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div
              className="w-28 h-1.5 bg-neutral-700/50 rounded-full overflow-hidden group cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                setVolume(percentage);
              }}
            >
              <div
                className="h-full bg-white group-hover:bg-orange-500 transition-colors relative shadow-lg"
                style={{ width: `${volume * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-neutral-400 w-10 font-medium tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </footer>

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

      {/* Modal informativo para canciones propias */}
      {showOwnSongModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-orange-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Heart
                  size={24}
                  className="text-orange-500"
                  fill="currentColor"
                />
              </div>
              <h3 className="text-xl font-bold">Esta es tu canción</h3>
            </div>
            <p className="text-neutral-300 mb-6">
              Tus propias canciones no se agregan a "Canciones que me gustan".
              Puedes escucharlas desde tu perfil en la sección "Mis Canciones".
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOwnSongModal(false)}
                className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors font-medium"
              >
                Entendido
              </button>
              <button
                onClick={() => {
                  setShowOwnSongModal(false);
                  if (user?.nick) navigate(`/perfil/${user.nick}`);
                }}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-medium"
              >
                Ir a mi perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reportar */}
      {currentSong && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          tipoContenido="cancion"
          contenidoId={currentSong._id}
          nombreContenido={currentSong.titulo}
        />
      )}
    </>
  );
}
