import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { musicService } from "../services/music.service";
import { formatDuration } from "../utils/formatHelpers";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts";
import type { Cancion } from "../types";
import { SongCommentsModal } from "../components/musica";
import SongRow from "../components/musica/SongRow";
import {
  Button,
  LoadingSpinner,
  EmptyState,
  SectionHeader,
} from "../components/common";

export default function MySongs() {
  const navigate = useNavigate();
  const { playSong, playQueue, currentSong, isPlaying } = usePlayer();
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [comentariosCancion, setComentariosCancion] = useState<Cancion | null>(
    null
  );

  useEffect(() => {
    loadCanciones();
  }, []);

  const loadCanciones = async () => {
    try {
      setLoading(true);
      const songs = await musicService.getMySongs();
      setCanciones(songs);
    } catch (err: any) {
      console.error("Error loading songs:", err);
      setError(err.message || "Error al cargar canciones");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      loadCanciones();
      return;
    }

    if (query.length < 2) return;

    try {
      setSearching(true);
      const results = await musicService.searchMySongs(query);
      setCanciones(results);
    } catch (err: any) {
      console.error("Error searching:", err);
      setError(err.message || "Error en la búsqueda");
    } finally {
      setSearching(false);
    }
  };

  const handlePlaySong = (cancion: Cancion, index: number) => {
    playQueue(canciones, index);
  };

  const handleToggleLike = async (cancionId: string) => {
    try {
      await musicService.toggleLike(cancionId);
      // Actualizar el estado local
      setCanciones((prev) =>
        prev.map((c) => {
          if (c._id === cancionId) {
            const isLiked = c.likes.some((id) => id === "current-user"); // TODO: usar ID real del usuario
            return {
              ...c,
              likes: isLiked
                ? c.likes.filter((id) => id !== "current-user")
                : [...c.likes, "current-user"],
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error("Error toggling like:", err);
    }
  };

  const handleDeleteSong = async (cancionId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta canción?")) return;

    try {
      await musicService.deleteSong(cancionId);
      setCanciones((prev) => prev.filter((c) => c._id !== cancionId));
    } catch (err: any) {
      console.error("Error deleting song:", err);
      setError(err.message || "Error al eliminar canción");
    }
  };

  const formatDuration = (seconds: number) => {
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Mis Canciones</h1>
        <p className="text-neutral-400">
          {canciones.length} {canciones.length === 1 ? "canción" : "canciones"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-sm underline mt-2"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar en mis canciones..."
            className="w-full px-4 py-3 pl-10 bg-neutral-800/60 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        <Button onClick={() => navigate("/upload")} variant="secondary">
          Subir Canción
        </Button>
        {canciones.length > 0 && (
          <Button onClick={() => playQueue(canciones, 0)}>
            Reproducir todo
          </Button>
        )}
      </div>

      {loading && <LoadingSpinner text="Cargando canciones..." />}

      {!loading && canciones.length === 0 && !searchQuery && (
        <EmptyState
          title="Aún no tienes canciones"
          description="Sube tu primera canción para comenzar"
          actionLabel="Subir Canción"
          onAction={() => navigate("/upload")}
        />
      )}

      {!loading && canciones.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-neutral-400">
            No se encontraron canciones con "{searchQuery}"
          </p>
          <button
            onClick={() => handleSearch("")}
            className="text-blue-400 hover:underline mt-4"
          >
            Ver todas las canciones
          </button>
        </div>
      )}

      {/* Lista de canciones */}
      {!loading && canciones.length > 0 && (
        <div className="space-y-1">
          {canciones.map((cancion, index) => {
            const isCurrentSong = currentSong?._id === cancion._id;
            return (
              <SongRow
                key={cancion._id}
                cancion={cancion}
                index={index}
                isCurrentSong={isCurrentSong}
                isPlaying={isPlaying}
                onPlay={() => handlePlaySong(cancion, index)}
                onOpenComments={() => setComentariosCancion(cancion)}
                onLikeChange={() => loadCanciones()}
              />
            );
          })}
        </div>
      )}

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
