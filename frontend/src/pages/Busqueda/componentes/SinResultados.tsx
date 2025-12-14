import { Search as SearchIcon } from "lucide-react";

interface SinResultadosProps {
  query: string;
}

export const SinResultados = ({ query }: SinResultadosProps) => {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
        <SearchIcon size={40} className="text-neutral-600" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No encontramos resultados</h3>
      <p className="text-neutral-400 mb-8">
        No hay coincidencias para{" "}
        <span className="text-white font-semibold">"{query}"</span>
      </p>
      <p className="text-sm text-neutral-500">
        Intenta con otras palabras clave
      </p>
    </div>
  );
};
