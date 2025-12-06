import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListMusic, Play, Heart } from "lucide-react";
import { musicService } from "../services/music.service";
import { useAuth } from "../contexts";
import type { Playlist, Usuario } from "../types";

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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
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
          <div className="text-center py-16">
            <ListMusic size={64} className="mx-auto mb-4 text-neutral-600" />
            <h3 className="text-2xl font-bold mb-2">
              No tienes playlists guardadas
            </h3>
            <p className="text-neutral-400">
              Guarda playlists que te gusten para verlas aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="group bg-neutral-800/40 hover:bg-neutral-800 p-4 rounded-lg transition-all cursor-pointer"
              >
                <div className="relative mb-4">
                  <img
                    src={
                      playlist.portadaUrl && playlist.portadaUrl.trim() !== ""
                        ? playlist.portadaUrl
                        : "/cover.jpg"
                    }
                    alt={playlist.titulo}
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/cover.jpg";
                    }}
                  />
                  <button
                    onClick={(e) => handleRemovePlaylist(e, playlist._id)}
                    className="absolute top-2 right-2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Heart
                      size={20}
                      className="fill-orange-500 text-orange-500"
                    />
                  </button>
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 transition-all shadow-lg">
                    <Play size={20} className="text-white ml-1" fill="white" />
                  </button>
                </div>
                <h3 className="font-semibold text-white truncate mb-1">
                  {playlist.titulo}
                </h3>
                <p className="text-sm text-neutral-400 truncate">
                  {getCreatorName(playlist.creador)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
