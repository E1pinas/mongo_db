import { X } from "lucide-react";

interface ModalDesbloquearUsuarioProps {
  mostrar: boolean;
  bloqueadoSeleccionado: any;
  actionLoading: string | null;
  onConfirmar: () => Promise<void>;
  onCancelar: () => void;
}

export const ModalDesbloquearUsuario = ({
  mostrar,
  bloqueadoSeleccionado,
  actionLoading,
  onConfirmar,
  onCancelar,
}: ModalDesbloquearUsuarioProps) => {
  if (!mostrar || !bloqueadoSeleccionado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Desbloquear usuario</h3>
          <button
            onClick={onCancelar}
            className="rounded-lg p-2 transition-colors hover:bg-neutral-800"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-neutral-400">
          ¿Estás seguro de que deseas desbloquear a{" "}
          <span className="font-semibold text-white">
            @{bloqueadoSeleccionado.usuario.nick}
          </span>
          ?
        </p>

        {bloqueadoSeleccionado.razon && (
          <div className="mb-4 rounded-lg border border-orange-500/30 bg-neutral-800/50 p-4">
            <p className="mb-2 text-sm text-neutral-400">Lo bloqueaste por:</p>
            <p className="font-medium text-orange-400">
              {bloqueadoSeleccionado.razon}
            </p>
          </div>
        )}

        <p className="mb-6 text-sm text-neutral-500">
          Una vez desbloqueado, podrá volver a ver tu perfil y enviarte
          solicitudes de amistad.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            disabled={actionLoading !== null}
            className="flex-1 rounded-lg bg-neutral-800 px-4 py-3 font-semibold transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={actionLoading !== null}
            className="flex-1 rounded-lg bg-orange-600 px-4 py-3 font-semibold transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {actionLoading === bloqueadoSeleccionado.usuario._id
              ? "Desbloqueando..."
              : "Desbloquear"}
          </button>
        </div>
      </div>
    </div>
  );
};
