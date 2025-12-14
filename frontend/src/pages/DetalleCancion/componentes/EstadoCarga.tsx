import { X } from "lucide-react";

interface EstadoCargaProps {
  mensaje: string;
  esError?: boolean;
  alCerrar: () => void;
}

export const EstadoCarga = ({
  mensaje,
  esError = false,
  alCerrar,
}: EstadoCargaProps) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-neutral-900 rounded-2xl p-8 max-w-md w-full mx-4 ${
          esError ? "border border-red-500/30" : ""
        }`}
      >
        <div className="flex flex-col items-center">
          {esError ? (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <X size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">
                {mensaje.includes("espera")
                  ? "Por favor espera"
                  : "Canción no encontrada"}
              </h2>
              <p className="text-neutral-400 mb-6 text-center">{mensaje}</p>
              <button
                onClick={alCerrar}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full font-semibold transition-colors"
              >
                {mensaje.includes("espera") ? "Entendido" : "Volver"}
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-neutral-400">{mensaje}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
