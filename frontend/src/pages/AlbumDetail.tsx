import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Music, ArrowLeft, Play, Heart, MoreHorizontal } from "lucide-react";
import { albumService } from "../services/album.service";
import { musicService } from "../services/music.service";
import { recentService } from "../services/recent.service";
import { usePlayer, useAuth } from "../contexts";
import type { Album, Cancion, Usuario } from "../types";
import { LoadingSpinner, EmptyState } from "../components/common";
import { DetailHeader } from "../components/musica";
import SongRow from "../components/musica/SongRow";
import SongCommentsModal from "../components/musica/SongCommentsModal";
import { formatTimeAgo } from "../utils/dateFormat";
import { formatDuration } from "../utils/formatHelpers";

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playQueue, playSong, currentSong, isPlaying } = usePlayer();
  const { user } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);

  useEffect(() => {
    if (id) {
      loadAlbum();
    }
  }, [id]);

  const loadAlbum = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await albumService.getAlbumById(id);
      setAlbum(data);

      // Sincronizar estado de like
      if (user && data.likes) {
        setIsLiked(data.likes.includes(user._id));
      }

      // Agregar al historial de recientes
      const artistaNombre =
        typeof data.artistas[0] === "object"
          ? (data.artistas[0] as Usuario).nombreArtistico ||
            (data.artistas[0] as Usuario).nombre
          : "";

      recentService.addRecentItem({
        id: data._id,
        type: "album",
        titulo: data.titulo,
        subtitulo: artistaNombre,
        imagenUrl: data.portadaUrl,
      });
    } catch (error) {
      console.error("Error loading album:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!album || !album.canciones || album.canciones.length === 0) return;
    const songs = album.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], 0, {
        type: "album",
        id: album._id,
        name: album.titulo,
      });
    }
  };

  const handlePlaySong = (index: number) => {
    if (!album || !album.canciones) return;
    const songs = album.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], index, {
        type: "album",
        id: album._id,
        name: album.titulo,
      });
    }
  };

  const getArtistNames = (artistas: any[]) => {
    if (!artistas || artistas.length === 0) return "Artista";
    if (typeof artistas[0] === "string") return "Artista";
    return artistas
      .map((a: Usuario) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  const getTotalDuration = () => {
    if (!album || !album.canciones) return "0:00";
    const songs = album.canciones.filter(
      (c) => typeof c !== "string"
    ) as Cancion[];
    const total = songs.reduce(
      (acc, song) => acc + (song.duracionSegundos || 0),
      0
    );
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    return hours > 0 ? `${hours} h ${mins} min` : `${mins} min`;
  };

  const getAlbumYear = (fecha?: string) => {
    if (!fecha) return new Date().getFullYear();
    return new Date(fecha).getFullYear();
  };

  const handleToggleLike = async () => {
    if (!album || !user) return;
    try {
      const { liked } = await musicService.toggleLikeAlbum(album._id);
      setIsLiked(liked);
      // Actualizar el álbum para reflejar el cambio
      loadAlbum();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!album) {
    return (
      <EmptyState
        icon={Music}
        title="Álbum no encontrado"
        description="Este álbum no existe o fue eliminado."
      />
    );
  }

  const songs = (album.canciones?.filter((c) => typeof c !== "string") ||
    []) as Cancion[];

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-linear-to-b from-neutral-800 to-neutral-900 p-8">
        <button
          onClick={() => navigate("/albums")}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="flex items-end gap-6">
          {/* Portada */}
          <img
            src={album.portadaUrl || "/cover.jpg"}
            alt={album.titulo}
            className="w-56 h-56 rounded-lg shadow-2xl object-cover"
          />

          {/* Info */}
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase mb-2">Álbum</p>
            <h1 className="text-5xl font-bold mb-4">{album.titulo}</h1>
            <p className="text-neutral-400 mb-4 max-w-2xl">
              {album.descripcion || "Sin descripción"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {getArtistNames(album.artistas)}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-400">
                {formatTimeAgo(album.createdAt)}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-400">{songs.length} canciones</span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-400">{getTotalDuration()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-linear-to-b from-neutral-900 to-black p-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={24} fill="currentColor" />
          </button>
          <button
            onClick={handleToggleLike}
            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 rounded-full transition-colors"
          >
            <Heart
              size={24}
              className={isLiked ? "fill-orange-500 text-orange-500" : ""}
            />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 rounded-full transition-colors">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Lista de canciones */}
        {songs.length === 0 ? (
          <EmptyState
            icon={Music}
            title="Este álbum no tiene canciones"
            description="Aún no se han agregado canciones a este álbum."
          />
        ) : (
          <div className="space-y-1">
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?._id === song._id;
              return (
                <SongRow
                  key={song._id}
                  cancion={song}
                  index={index}
                  isCurrentSong={isCurrentSong}
                  isPlaying={isPlaying}
                  onPlay={() => handlePlaySong(index)}
                  onOpenComments={() => setSelectedSongForComments(song)}
                  onLikeChange={(liked) => {
                    // Recargar el álbum para obtener los datos actualizados
                    loadAlbum();
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de comentarios */}
      {selectedSongForComments && (
        <SongCommentsModal
          song={selectedSongForComments}
          onClose={() => setSelectedSongForComments(null)}
        />
      )}
    </div>
  );
}
