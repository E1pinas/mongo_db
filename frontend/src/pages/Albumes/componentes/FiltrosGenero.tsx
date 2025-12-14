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
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            generoSeleccionado === genero
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {genero}
        </button>
      ))}
    </div>
  );
};
