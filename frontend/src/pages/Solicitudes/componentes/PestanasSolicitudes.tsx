import type { TipoPestana } from "../tipos";
import { UserPlus, Users, Ban } from "lucide-react";

interface PestanasSolicitudesProps {
  pestanaActiva: TipoPestana;
  onCambiarPestana: (pestana: TipoPestana) => void;
  contadorSolicitudes: number;
  contadorAmigos: number;
  contadorBloqueados: number;
}

export const PestanasSolicitudes = ({
  pestanaActiva,
  onCambiarPestana,
  contadorSolicitudes,
  contadorAmigos,
  contadorBloqueados,
}: PestanasSolicitudesProps) => {
  return (
    <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onCambiarPestana("recibidas")}
          className={`flex-1 rounded-xl px-4 py-3 font-bold transition-all duration-300 ${
            pestanaActiva === "recibidas"
              ? "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <UserPlus size={20} />
            <span>Solicitudes</span>
            {contadorSolicitudes > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  pestanaActiva === "recibidas"
                    ? "bg-white/20"
                    : "bg-orange-500/20 text-orange-400"
                }`}
              >
                {contadorSolicitudes}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => onCambiarPestana("amigos")}
          className={`flex-1 rounded-xl px-4 py-3 font-bold transition-all duration-300 ${
            pestanaActiva === "amigos"
              ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users size={20} />
            <span>Amigos</span>
            {contadorAmigos > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  pestanaActiva === "amigos"
                    ? "bg-white/20"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {contadorAmigos}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => onCambiarPestana("bloqueados")}
          className={`flex-1 rounded-xl px-4 py-3 font-bold transition-all duration-300 ${
            pestanaActiva === "bloqueados"
              ? "bg-linear-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30"
              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Ban size={20} />
            <span>Bloqueados</span>
            {contadorBloqueados > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  pestanaActiva === "bloqueados"
                    ? "bg-white/20"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {contadorBloqueados}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
