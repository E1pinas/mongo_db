import { useUsuariosBloqueados, useDesbloquearUsuario } from "./hooks";
import {
  CabeceraBloqueados,
  TarjetaUsuarioBloqueado,
  EstadoVacio,
  InfoBloqueo,
} from "./componentes";

export default function UsuariosBloqueados() {
  const { blockedUsers, setBlockedUsers, cargando } = useUsuariosBloqueados();
  const { unblockingId, manejarDesbloquear } = useDesbloquearUsuario(
    blockedUsers,
    setBlockedUsers
  );

  if (cargando) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <CabeceraBloqueados totalBloqueados={blockedUsers.length} />

        {blockedUsers.length === 0 ? (
          <EstadoVacio />
        ) : (
          <>
            <div className="space-y-3">
              {blockedUsers.map((bloqueado) => (
                <TarjetaUsuarioBloqueado
                  key={bloqueado.usuario._id}
                  bloqueado={bloqueado}
                  unblockingId={unblockingId}
                  onDesbloquear={manejarDesbloquear}
                />
              ))}
            </div>
            <InfoBloqueo />
          </>
        )}
      </div>
    </div>
  );
}
