import { X, Upload, Search } from "lucide-react";
import type { Cancion } from "../../../types";
import { GENEROS_DISPONIBLES } from "../tipos";
import { useCrearAlbum } from "../hooks/useCrearAlbum";

interface ModalCrearAlbumProps {
  mostrar: boolean;
  onCerrar: () => void;
  onAlbumCreado: () => Promise<void>;
}

export const ModalCrearAlbum = ({
  mostrar,
  onCerrar,
  onAlbumCreado,
}: ModalCrearAlbumProps) => {
  const {
    titulo,
    descripcion,
    generos,
    fechaLanzamiento,
    esPrivado,
    portadaPreview,
    selectedSongs,
    cancionesBuscadas,
    searchQuery,
    buscando,
    creando,
    error,
    setTitulo,
    setDescripcion,
    setFechaLanzamiento,
    setEsPrivado,
    setPortadaFile,
    setPortadaPreview,
    manejarCambioPortada,
    toggleGenero,
    toggleCancion,
    buscarCanciones,
    resetearFormulario,
    crearAlbum,
  } = useCrearAlbum({ onAlbumCreado });

  const cerrarYResetear = () => {
    onCerrar();
    resetearFormulario();
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={cerrarYResetear}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-900/95 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-600 shadow-lg">
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
              <h2 className="bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-3xl font-bold text-transparent">
                Nuevo Álbum
              </h2>
            </div>
            <button
              onClick={cerrarYResetear}
              disabled={creando}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
          <form onSubmit={crearAlbum} className="space-y-6 p-6">
            {error && (
              <div className="rounded-xl border-2 border-red-500 bg-red-500/10 px-4 py-3 text-red-500 backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Título */}
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-200">
                Título del álbum *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Mi nuevo álbum"
                className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-800/50 px-4 py-3.5 placeholder-neutral-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                disabled={creando}
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-200">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu álbum..."
                rows={3}
                className="w-full resize-none rounded-xl border-2 border-neutral-700 bg-neutral-800/50 px-4 py-3.5 placeholder-neutral-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                disabled={creando}
              />
            </div>

            {/* Fecha de lanzamiento */}
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-200">
                Fecha de lanzamiento
              </label>
              <input
                type="date"
                value={fechaLanzamiento}
                onChange={(e) => setFechaLanzamiento(e.target.value)}
                className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-800/50 px-4 py-3.5 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                disabled={creando}
              />
            </div>

            {/* Géneros */}
            <div>
              <label className="mb-3 block text-sm font-bold text-neutral-200">
                Géneros
              </label>
              <div className="flex flex-wrap gap-2">
                {GENEROS_DISPONIBLES.map((genero) => (
                  <button
                    key={genero}
                    type="button"
                    onClick={() => toggleGenero(genero)}
                    disabled={creando}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      generos.includes(genero)
                        ? "bg-linear-to-r from-orange-500 to-red-600 scale-105 text-white shadow-lg"
                        : "bg-neutral-800/70 text-neutral-300 hover:scale-105 hover:bg-neutral-700"
                    }`}
                  >
                    {genero.charAt(0).toUpperCase() + genero.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Portada */}
            <div>
              <label className="mb-2 block text-sm font-bold text-neutral-200">
                Imagen de portada
              </label>
              <div className="flex items-start gap-4">
                {portadaPreview ? (
                  <div className="relative h-32 w-32 overflow-hidden rounded-xl ring-2 ring-orange-500/50">
                    <img
                      src={portadaPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPortadaFile(null);
                        setPortadaPreview("");
                      }}
                      disabled={creando}
                      className="absolute right-2 top-2 rounded-full bg-black/80 p-1.5 transition-all hover:bg-black"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 transition-all hover:border-orange-500 hover:bg-orange-500/5">
                    <Upload size={24} className="mb-2 text-neutral-500" />
                    <span className="text-xs font-medium text-neutral-500">
                      Subir imagen
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarCambioPortada}
                      disabled={creando}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="flex-1 text-sm text-neutral-400">
                  <p className="font-medium">
                    Recomendado: imagen cuadrada de al menos 500x500px
                  </p>
                  <p className="mt-1 text-xs">Máximo 5MB</p>
                </div>
              </div>
            </div>

            {/* Agregar canciones */}
            <div>
              <label className="mb-3 block text-sm font-bold text-neutral-200">
                Canciones del álbum
              </label>
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => buscarCanciones(e.target.value)}
                  placeholder="Busca tus canciones para agregar..."
                  className="w-full rounded-xl border-2 border-neutral-700 bg-neutral-800/50 py-3.5 pl-12 pr-4 placeholder-neutral-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  disabled={creando}
                />
              </div>

              {buscando && (
                <p className="ml-1 mt-2 text-sm text-neutral-400">
                  Buscando...
                </p>
              )}

              {cancionesBuscadas.length > 0 && (
                <div className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
                  <div className="space-y-1.5">
                    {cancionesBuscadas.map((song: Cancion) => (
                      <label
                        key={song._id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-neutral-600 hover:bg-neutral-700/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSongs.includes(song._id)}
                          onChange={() => toggleCancion(song._id)}
                          className="h-5 w-5 rounded accent-orange-500"
                        />
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-700">
                          <img
                            src={song.portadaUrl || "/cover.jpg"}
                            alt={song.titulo}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
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
                <div className="mt-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2">
                  <p className="text-xs font-semibold text-orange-400">
                    {selectedSongs.length} canción
                    {selectedSongs.length !== 1 ? "es" : ""} seleccionada
                    {selectedSongs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Opciones de privacidad */}
            <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/30 p-4">
              <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-700/30">
                <input
                  type="checkbox"
                  id="esPrivado"
                  checked={esPrivado}
                  onChange={(e) => setEsPrivado(e.target.checked)}
                  className="h-5 w-5 rounded accent-orange-500"
                />
                <label
                  htmlFor="esPrivado"
                  className="flex-1 cursor-pointer text-sm"
                >
                  <span className="font-semibold text-white">
                    Álbum privado
                  </span>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Solo tú podrás verlo
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
              onClick={crearAlbum}
              disabled={creando || !titulo.trim()}
              className="flex-1 rounded-xl bg-linear-to-r from-orange-500 to-red-600 px-6 py-3.5 font-bold shadow-lg transition-all hover:from-orange-600 hover:to-red-700 hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creando ? "Creando..." : "Crear Álbum"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
