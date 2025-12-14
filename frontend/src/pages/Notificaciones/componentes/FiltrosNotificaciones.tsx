import type { TipoFiltro } from "../tipos";

interface FiltrosNotificacionesProps {
  filtroActivo: TipoFiltro;
  onCambiarFiltro: (filtro: TipoFiltro) => void;
}

export const FiltrosNotificaciones = ({
  filtroActivo,
  onCambiarFiltro,
}: FiltrosNotificacionesProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <button
        onClick={() => onCambiarFiltro("todas")}
        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
          filtroActivo === "todas"
            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
            : "bg-neutral-800/50 backdrop-blur-sm text-neutral-300 hover:bg-neutral-700/50"
        }`}
      >
        🔔 Todas
      </button>
      <button
        onClick={() => onCambiarFiltro("musica")}
        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
          filtroActivo === "musica"
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
            : "bg-neutral-800/50 backdrop-blur-sm text-neutral-300 hover:bg-neutral-700/50"
        }`}
      >
        🎵 Música
      </button>
      <button
        onClick={() => onCambiarFiltro("social")}
        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
          filtroActivo === "social"
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
            : "bg-neutral-800/50 backdrop-blur-sm text-neutral-300 hover:bg-neutral-700/50"
        }`}
      >
        👥 Social
      </button>
      <button
        onClick={() => onCambiarFiltro("sistema")}
        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
          filtroActivo === "sistema"
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30"
            : "bg-neutral-800/50 backdrop-blur-sm text-neutral-300 hover:bg-neutral-700/50"
        }`}
      >
        ⚙️ Sistema
      </button>
    </div>
  );
};
