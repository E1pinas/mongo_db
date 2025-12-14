import { ListMusic, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Playlist } from "../../../types";

interface SeccionPlaylistsProps {
  playlists: Playlist[];
}

export const SeccionPlaylists = ({ playlists }: SeccionPlaylistsProps) => {
  const navigate = useNavigate();

  if (playlists.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-pink-600 flex items-center justify-center">
          <ListMusic size={20} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold">Playlists</h2>
        <span className="text-sm text-neutral-500">({playlists.length})</span>
      </div>

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
                <div className="w-full h-full flex items-center justify-center">
                  <ListMusic size={48} className="text-neutral-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center shadow-lg">
                <Play size={20} fill="white" className="ml-0.5" />
              </div>
            </div>
            <h3 className="font-semibold text-white truncate group-hover:text-pink-400 transition-colors">
              {playlist.titulo}
            </h3>
            <p className="text-sm text-neutral-400 truncate">
              {typeof playlist.creador === "string"
                ? "Usuario"
                : playlist.creador?.nombreArtistico ||
                  playlist.creador?.nick ||
                  "Usuario"}{" "}
              •{" "}
              {Array.isArray(playlist.canciones)
                ? playlist.canciones.length
                : 0}{" "}
              canciones
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
