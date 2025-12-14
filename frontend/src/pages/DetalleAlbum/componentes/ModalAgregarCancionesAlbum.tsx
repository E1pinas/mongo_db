import { Search, X, Plus } from "lucide-react";
import type { Cancion } from "../../../types";

interface ModalAgregarCancionesAlbumProps {
  tituloAlbum: string;
  consulta: string;
  resultados: Cancion[];
  buscando: boolean;
  agregandoCancionId: string | null;
  idsCancionesSeleccionadas: Set<string>;
  agregandoMultiple: boolean;
  onCerrar: () => void;
  onCambiarConsulta: (consulta: string) => void;
  onBuscar: () => void;
  onAgregarCancion: (cancionId: string) => void;
  onToggleSeleccion: (cancionId: string) => void;
  onAgregarSeleccionadas: () => void;
}

export const ModalAgregarCancionesAlbum = ({
  tituloAlbum,
  consulta,
  resultados,
  buscando,
  agregandoCancionId,
  idsCancionesSeleccionadas,
  agregandoMultiple,
  onCerrar,
  onCambiarConsulta,
  onBuscar,
  onAgregarCancion,
  onToggleSeleccion,
  onAgregarSeleccionadas,
}: ModalAgregarCancionesAlbumProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            Agregar canciones a "{tituloAlbum}"
          </h3>
          <button
            onClick={onCerrar}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={consulta}
            onChange={(e) => onCambiarConsulta(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onBuscar()}
            placeholder="Buscar tus canciones..."
            className="flex-1 px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50"
          />
          <button
            onClick={onBuscar}
            disabled={buscando || !consulta.trim()}
            className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Search size={18} />
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {resultados.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-400">
                {resultados.length} canción
                {resultados.length !== 1 ? "es" : ""} encontrada
                {resultados.length !== 1 ? "s" : ""}
              </p>
              {idsCancionesSeleccionadas.size > 0 && (
                <button
                  onClick={onAgregarSeleccionadas}
                  disabled={agregandoMultiple}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  <Plus size={18} />
                  {agregandoMultiple
                    ? "Agregando..."
                    : `Agregar ${idsCancionesSeleccionadas.size} seleccionada${
                        idsCancionesSeleccionadas.size !== 1 ? "s" : ""
                      }`}
                </button>
              )}
            </div>
            {resultados.map((cancion) => (
              <div
                key={cancion._id}
                className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={idsCancionesSeleccionadas.has(cancion._id)}
                  onChange={() => onToggleSeleccion(cancion._id)}
                  className="w-5 h-5 rounded border-2 border-neutral-600 bg-neutral-800 checked:bg-green-500 checked:border-green-500 cursor-pointer"
                />
                {cancion.portadaUrl ? (
                  <img
                    src={cancion.portadaUrl}
                    alt={cancion.titulo}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-linear-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {cancion.titulo}
                  </p>
                  <p className="text-sm text-neutral-400 truncate">
                    {cancion.artistas
                      ?.map((a) =>
                        typeof a === "string" ? "Artista" : a.nick || a.nombre
                      )
                      .join(", ") || "Artista desconocido"}
                  </p>
                </div>

                <button
                  onClick={() => onAgregarCancion(cancion._id)}
                  disabled={agregandoCancionId === cancion._id}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus size={16} />
                  {agregandoCancionId === cancion._id
                    ? "Agregando..."
                    : "Agregar"}
                </button>
              </div>
            ))}
          </div>
        ) : consulta && !buscando ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">
              No se encontraron canciones tuyas con "{consulta}"
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Solo puedes agregar tus propias canciones a tus álbumes
            </p>
          </div>
        ) : !consulta ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-neutral-600 mb-4" />
            <p className="text-neutral-400">
              Busca tus canciones para agregarlas al álbum
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Solo puedes agregar canciones donde seas artista
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
