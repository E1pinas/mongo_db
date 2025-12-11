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
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      {/* Header con diseño único */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="relative px-6 pt-8 pb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-xl">
              <ListMusic size={32} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-green-400 font-semibold mb-1">
                TU COLECCIÓN
              </p>
              <h1 className="text-5xl font-black bg-linear-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Playlists Guardadas
              </h1>
            </div>
          </div>

          <div className="px-4 py-2 bg-neutral-800/50 backdrop-blur-sm rounded-full text-sm inline-block">
            <span className="text-neutral-400">Total:</span>
            <span className="ml-2 font-bold text-white">
              {playlists.length}{" "}
              {playlists.length === 1 ? "playlist" : "playlists"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de playlists */}
      <div className="px-6 pb-20">
        {playlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
              <ListMusic size={48} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              No tienes playlists guardadas
            </h3>
            <p className="text-neutral-400">
              Guarda playlists que te gusten para verlas aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-neutral-900">
                  {playlist.portadaUrl ? (
                    <img
                      src={playlist.portadaUrl}
                      alt={playlist.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-green-500 to-blue-600">
                      <ListMusic size={48} className="text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center shadow-lg">
                    <Play size={20} fill="white" className="ml-0.5" />
                  </div>
                </div>
                <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                  {playlist.titulo}
                </h3>
                <p className="text-sm text-neutral-400 truncate">
                  {getCreatorName(playlist.creador)} •{" "}
                  {Array.isArray(playlist.canciones)
                    ? playlist.canciones.length
                    : 0}{" "}
                  canciones
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
