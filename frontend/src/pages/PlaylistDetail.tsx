import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Heart,
  MoreHorizontal,
  Clock,
  Music,
  ArrowLeft,
} from "lucide-react";
import { musicService } from "../services/music.service";
import { recentService } from "../services/recent.service";
import { usePlayer, useAuth } from "../contexts";
import type { Playlist, Cancion, Usuario } from "../types";
import SongRow from "../components/musica/SongRow";
import SongCommentsModal from "../components/musica/SongCommentsModal";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await musicService.getPlaylistById(id);
      setPlaylist(data);

      // Sincronizar estado de seguimiento
      if (user && data.seguidores) {
        setIsFollowing(data.seguidores.includes(user._id));
      }

      // Agregar al historial de recientes
      const creadorNombre =
        typeof data.creador === "object"
          ? (data.creador as Usuario).nombreArtistico ||
            (data.creador as Usuario).nombre
          : "";

      recentService.addRecentItem({
        id: data._id,
        type: "playlist",
        titulo: data.titulo,
        subtitulo: creadorNombre,
        imagenUrl: data.portadaUrl || "/default-playlist.png",
      });
    } catch (error) {
      console.error("Error loading playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!playlist || !playlist.canciones || playlist.canciones.length === 0)
      return;
    const songs = playlist.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], 0, {
        type: "playlist",
        id: playlist._id,
        name: playlist.titulo,
      });
    }
  };

  const handlePlaySong = (index: number) => {
    if (!playlist || !playlist.canciones) return;
    const songs = playlist.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], index, {
        type: "playlist",
        id: playlist._id,
        name: playlist.titulo,
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalDuration = () => {
    if (!playlist || !playlist.canciones) return "0:00";
    const songs = playlist.canciones.filter(
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

  const getCreatorName = () => {
    if (!playlist || !playlist.creador) return "Usuario";
    if (typeof playlist.creador === "string") return "Usuario";
    return (
      playlist.creador.nombreArtistico ||
      playlist.creador.nick ||
      playlist.creador.nombre ||
      "Usuario"
    );
  };

  const handleToggleSeguir = async () => {
    if (!playlist || !user) return;
    try {
      const { following } = await musicService.toggleSeguirPlaylist(
        playlist._id
      );
      setIsFollowing(following);
      // Actualizar la playlist para reflejar el cambio
      loadPlaylist();
    } catch (error) {
      console.error("Error toggling seguir:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Music size={64} className="text-neutral-600 mb-4" />
        <p className="text-xl text-neutral-400 mb-4">Playlist no encontrada</p>
        <button
          onClick={() => navigate("/playlists")}
          className="px-6 py-3 bg-neutral-800 rounded-full font-semibold hover:bg-neutral-700 transition-colors"
        >
          Volver a Playlists
        </button>
      </div>
    );
  }

  const songs =
    (playlist.canciones?.filter((c) => typeof c !== "string") as Cancion[]) ||
    [];

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 to-black pb-32">
      {/* Header */}
      <div className="relative">
        <button
          onClick={() => navigate("/playlists")}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="flex items-end gap-6 p-8 bg-linear-to-b from-blue-900/40 to-transparent">
          {/* Portada */}
          <div className="w-56 h-56 rounded-lg overflow-hidden shrink-0 shadow-2xl">
            <img
              src={playlist.portadaUrl || "/cover.jpg"}
              alt={playlist.titulo}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pb-6">
            <p className="text-sm font-semibold mb-2">PLAYLIST</p>
            <h1 className="text-7xl font-bold mb-6">{playlist.titulo}</h1>
            {playlist.descripcion && (
              <p className="text-neutral-300 mb-4">{playlist.descripcion}</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{getCreatorName()}</span>
              <span>•</span>
              <span>{songs.length} canciones</span>
              <span>•</span>
              <span className="text-neutral-400">{getTotalDuration()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 px-8 py-6">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={24} fill="currentColor" />
        </button>
        <button
          onClick={handleToggleSeguir}
          className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <Heart
            size={28}
            className={isFollowing ? "fill-orange-500 text-orange-500" : ""}
          />
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
          <MoreHorizontal size={28} />
        </button>
      </div>

      {/* Canciones */}
      <div className="px-8 pb-8">
        {songs.length === 0 ? (
          <div className="text-center py-12">
            <Music size={64} className="text-neutral-600 mx-auto mb-4" />
            <p className="text-xl text-neutral-400">
              Esta playlist aún no tiene canciones
            </p>
          </div>
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
                    // Recargar la playlist para obtener los datos actualizados
                    loadPlaylist();
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
