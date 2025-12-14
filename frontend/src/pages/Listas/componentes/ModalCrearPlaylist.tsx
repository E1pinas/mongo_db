import { X, Upload, Search } from "lucide-react";
import type { Cancion } from "../../../types";
import { useCrearPlaylist } from "../hooks/useCrearPlaylist";

interface ModalCrearPlaylistProps {
  mostrar: boolean;
  onCerrar: () => void;
  onPlaylistCreada: () => Promise<void>;
}

export const ModalCrearPlaylist = ({
  mostrar,
  onCerrar,
  onPlaylistCreada,
}: ModalCrearPlaylistProps) => {
  const {
    nombre,
    descripcion,
    esPublica,
    esColaborativa,
    portadaPreview,
    cancionesBuscadas,
    selectedSongs,
    searchQuery,
    buscando,
    creando,
    error,
    setNombre,
    setDescripcion,
    setEsPublica,
    setEsColaborativa,
    setPortadaFile,
    setPortadaPreview,
    setSearchQuery,
    manejarCambioPortada,
    toggleCancion,
    buscarCanciones,
    resetearFormulario,
    crearPlaylist,
  } = useCrearPlaylist({ onPlaylistCreada });

  const cerrarYResetear = () => {
    onCerrar();
    resetearFormulario();
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    await crearPlaylist(e);
    if (!error && !creando) {
      cerrarYResetear();
    }
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-linear-to-br from-neutral-900 via-neutral-900 to-neutral-800 shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 blur-xl" />
          <div className="relative border-b border-neutral-800/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-blue-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="bg-linear-to-r from-green-400 to-blue-400 bg-clip-text text-2xl font-black text-transparent">
                    Nueva Playlist
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Organiza tu música favorita
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarYResetear}
                disabled={creando}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800/80 transition-colors hover:bg-neutral-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 backdrop-blur-sm">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={manejarSubmit} className="space-y-6">
            {/* Portada */}
            <div>
              <label className="mb-3 block text-sm font-bold text-neutral-300">
                Portada de la playlist
              </label>
              <div className="flex items-start gap-4">
                {portadaPreview ? (
                  <div className="group relative h-40 w-40 overflow-hidden rounded-xl ring-2 ring-neutral-700">
                    <img
                      src={portadaPreview}
                      alt="Portada"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPortadaFile(null);
                        setPortadaPreview("");
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 opacity-0 shadow-lg transition-all hover:bg-red-600 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-800/30 transition-all hover:border-green-500/50 hover:bg-neutral-800/50">
                    <Upload size={32} className="mb-2 text-neutral-500" />
                    <span className="px-2 text-center text-xs font-semibold text-neutral-400">
                      Subir portada
                    </span>
                    <span className="mt-1 text-xs text-neutral-600">
                      JPG, PNG
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={manejarCambioPortada}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="mb-3 block text-sm font-bold text-neutral-300">
                Nombre de la playlist <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Mi playlist increíble"
                className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-800/50 px-4 py-3 outline-none backdrop-blur-sm transition-all hover:border-neutral-600 focus:border-green-500"
                maxLength={100}
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="mb-3 block text-sm font-bold text-neutral-300">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu playlist..."
                rows={3}
                className="w-full resize-none rounded-xl border-2 border-neutral-700 bg-neutral-800/50 px-4 py-3 outline-none backdrop-blur-sm transition-all hover:border-neutral-600 focus:border-green-500"
                maxLength={500}
              />
            </div>

            {/* Buscar canciones */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Agregar canciones
              </label>
              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        buscarCanciones();
                      }
                    }}
                    placeholder="Buscar canciones..."
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2 pl-10 pr-4 outline-none transition-colors focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={buscarCanciones}
                  disabled={buscando || searchQuery.trim().length < 2}
                  className="rounded-lg bg-blue-500 px-4 py-2 transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {buscando ? "..." : "Buscar"}
                </button>
              </div>

              {searchQuery.trim().length >= 2 &&
                cancionesBuscadas.length === 0 &&
                !buscando && (
                  <div className="mt-3 rounded-lg bg-neutral-800/50 p-4 text-center">
                    <p className="text-sm text-neutral-400">
                      No se encontraron canciones. Intenta con otro término de
                      búsqueda.
                    </p>
                  </div>
                )}

              {cancionesBuscadas.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto rounded-lg bg-neutral-800/50 p-4">
                  <div className="space-y-2">
                    {cancionesBuscadas.map((song: Cancion) => (
                      <label
                        key={song._id}
                        className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-neutral-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSongs.includes(song._id)}
                          onChange={() => toggleCancion(song._id)}
                          className="h-4 w-4"
                        />
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-700">
                          <img
                            src={song.portadaUrl || "/cover.jpg"}
                            alt={song.titulo}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {song.titulo}
                          </p>
                          <p className="truncate text-xs text-neutral-400">
                            {Array.isArray(song.artistas)
                              ? song.artistas
                                  .map((a: any) =>
                                    typeof a === "string"
                                      ? a
                                      : a.nombreArtistico || a.nick || a.nombre
                                  )
                                  .join(", ")
                              : "Artista"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedSongs.length > 0 && (
                <p className="mt-2 text-xs text-neutral-400">
                  {selectedSongs.length} canción
                  {selectedSongs.length !== 1 ? "es" : ""} seleccionada
                  {selectedSongs.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Opciones */}
            <div className="space-y-3 rounded-xl border border-neutral-700/50 bg-neutral-800/30 p-4">
              <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-700/30">
                <input
                  type="checkbox"
                  id="esPublica"
                  checked={esPublica}
                  onChange={(e) => setEsPublica(e.target.checked)}
                  className="h-5 w-5 rounded accent-green-500"
                />
                <label
                  htmlFor="esPublica"
                  className="flex-1 cursor-pointer text-sm"
                >
                  <span className="font-semibold text-white">
                    Playlist pública
                  </span>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Otros usuarios podrán verla
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-700/30">
                <input
                  type="checkbox"
                  id="esColaborativa"
                  checked={esColaborativa}
                  onChange={(e) => setEsColaborativa(e.target.checked)}
                  className="h-5 w-5 rounded accent-blue-500"
                />
                <label
                  htmlFor="esColaborativa"
                  className="flex-1 cursor-pointer text-sm"
                >
                  <span className="font-semibold text-white">
                    Playlist colaborativa
                  </span>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Otros pueden agregar canciones
                  </p>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Botones fijos */}
        <div className="sticky bottom-0 border-t border-neutral-800 bg-neutral-900/95 p-6 backdrop-blur-sm">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={cerrarYResetear}
              disabled={creando}
              className="flex-1 rounded-xl bg-neutral-800 px-6 py-3.5 font-bold transition-all hover:bg-neutral-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={manejarSubmit}
              disabled={creando || !nombre.trim()}
              className="flex-1 rounded-xl bg-linear-to-r from-green-500 to-blue-600 px-6 py-3.5 font-bold shadow-lg transition-all hover:from-green-600 hover:to-blue-700 hover:shadow-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creando ? "Creando..." : "Crear Playlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
