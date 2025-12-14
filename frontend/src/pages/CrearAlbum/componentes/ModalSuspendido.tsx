import { Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Usuario } from "../../../types";

interface ModalSuspendidoProps {
  mostrar: boolean;
  usuario: Usuario | null;
  alCerrar: () => void;
}

export const ModalSuspendido = ({
  mostrar,
  usuario,
  alCerrar,
}: ModalSuspendidoProps) => {
  const navigate = useNavigate();

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-700">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-yellow-600/20 p-3 rounded-full">
            <Ban className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              Tu cuenta está suspendida
            </h3>
            <p className="text-gray-300 mb-3">
              No puedes crear álbumes mientras tu cuenta esté suspendida.
            </p>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">
                Razón de la suspensión:
              </p>
              <p className="text-yellow-400 font-medium">
                {(usuario as any)?.razonSuspension ||
                  "Violación de normas comunitarias"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            alCerrar();
            navigate("/", { replace: true });
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};
