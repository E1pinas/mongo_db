import { useNavigate } from "react-router-dom";
import type { ErrorAlbum, ConfiguracionErrorAlbum } from "../tipos";

interface VistaErrorAlbumProps {
  error: ErrorAlbum | null;
}

export const VistaErrorAlbum = ({ error }: VistaErrorAlbumProps) => {
  const navigate = useNavigate();

  const configuracionError: Record<string, ConfiguracionErrorAlbum> = {
    private: {
      icon: "🔒",
      title: "Álbum Privado",
      color: "yellow",
      gradient: "from-yellow-900/10 to-orange-900/10",
    },
    unavailable: {
      icon: "🚫",
      title: "Álbum No Disponible",
      color: "orange",
      gradient: "from-orange-900/10 to-red-900/10",
    },
    not_found: {
      icon: "❌",
      title: "Álbum No Encontrado",
      color: "red",
      gradient: "from-red-900/10 to-pink-900/10",
    },
  };

  const config = error
    ? configuracionError[error.tipo]
    : configuracionError.not_found;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div
          className={`bg-linear-to-br ${config.gradient} bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-8 border border-neutral-800 shadow-2xl`}
        >
          <div className="text-center space-y-6">
            <div className="text-6xl opacity-80">{config.icon}</div>

            <div className="space-y-2">
              <h2 className={`text-2xl font-bold text-${config.color}-500`}>
                {config.title}
              </h2>
              <p className="text-gray-400">
                {error?.mensaje || "Este álbum no existe o fue eliminado."}
              </p>
            </div>

            <button
              onClick={() => navigate("/albumes")}
              className="w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-all duration-200 border border-neutral-700"
            >
              Volver a Álbumes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
