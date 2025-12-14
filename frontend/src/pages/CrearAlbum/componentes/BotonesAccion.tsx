import { useNavigate } from "react-router-dom";

interface BotonesAccionProps {
  isSubmitting: boolean;
  tituloVacio: boolean;
}

export const BotonesAccion = ({
  isSubmitting,
  tituloVacio,
}: BotonesAccionProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 pt-4">
      <button
        type="submit"
        disabled={isSubmitting || tituloVacio}
        className="flex-1 px-6 py-3 bg-blue-500 rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Creando álbum..." : "Crear álbum"}
      </button>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="px-6 py-3 bg-neutral-800 rounded-full font-semibold hover:bg-neutral-700 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
};
