import { GENEROS_DISPONIBLES } from "../utils/constantes";

interface SelectorGenerosProps {
  generosSeleccionados: string[];
  onToggleGenero: (genero: string) => void;
}

export const SelectorGeneros = ({
  generosSeleccionados,
  onToggleGenero,
}: SelectorGenerosProps) => {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800">
      <label className="block text-sm font-bold mb-4 text-orange-400">
        Géneros
      </label>
      <div className="flex flex-wrap gap-3">
        {GENEROS_DISPONIBLES.map((genero) => (
          <button
            key={genero}
            type="button"
            onClick={() => onToggleGenero(genero)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 ${
              generosSeleccionados.includes(genero)
                ? "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
            }`}
          >
            {genero}
          </button>
        ))}
      </div>
    </div>
  );
};
