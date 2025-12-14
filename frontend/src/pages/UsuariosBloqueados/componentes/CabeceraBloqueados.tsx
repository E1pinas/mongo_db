import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ban } from "lucide-react";

interface CabeceraBloqueadosProps {
  totalBloqueados: number;
}

export const CabeceraBloqueados = ({
  totalBloqueados,
}: CabeceraBloqueadosProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
          <Ban size={24} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Usuarios bloqueados</h1>
          <p className="text-neutral-400">
            {totalBloqueados}{" "}
            {totalBloqueados === 1
              ? "usuario bloqueado"
              : "usuarios bloqueados"}
          </p>
        </div>
      </div>
    </div>
  );
};
