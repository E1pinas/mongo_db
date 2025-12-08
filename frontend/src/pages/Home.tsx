import { useState, useEffect } from "react";
import { musicService } from "../services/music.service";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts";
import type { Cancion } from "../types";
import SongCommentsModal from "../components/musica/SongCommentsModal";
import SongListItem from "../components/musica/SongListItem";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import SectionHeader from "../components/common/SectionHeader";
import QuickAccessCard from "../components/common/QuickAccessCard";
import MediaGrid from "../components/common/MediaGrid";
import PlaceholderCard from "../components/common/PlaceholderCard";

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
          <SectionHeader
            title="Mis Canciones"
            rightElement={
              <Button onClick={() => playQueue(misCanciones, 0)}>
                Reproducir todo
              </Button>
            }
          />

          <div className="space-y-2">
            {misCanciones.slice(0, 6).map((cancion, index) => (
              <SongListItem
                key={cancion._id}
                song={cancion}
                index={index}
                isLiked={isLiked(cancion)}
                onPlay={() => handlePlaySong(cancion, index)}
                onToggleLike={(e) => handleToggleLike(cancion._id, e)}
                onOpenComments={(e) => {
                  e.stopPropagation();
                  setComentariosCancion(cancion);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {loading && <LoadingSpinner text="Cargando canciones..." />}

      {!loading && misCanciones.length === 0 && (
        <EmptyState
          title="Aún no tienes canciones"
          description="Sube tu primera canción para comenzar"
          actionLabel="Subir Canción"
          actionHref="/upload"
        />
      )}

      {/* Sección de accesos rápidos */}
      <section className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAccessCard
            title="Canciones que te gustan"
            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            onPlay={(e) => {
              e.stopPropagation();
              console.log("Reproducir canciones que te gustan");
            }}
          />
          <QuickAccessCard
            title="Mi playlist n.º 2"
            onPlay={(e) => {
              e.stopPropagation();
              console.log("Reproducir playlist");
            }}
          />
          <QuickAccessCard
            title="gaaaaaaa"
            onPlay={(e) => {
              e.stopPropagation();
              console.log("Reproducir playlist");
            }}
          />
          <QuickAccessCard
            title="+ 4 más"
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            onPlay={(e) => {
              e.stopPropagation();
              console.log("Ver más");
            }}
          />
          <QuickAccessCard
            title="NewJeans"
            isRounded
            onPlay={(e) => {
              e.stopPropagation();
              console.log("Reproducir artista");
            }}
          />
          <QuickAccessCard
            title="IVE"
            isRounded
            onPlay={(e) => {
              e.stopPropagation();
              console.log("Reproducir artista");
            }}
          />
        </div>
      </section>

      {/* Hecho para ti */}
      <section className="mb-12">
        <SectionHeader
          title="Hecho para ti"
          action={{
            label: "Mostrar todo",
            onClick: () => console.log("Ver más"),
          }}
        />
        <MediaGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PlaceholderCard
              key={i}
              title={`Daily Mix ${i}`}
              description="Una mezcla de tus canciones favoritas"
              index={i}
            />
          ))}
        </MediaGrid>
      </section>

      {/* Nuevos lanzamientos */}
      <section>
        <SectionHeader
          title="Nuevos lanzamientos"
          action={{
            label: "Mostrar todo",
            onClick: () => console.log("Ver más"),
          }}
        />
        <MediaGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PlaceholderCard
              key={i}
              title={`Nuevo Álbum ${i}`}
              description="Artista • 2025"
              index={i}
            />
          ))}
        </MediaGrid>
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
