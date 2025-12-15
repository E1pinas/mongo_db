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
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Editar Perfil
      </h2>
      <div className="flex gap-3">
        <button
          type="submit"
          onClick={alGuardar}
          disabled={guardando}
          className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
        >
          <span className="relative z-10">
            {guardando ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              "Guardar"
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          type="button"
          onClick={alCerrar}
          disabled={guardando}
          className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-all disabled:opacity-50 border border-neutral-800 hover:border-neutral-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
