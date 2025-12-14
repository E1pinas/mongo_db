import { useNavigate } from "react-router-dom";

interface BotonesAccionProps {
  subiendo: boolean;
  deshabilitado: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const BotonesAccion = ({
  subiendo,
  deshabilitado,
  onSubmit,
}: BotonesAccionProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4 pt-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={subiendo}
        className="px-8 py-4 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        Cancelar
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={deshabilitado}
        className="flex-1 px-8 py-4 rounded-xl font-bold bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-500/25"
      >
        {subiendo ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Subiendo...
          </span>
        ) : (
          "Subir Canción"
        )}
      </button>
    </div>
  );
};
