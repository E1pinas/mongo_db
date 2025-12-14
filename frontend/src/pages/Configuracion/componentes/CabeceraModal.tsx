import { X } from "lucide-react";

interface CabeceraModalProps {
  guardando: boolean;
  alGuardar: () => void;
  alCerrar: () => void;
}

export const CabeceraModal = ({
  guardando,
  alGuardar,
  alCerrar,
}: CabeceraModalProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
      <div className="flex gap-4">
        <button
          type="submit"
          onClick={alGuardar}
          disabled={guardando}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={alCerrar}
          disabled={guardando}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
