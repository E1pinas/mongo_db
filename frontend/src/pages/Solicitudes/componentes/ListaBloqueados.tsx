import { Ban, UserX } from "lucide-react";

interface ListaBloqueadosProps {
  bloqueados: any[];
  actionLoading: string | null;
  onDesbloquear: (bloqueado: any) => void;
}

export const ListaBloqueados = ({
  bloqueados,
  actionLoading,
  onDesbloquear,
}: ListaBloqueadosProps) => {
  if (bloqueados.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800">
          <Ban size={32} className="text-neutral-400" />
        </div>
        <p className="mb-2 text-xl font-semibold">No hay usuarios bloqueados</p>
        <p className="text-neutral-400">
          Cuando bloquees a alguien, aparecerá aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bloqueados.map((bloqueado, index) => {
        const usuario = bloqueado.usuario;
        return (
          <div
            key={usuario._id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-fade-in rounded-2xl border border-neutral-700/50 bg-linear-to-r from-neutral-900/80 to-neutral-800/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-800 opacity-60">
                {usuario.avatarUrl ? (
                  <img
                    src={usuario.avatarUrl}
                    alt={usuario.nick}
                    className="h-full w-full object-cover grayscale"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-red-500 to-orange-600">
                    <span className="text-lg font-bold text-white">
                      {usuario.nick.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-300">
                  {usuario.nombreArtistico || usuario.nick}
                </p>
                <p className="truncate text-sm text-neutral-400">
                  @{usuario.nick}
                </p>
                {bloqueado.razon && (
                  <p className="mt-1 line-clamp-2 text-sm text-orange-400">
                    Razón: {bloqueado.razon}
                  </p>
                )}
                {bloqueado.fechaBloqueo && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Bloqueado el{" "}
                    {new Date(bloqueado.fechaBloqueo).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Botón desbloquear */}
              <button
                onClick={() => onDesbloquear(bloqueado)}
                disabled={actionLoading === usuario._id}
                className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-700 disabled:opacity-50"
              >
                {actionLoading === usuario._id ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Desbloqueando...
                  </>
                ) : (
                  <>
                    <UserX size={16} />
                    Desbloquear
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
