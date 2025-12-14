import { UserX } from "lucide-react";

interface TarjetaUsuarioBloqueadoProps {
  bloqueado: any;
  unblockingId: string | null;
  onDesbloquear: (bloqueado: any) => void;
}

export const TarjetaUsuarioBloqueado = ({
  bloqueado,
  unblockingId,
  onDesbloquear,
}: TarjetaUsuarioBloqueadoProps) => {
  const usuario = bloqueado.usuario;

  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 hover:border-neutral-700 transition-colors">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 shrink-0">
          {usuario.avatarUrl ? (
            <img
              src={usuario.avatarUrl}
              alt={usuario.nick}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
              <span className="text-xl font-bold text-white">
                {usuario.nick.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {usuario.nombreArtistico || usuario.nick}
          </h3>
          <p className="text-sm text-neutral-400 truncate">@{usuario.nick}</p>
          {bloqueado.fechaBloqueo && (
            <p className="text-xs text-neutral-500 mt-1">
              Bloqueado el{" "}
              {new Date(bloqueado.fechaBloqueo).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Botón desbloquear */}
        <button
          onClick={() => onDesbloquear(bloqueado)}
          disabled={unblockingId === usuario._id}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {unblockingId === usuario._id ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
};
