import { X } from "lucide-react";
import type { DatosEliminacionAmigo } from "../tipos";

interface ModalEliminarAmigoProps {
  mostrar: boolean;
  amigoParaEliminar: DatosEliminacionAmigo | null;
  actionLoading: string | null;
  onConfirmar: () => Promise<void>;
  onCancelar: () => void;
}

export const ModalEliminarAmigo = ({
  mostrar,
  amigoParaEliminar,
  actionLoading,
  onConfirmar,
  onCancelar,
}: ModalEliminarAmigoProps) => {
  if (!mostrar || !amigoParaEliminar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Eliminar amigo</h3>
          <button
            onClick={onCancelar}
            className="rounded-lg p-2 transition-colors hover:bg-neutral-800"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-neutral-400">
          ¿Estás seguro de que deseas eliminar a{" "}
          <span className="font-semibold text-white">
            @{amigoParaEliminar.nick}
          </span>{" "}
          de tu lista de amigos?
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
            className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading === amigoParaEliminar.id
              ? "Eliminando..."
              : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};
