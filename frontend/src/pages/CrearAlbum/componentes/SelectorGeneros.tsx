import { generosDisponibles } from "../data/generos";

interface SelectorGenerosProps {
  generosSeleccionados: string[];
  alToggle: (genero: string) => void;
}

export const SelectorGeneros = ({
  generosSeleccionados,
  alToggle,
}: SelectorGenerosProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Géneros musicales
      </label>
      <div className="flex flex-wrap gap-2">
        {generosDisponibles.map((genero) => (
          <button
            key={genero}
            type="button"
            onClick={() => alToggle(genero)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              generosSeleccionados.includes(genero)
                ? "bg-blue-500 text-white"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
          >
            {genero.charAt(0).toUpperCase() + genero.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};
