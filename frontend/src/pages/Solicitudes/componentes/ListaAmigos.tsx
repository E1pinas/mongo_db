import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import type { Usuario } from "../../../types";
import ConnectionStatus from "../../../components/common/ConnectionStatus";

interface ListaAmigosProps {
  amigos: Usuario[];
  actionLoading: string | null;
  onEliminar: (amigoId: string, nick: string) => void;
}

export const ListaAmigos = ({
  amigos,
  actionLoading,
  onEliminar,
}: ListaAmigosProps) => {
  const navigate = useNavigate();

  if (amigos.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800">
          <Users size={32} className="text-neutral-400" />
        </div>
        <p className="mb-2 text-xl font-semibold">Aún no tienes amigos</p>
        <p className="text-neutral-400">
          Busca usuarios y envíales solicitudes de amistad
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {amigos.map((amigo, index) => (
        <div
          key={amigo._id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-fade-in rounded-2xl border border-neutral-700/50 bg-linear-to-r from-neutral-900/80 to-neutral-800/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              onClick={() => navigate(`/perfil/${amigo.nick}`)}
              className="h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-full bg-neutral-800 transition-all hover:ring-2 hover:ring-orange-500"
            >
              {amigo.avatarUrl ? (
                <img
                  src={amigo.avatarUrl}
                  alt={amigo.nick}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
                  <span className="text-lg font-bold text-white">
                    {amigo.nick.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p
                onClick={() => navigate(`/perfil/${amigo.nick}`)}
                className="cursor-pointer truncate font-semibold transition-colors hover:text-orange-500"
              >
                {amigo.nombreArtistico || amigo.nick}
              </p>
              <p className="truncate text-sm text-neutral-400">@{amigo.nick}</p>
              <ConnectionStatus
                isOnline={amigo.estaConectado}
                lastConnection={amigo.ultimaConexion}
              />
            </div>

            {/* Botón eliminar */}
            <button
              onClick={() => onEliminar(amigo._id, amigo.nick)}
              disabled={actionLoading === amigo._id}
              className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {actionLoading === amigo._id ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
