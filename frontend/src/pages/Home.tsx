import { useState, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { musicService } from "../services/music.service";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts";
import type { Cancion, Usuario } from "../types";
import SongCommentsModal from "../components/musica/SongCommentsModal";
import { formatTimeAgo } from "../utils/dateFormat";

/**
 * Home - Página de inicio
 *
 * Muestra contenido recomendado, playlists populares, nuevos lanzamientos
 */

export default function Home() {
  const { user } = useAuth();
  const { playSong, playQueue } = usePlayer();
  const [misCanciones, setMisCanciones] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comentariosCancion, setComentariosCancion] = useState<Cancion | null>(
    null
  );

  useEffect(() => {
    loadMisCanciones();

    // Recargar cuando la página vuelve a ser visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMisCanciones();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadMisCanciones = async () => {
    try {
      setLoading(true);
      const canciones = await musicService.getMySongs();
      setMisCanciones(canciones);
    } catch (err: any) {
      console.error("Error loading songs:", err);
      setError(err.message || "Error al cargar canciones");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (cancion: Cancion, index: number) => {
    // Reproducir esta canción y establecer la cola con todas las canciones
    playQueue(misCanciones, index);
  };

  const handleToggleLike = async (cancionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await musicService.toggleLike(cancionId);
      setMisCanciones((prev) =>
        prev.map((song) => {
          if (song._id === cancionId) {
            return {
              ...song,
              likes: result.liked
                ? [...song.likes, user?._id || ""]
                : song.likes.filter((id) => id !== user?._id),
            };
          }
          return song;
        })
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const isLiked = (cancion: Cancion) => {
    return user ? cancion.likes?.includes(user._id) : false;
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getArtistName = (artistas: string[] | Usuario[]) => {
    if (!artistas || artistas.length === 0) return "Artista desconocido";

    if (typeof artistas[0] === "string") {
      return "Artista";
    }

    const artistasPopulados = artistas as Usuario[];
    return artistasPopulados
      .map((a) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">Buenas tardes</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Mis Canciones */}
      {misCanciones.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Mis Canciones</h2>
            <button
              onClick={() => playQueue(misCanciones, 0)}
              className="px-4 py-2 bg-green-500 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              Reproducir todo
            </button>
          </div>

          <div className="space-y-2">
            {misCanciones.slice(0, 6).map((cancion, index) => (
              <div
                key={cancion._id}
                className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors group items-center cursor-pointer"
                onClick={() => handlePlaySong(cancion, index)}
              >
                {/* Número / Play button */}
                <div className="flex items-center justify-center w-8">
                  <span className="text-neutral-400 text-sm group-hover:hidden">
                    {index + 1}
                  </span>
                  <button className="hidden group-hover:flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>

                {/* Portada y título */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-neutral-700 rounded shrink-0 overflow-hidden">
                    <img
                      src={cancion.portadaUrl || "/cover.jpg"}
                      alt={cancion.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {cancion.titulo}
                      {cancion.esExplicita && (
                        <span className="ml-2 text-xs bg-neutral-700 px-2 py-0.5 rounded">
                          E
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {getArtistName(cancion.artistas)} •{" "}
                      {formatTimeAgo(cancion.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Duración y acciones */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setComentariosCancion(cancion);
                    }}
                    className="p-2 hover:scale-110 transition-transform text-neutral-400 opacity-0 group-hover:opacity-100"
                    title="Ver comentarios"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button
                    onClick={(e) => handleToggleLike(cancion._id, e)}
                    className={`p-2 hover:scale-110 transition-transform ${
                      isLiked(cancion)
                        ? "text-green-500"
                        : "text-neutral-400 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={isLiked(cancion) ? "currentColor" : "none"}
                    />
                  </button>
                  <span className="text-sm text-neutral-400">
                    {formatDuration(cancion.duracionSegundos)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-neutral-600 border-t-white rounded-full animate-spin"></div>
          <p className="text-neutral-400 mt-4">Cargando canciones...</p>
        </div>
      )}

      {!loading && misCanciones.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-neutral-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">
            Aún no tienes canciones
          </h3>
          <p className="text-neutral-400 mb-6">
            Sube tu primera canción para comenzar
          </p>
          <a
            href="/upload"
            className="inline-block px-6 py-3 bg-blue-500 rounded-full font-semibold hover:bg-blue-600 transition-colors"
          >
            Subir Canción
          </a>
        </div>
      )}

      {/* Sección de accesos rápidos (placeholder) */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 shrink-0" />
            <p className="font-semibold truncate pr-4">
              Canciones que te gustan
            </p>
            <button className="ml-auto mr-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-20 h-20 bg-neutral-700 flex-shrink-0" />
            <p className="font-semibold truncate pr-4">Mi playlist n.º 2</p>
            <button className="ml-auto mr-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-20 h-20 bg-neutral-700 shrink-0" />
            <p className="font-semibold truncate pr-4">gaaaaaaa</p>
            <button className="ml-auto mr-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-cyan-500 shrink-0" />
            <p className="font-semibold truncate pr-4">+ 4 más</p>
            <button className="ml-auto mr-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Card 5 */}
          <div className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-20 h-20 bg-neutral-700 rounded-full shrink-0" />
            <p className="font-semibold truncate pr-4">NewJeans</p>
            <button className="ml-auto mr-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Card 6 */}
          <div className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors cursor-pointer group flex items-center gap-4">
            <div className="w-20 h-20 bg-neutral-700 rounded-full shrink-0" />
            <p className="font-semibold truncate pr-4">IVE</p>
            <button className="ml-auto mr-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Hecho para ti */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Hecho para ti</h2>
          <button className="text-sm text-neutral-400 hover:text-white font-semibold">
            Mostrar todo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
            >
              <div className="relative mb-4">
                <div className="aspect-square bg-neutral-700 rounded-lg mb-4" />
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
              <p className="font-semibold text-sm mb-2 truncate">
                Daily Mix {i}
              </p>
              <p className="text-xs text-neutral-400 line-clamp-2">
                Una mezcla de tus canciones favoritas
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Nuevos lanzamientos */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Nuevos lanzamientos</h2>
          <button className="text-sm text-neutral-400 hover:text-white font-semibold">
            Mostrar todo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
            >
              <div className="relative mb-4">
                <div className="aspect-square bg-neutral-700 rounded-lg mb-4" />
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
              <p className="font-semibold text-sm mb-2 truncate">
                Nuevo Álbum {i}
              </p>
              <p className="text-xs text-neutral-400 line-clamp-2">
                Artista • 2025
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de comentarios */}
      {comentariosCancion && (
        <SongCommentsModal
          song={comentariosCancion}
          onClose={() => setComentariosCancion(null)}
        />
      )}
    </div>
  );
}
