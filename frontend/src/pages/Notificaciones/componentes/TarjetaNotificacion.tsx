import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Notificacion } from "../../../types";
import { IconoNotificacion } from "./IconoNotificacion";

interface TarjetaNotificacionProps {
  notificacion: Notificacion;
  indice: number;
  onClickNotificacion: (notif: Notificacion) => void;
  onEliminarNotificacion: (id: string) => void;
}

export const TarjetaNotificacion = ({
  notificacion,
  indice,
  onClickNotificacion,
  onEliminarNotificacion,
}: TarjetaNotificacionProps) => {
  const esPerfil =
    notificacion.tipo === "nuevo_seguidor" ||
    notificacion.tipo === "solicitud_amistad" ||
    notificacion.tipo === "amistad_aceptada";

  return (
    <div
      onClick={() => onClickNotificacion(notificacion)}
      style={{ animationDelay: `${indice * 50}ms` }}
      className={`bg-linear-to-r from-neutral-900/80 to-neutral-800/60 backdrop-blur-sm p-5 rounded-xl hover:from-neutral-800/90 hover:to-neutral-700/70 transition-all duration-300 cursor-pointer relative group border ${
        !notificacion.leida
          ? "border-l-4 border-orange-500 shadow-lg shadow-orange-500/20 animate-fade-in"
          : "border-neutral-800/50 hover:border-neutral-700"
      } ${
        esPerfil
          ? "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
          : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <IconoNotificacion notificacion={notificacion} />
          {!notificacion.leida && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-neutral-900 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`${
              !notificacion.leida
                ? "font-bold text-white"
                : "font-medium text-neutral-200"
            } mb-1.5 leading-relaxed`}
          >
            {notificacion.mensaje}
          </p>
          <span className="text-xs text-neutral-500 font-medium">
            {formatDistanceToNow(new Date(notificacion.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEliminarNotificacion(notificacion._id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-neutral-400"
          title="Eliminar notificación"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
