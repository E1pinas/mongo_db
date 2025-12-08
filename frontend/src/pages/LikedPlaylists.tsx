import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListMusic, Play, Heart } from "lucide-react";
import { musicService } from "../services/music.service";
import { useAuth } from "../contexts";
import type { Playlist, Usuario } from "../types";
import { LoadingSpinner, EmptyState, MediaGrid } from "../components/common";
import { PlaylistCard } from "../components/musica";

export default function LikedPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadLikedPlaylists();
  }, []);

  const loadLikedPlaylists = async () => {
    try {
      setLoading(true);
      const savedPlaylists = await musicService.getLikedPlaylists();
      // Filtrar solo las playlists que NO son creadas por el usuario
      const playlistsGuardadas = savedPlaylists.filter((playlist) => {
        const creadorId =
          typeof playlist.creador === "string"
            ? playlist.creador
            : playlist.creador?._id;
        return creadorId !== user?._id;
      });
      setPlaylists(playlistsGuardadas);
    } catch (error) {
      console.error("Error cargando playlists guardadas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlaylist = async (
    e: React.MouseEvent,
    playlistId: string
  ) => {
    e.stopPropagation();
    try {
      await musicService.toggleSeguirPlaylist(playlistId);
      // Recargar la lista
      loadLikedPlaylists();
    } catch (error) {
      console.error("Error eliminando playlist:", error);
    }
  };

  const getCreatorName = (creador: string | Usuario) => {
    if (typeof creador === "string") return "Usuario";
    return (
      creador.nombreArtistico || creador.nick || creador.nombre || "Usuario"
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-neutral-900 to-neutral-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-600/40 to-transparent p-8 pb-6">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-2xl">
            <ListMusic size={80} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">COLECCIÓN</p>
            <h1 className="text-6xl font-black mb-6">
              Playlists que me gustan
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {playlists.length}{" "}
                {playlists.length === 1 ? "playlist" : "playlists"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de playlists */}
      <div className="px-8 py-6">
        {playlists.length === 0 ? (
          <EmptyState
            icon={ListMusic}
            title="No tienes playlists guardadas"
            description="Guarda playlists que te gusten para verlas aquí"
          />
        ) : (
          <MediaGrid>
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onClick={() => navigate(`/playlist/${playlist._id}`)}
              />
            ))}
          </MediaGrid>
        )}
      </div>
    </div>
  );
}
