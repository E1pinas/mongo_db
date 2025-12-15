import { useNavigate } from "react-router-dom";
import { ListMusic, Play } from "lucide-react";
import type { Playlist, Usuario } from "../../../types";

interface GridPlaylistsProps {
  playlists: Playlist[];
}

export function GridPlaylists({ playlists }: GridPlaylistsProps) {
  const navigate = useNavigate();

  const obtenerNombreCreador = (creador: string | Usuario) => {
    if (typeof creador === "string") return "Usuario";
    return (
      creador.nombreArtistico || creador.nick || creador.nombre || "Usuario"
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center shadow-lg">
              <Play size={20} fill="white" className="ml-0.5" />
            </div>
          </div>
          <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
            {playlist.titulo}
          </h3>
          <p className="text-sm text-neutral-400 truncate">
            {obtenerNombreCreador(playlist.creador)} •{" "}
            {Array.isArray(playlist.canciones) ? playlist.canciones.length : 0}{" "}
            canciones
          </p>
        </div>
      ))}
    </div>
  );
}
