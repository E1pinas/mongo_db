import React from "react";

interface PropsTarjetaEstadistica {
  icono: React.ReactNode;
  titulo: string;
  valor: number;
  subtitulo?: string;
  color: "azul" | "verde" | "morado" | "rojo";
}

const clasesColor = {
  azul: "from-blue-600 to-blue-500 shadow-blue-500/20",
  verde: "from-green-600 to-green-500 shadow-green-500/20",
  morado: "from-purple-600 to-purple-500 shadow-purple-500/20",
  rojo: "from-red-600 to-red-500 shadow-red-500/20",
};

export const TarjetaEstadistica: React.FC<PropsTarjetaEstadistica> = ({
  icono,
  titulo,
  valor,
  subtitulo,
  color,
}) => {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-400 text-sm font-medium uppercase tracking-wide">
            {titulo}
          </p>
          <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            {valor.toLocaleString()}
          </p>
          {subtitulo && (
            <p className="text-neutral-500 text-sm mt-2 font-medium">
              {subtitulo}
            </p>
          )}
        </div>
        <div
          className={`bg-gradient-to-br ${clasesColor[color]} p-4 rounded-xl shadow-lg`}
        >
          {icono}
        </div>
      </div>
    </div>
  );
};
