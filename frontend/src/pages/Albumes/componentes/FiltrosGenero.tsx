import { GENEROS_CON_TODO, type GeneroConTodo } from "../tipos";

interface FiltrosGeneroProps {
  generoSeleccionado: GeneroConTodo;
  onCambiarGenero: (genero: GeneroConTodo) => void;
}

export const FiltrosGenero = ({
  generoSeleccionado,
  onCambiarGenero,
}: FiltrosGeneroProps) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {GENEROS_CON_TODO.map((genero) => (
        <button
          key={genero}
          onClick={() => onCambiarGenero(genero)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            generoSeleccionado === genero
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
          }`}
        >
          {genero}
        </button>
      ))}
    </div>
  );
};
