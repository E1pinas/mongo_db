import { Button } from "../../../components/common";

interface BarraAccionesProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onSubir: () => void;
  onReproducirTodo: () => void;
  mostrarReproducirTodo: boolean;
}

export const BarraAcciones = ({
  searchQuery,
  onSearch,
  onSubir,
  onReproducirTodo,
  mostrarReproducirTodo,
}: BarraAccionesProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar en mis canciones..."
          className="w-full px-4 py-3 pl-10 bg-neutral-800/60 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      <Button onClick={onSubir} variant="secondary">
        Subir Canción
      </Button>
      {mostrarReproducirTodo && (
        <Button onClick={onReproducirTodo}>Reproducir todo</Button>
      )}
    </div>
  );
};
