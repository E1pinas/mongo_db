import { ArrowLeft, Music } from "lucide-react";
import type { Playlist } from "../../../types";

interface CabeceraPlaylistProps {
  playlist: Playlist;
  onVolver: () => void;
}

export const CabeceraPlaylist = ({
  playlist,
  onVolver,
}: CabeceraPlaylistProps) => {
  const obtenerNombreCreador = (): string => {
    if (!playlist.creador) return "Usuario";
    if (typeof playlist.creador === "string") return "Usuario";
    return (
      playlist.creador.nombreArtistico ||
      playlist.creador.nick ||
      playlist.creador.nombre ||
      "Usuario"
    );
  };

  const obtenerDuracionTotal = (): string => {
    const canciones =
      playlist.canciones?.filter((c) => typeof c !== "string") || [];
    const total = canciones.reduce(
      (acc: number, cancion: any) => acc + (cancion.duracionSegundos || 0),
      0
    );
    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    return horas > 0 ? `${horas} h ${minutos} min` : `${minutos} min`;
  };

  const canciones =
    playlist.canciones?.filter((c) => typeof c !== "string") || [];

  return (
    <div className="relative overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-linear-to-br from-green-600/20 via-blue-600/20 to-purple-900/20 blur-3xl" />

      {/* Botón volver */}
      <button
        onClick={onVolver}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all text-white"
      >
        <ArrowLeft size={18} />
        <span className="font-semibold">Volver</span>
      </button>

      <div className="relative px-8 pt-20 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Portada con efecto */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-green-500 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <img
                src={playlist.portadaUrl || "/cover.jpg"}
                alt={playlist.titulo}
                className="relative w-64 h-64 rounded-2xl shadow-2xl object-cover border-4 border-white/10 group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
                <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
                  Playlist
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl font-black bg-linear-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                {playlist.titulo}
              </h1>

              {playlist.descripcion && (
                <p className="text-lg text-neutral-300 max-w-2xl font-light">
                  {playlist.descripcion}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                  <Music size={14} className="text-green-400" />
                  <span className="font-bold text-white">
                    {obtenerNombreCreador()}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                  <span className="text-neutral-400">
                    {canciones.length} canciones
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                  <span className="text-neutral-400">
                    {obtenerDuracionTotal()}
                  </span>
                </div>
                {playlist.esColaborativa && (
                  <div className="px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                    <span className="text-blue-400 font-semibold">
                      Colaborativa
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
