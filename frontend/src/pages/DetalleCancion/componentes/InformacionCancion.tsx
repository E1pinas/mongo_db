import { Music } from "lucide-react";
import { formatDuration } from "../../../utils/formatHelpers";
import type { Cancion } from "../../../types";

interface InformacionCancionProps {
  cancion: Cancion;
}

export const InformacionCancion = ({ cancion }: InformacionCancionProps) => {
  const obtenerNombreArtistas = () => {
    if (Array.isArray(cancion.artistas)) {
      return cancion.artistas
        .map((a: any) =>
          typeof a === "string" ? a : a.nombreArtistico || a.nick || a.nombre
        )
        .join(", ");
    }
    return "Artista desconocido";
  };

  return (
    <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
      {/* Portada */}
      <div className="relative mb-4 sm:mb-6">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl">
          {cancion.portadaUrl ? (
            <img
              src={cancion.portadaUrl}
              alt={cancion.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
              <Music size={48} className="sm:hidden text-neutral-500" />
              <Music size={64} className="hidden sm:block text-neutral-500" />
            </div>
          )}
        </div>
      </div>

      {/* Info básica */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white px-2">
        {cancion.titulo}
      </h1>
      <p className="text-base sm:text-lg text-neutral-300 mb-1 font-medium px-2">
        {obtenerNombreArtistas()}
      </p>
      <p className="text-xs sm:text-sm text-neutral-500">
        {formatDuration(cancion.duracionSegundos)}
      </p>

      {/* Géneros */}
      {cancion.generos && cancion.generos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mt-3 sm:mt-4 px-2">
          {cancion.generos.map((genero) => (
            <span
              key={genero}
              className="px-2.5 sm:px-3 py-1 bg-neutral-800/70 rounded-full text-xs font-medium text-neutral-300"
            >
              {genero}
            </span>
          ))}
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-2 mt-3 sm:mt-4">
        {cancion.esPrivada && (
          <span className="px-2.5 sm:px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-400">
            Privada
          </span>
        )}
        {cancion.esExplicita && (
          <span className="px-2.5 sm:px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs font-medium text-red-400">
            Explícita
          </span>
        )}
      </div>
    </div>
  );
};
