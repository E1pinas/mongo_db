import { Play, ListMusic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Playlist } from "../../../types";

interface SeccionPlaylistsProps {
  playlists: Playlist[];
}

export const SeccionPlaylists = ({ playlists }: SeccionPlaylistsProps) => {
  const navigate = useNavigate();

  if (playlists.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <ListMusic size={20} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold">Playlists Populares</h2>
        </div>
        <button
          onClick={() => navigate("/playlists")}
          className="text-neutral-400 hover:text-white font-semibold transition-colors"
        >
          Ver todas →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            onClick={() => navigate(`/playlist/${playlist._id}`)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-neutral-900">
              <img
                src={playlist.portadaUrl || "/cover.jpg"}
                alt={playlist.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/cover.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center shadow-lg">
                <Play size={20} fill="white" className="ml-0.5" />
              </div>
            </div>
            <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
              {playlist.titulo}
            </h3>
            <p className="text-sm text-neutral-400 truncate">
              {typeof playlist.creador === "object"
                ? playlist.creador?.nombreArtistico ||
                  playlist.creador?.nick ||
                  "Usuario"
                : "Usuario"}
            </p>
            {playlist.seguidores && playlist.seguidores.length > 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                {playlist.seguidores.length} seguidores
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
