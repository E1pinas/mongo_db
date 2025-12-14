import { Search as SearchIcon } from "lucide-react";

interface BarraBusquedaProps {
  query: string;
  totalResults: number;
  alBuscar: (query: string) => void;
}

export const BarraBusqueda = ({
  query,
  totalResults,
  alBuscar,
}: BarraBusquedaProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
      <div className="relative px-6 pt-8 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <SearchIcon size={24} className="text-white" />
          </div>
          <h1 className="text-5xl font-black bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Explorar
          </h1>
        </div>

        <div className="relative max-w-3xl">
          <input
            type="text"
            value={query}
            onChange={(e) => alBuscar(e.target.value)}
            placeholder="Busca canciones, artistas, álbumes..."
            className="w-full px-6 py-5 pl-16 pr-32 bg-neutral-800/50 backdrop-blur-xl text-white rounded-2xl border-2 border-neutral-700 focus:border-purple-500 focus:outline-none transition-all text-lg placeholder:text-neutral-500"
            autoFocus
          />
          <SearchIcon
            className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400"
            size={24}
          />
          {query && (
            <>
              <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                {totalResults} resultados
              </div>
              <button
                onClick={() => alBuscar("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors group"
                aria-label="Limpiar búsqueda"
              >
                <svg
                  className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
