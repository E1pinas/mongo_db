import { useNavigate } from "react-router-dom";
import { UserCheck, UserX, Ban, Clock } from "lucide-react";
import type { SolicitudAmistad } from "../../../services/friendship.service";
import type { Usuario } from "../../../types";
import { formatTimeAgo } from "../../../utils/dateFormat";
import { UserPlus } from "lucide-react";

interface ListaSolicitudesRecibidasProps {
  solicitudes: SolicitudAmistad[];
  actionLoading: string | null;
  onAceptar: (solicitudId: string) => Promise<void>;
  onRechazar: (solicitudId: string) => Promise<void>;
  onBloquear: (solicitudId: string) => Promise<void>;
}

export const ListaSolicitudesRecibidas = ({
  solicitudes,
  actionLoading,
  onAceptar,
  onRechazar,
  onBloquear,
}: ListaSolicitudesRecibidasProps) => {
  const navigate = useNavigate();

  if (solicitudes.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800">
          <UserPlus size={32} className="text-neutral-400" />
        </div>
        <p className="mb-2 text-xl font-semibold">
          No tienes solicitudes pendientes
        </p>
        <p className="text-neutral-400">
          Las nuevas solicitudes de amistad aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {solicitudes.map((solicitud, index) => {
        const solicitante = solicitud.solicitante as Usuario;
        return (
          <div
            key={solicitud._id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-fade-in rounded-2xl border border-neutral-700/50 bg-linear-to-r from-neutral-900/80 to-neutral-800/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                onClick={() => navigate(`/perfil/${solicitante.nick}`)}
                className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full bg-neutral-800 transition-all duration-300 hover:scale-110 hover:ring-4 hover:ring-orange-500/50"
              >
                {solicitante.avatarUrl ? (
                  <img
                    src={solicitante.avatarUrl}
                    alt={solicitante.nick}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
                    <span className="text-xl font-bold text-white">
                      {solicitante.nick.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p
                  onClick={() => navigate(`/perfil/${solicitante.nick}`)}
                  className="mb-1 cursor-pointer truncate text-lg font-semibold transition-colors hover:text-orange-500"
                >
                  {solicitante.nombreArtistico || solicitante.nick}
                </p>
                <p className="mb-1 truncate text-sm text-neutral-400">
                  @{solicitante.nick}
                </p>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <Clock size={12} />
                  {formatTimeAgo(solicitud.createdAt)}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => onAceptar(solicitud._id)}
                  disabled={actionLoading === solicitud._id}
                  className="flex items-center gap-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                >
                  <UserCheck size={16} />
                  Aceptar
                </button>
                <button
                  onClick={() => onRechazar(solicitud._id)}
                  disabled={actionLoading === solicitud._id}
                  className="flex items-center gap-2 rounded-xl bg-neutral-700/80 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-neutral-600 disabled:opacity-50"
                >
                  <UserX size={16} />
                  Rechazar
                </button>
                <button
                  onClick={() => onBloquear(solicitud._id)}
                  disabled={actionLoading === solicitud._id}
                  className="rounded-xl border border-red-500/30 bg-red-500/20 p-2.5 text-red-400 transition-all duration-300 hover:scale-105 hover:border-transparent hover:bg-linear-to-r hover:from-red-500 hover:to-pink-500 hover:text-white disabled:opacity-50"
                  title="Bloquear usuario"
                >
                  <Ban size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
