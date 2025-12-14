import { Sparkles, TrendingUp } from "lucide-react";
import { generosPopulares } from "../data/generos";

interface EstadoInicialProps {
  alSeleccionarGenero: (genero: string) => void;
}

export const EstadoInicial = ({ alSeleccionarGenero }: EstadoInicialProps) => {
  return (
    <div>
      <div className="text-center py-12 mb-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Sparkles size={40} className="text-purple-400" />
        </div>
        <h3 className="text-3xl font-bold mb-3">Descubre nueva música</h3>
        <p className="text-neutral-400 text-lg">
          Busca tus artistas, canciones y álbumes favoritos
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" />
          Géneros populares
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {generosPopulares.map((genre) => (
            <button
              key={genre.name}
              onClick={() => alSeleccionarGenero(genre.name)}
              className={`px-6 py-4 bg-linear-to-br ${genre.color} rounded-xl text-white font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-xl`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
