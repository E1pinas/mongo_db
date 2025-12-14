import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CabeceraProps {
  titulo: string;
  error?: string;
}

export const Cabecera = ({ titulo, error }: CabeceraProps) => {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <h1 className="text-4xl font-bold mb-8">{titulo}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </>
  );
};
