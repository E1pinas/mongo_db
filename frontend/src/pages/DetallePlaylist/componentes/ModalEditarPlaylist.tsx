import { useState, useEffect } from "react";
import { X, Search, Upload } from "lucide-react";
import type { Playlist, Usuario } from "../../../types";
import { friendshipService } from "../../../services/friendship.service";
import { musicService } from "../../../services/music.service";
import { Toast } from "../../../components/Toast";

interface ModalEditarPlaylistProps {
  mostrar: boolean;
  playlist: Playlist;
  onCerrar: () => void;
  onGuardar: (datos: {
    titulo: string;
    descripcion: string;
    esPublica: boolean;
    esColaborativa: boolean;
    portadaFile?: File | null;
    amigosSeleccionados?: string[];
  }) => Promise<void>;
}

export function ModalEditarPlaylist({
  mostrar,
  playlist,
  onCerrar,
  onGuardar,
}: ModalEditarPlaylistProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esPublica, setEsPublica] = useState(true);
  const [esColaborativa, setEsColaborativa] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  // Estado para amigos
  const [amigos, setAmigos] = useState<Usuario[]>([]);
  const [busquedaAmigo, setBusquedaAmigo] = useState("");
  const [cargandoAmigos, setCargandoAmigos] = useState(false);
  const [invitados, setInvitados] = useState<string[]>([]);
  const [amigosSeleccionados, setAmigosSeleccionados] = useState<string[]>([]);
  const [mostrarConfirmacionDesactivar, setMostrarConfirmacionDesactivar] =
    useState(false);
  const [mostrarConfirmacionPrivada, setMostrarConfirmacionPrivada] =
    useState(false);

  useEffect(() => {
    if (mostrar && playlist) {
      setTitulo((playlist as any).titulo || "");
      setDescripcion((playlist as any).descripcion || "");
      setEsPublica((playlist as any).esPublica !== false);
      setEsColaborativa((playlist as any).esColaborativa || false);
      setBusquedaAmigo("");
      setPortadaPreview((playlist as any).portadaUrl || "");
      setPortadaFile(null);

      // Extraer IDs de colaboradores (pueden venir como objetos o strings)
      const colaboradores = (playlist as any).colaboradores || [];
      const idsColaboradores = colaboradores.map((c: any) =>
        typeof c === "string" ? c : c._id
      );
      setInvitados(idsColaboradores);
    }
  }, [mostrar, playlist]);

  // Cargar amigos cuando se activa el modo colaborativo
  useEffect(() => {
    const cargarAmigos = async () => {
      if (esColaborativa && amigos.length === 0) {
        setCargandoAmigos(true);
        try {
          const listaAmigos = await friendshipService.getFriends();
          setAmigos(listaAmigos);
        } catch (error) {
          console.error("Error al cargar amigos:", error);
        } finally {
          setCargandoAmigos(false);
        }
      }
    };
    cargarAmigos();
  }, [esColaborativa, amigos.length]);

  const manejarCambioPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMensajeError("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMensajeError("La imagen no puede superar los 5MB");
      return;
    }

    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
  };

  const toggleAmigoSeleccionado = (amigoId: string) => {
    setAmigosSeleccionados((prev) =>
      prev.includes(amigoId)
        ? prev.filter((id) => id !== amigoId)
        : [...prev, amigoId]
    );
  };

  const manejarCambioColaborativa = (checked: boolean) => {
    // Si desactiva el modo colaborativo y había colaboradores
    if (!checked && invitados.length > 0) {
      setMostrarConfirmacionDesactivar(true);
      return;
    }

    // Si desactiva, limpiar selección
    if (!checked) {
      setAmigosSeleccionados([]);
    }

    setEsColaborativa(checked);
  };

  const confirmarDesactivarColaborativa = () => {
    setAmigosSeleccionados([]);
    setEsColaborativa(false);
    setMostrarConfirmacionDesactivar(false);
  };

  const cancelarDesactivarColaborativa = () => {
    setMostrarConfirmacionDesactivar(false);
  };

  const manejarCambioPublica = (checked: boolean) => {
    setEsPublica(checked);
  };

  const confirmarHacerPrivada = async () => {
    setMostrarConfirmacionPrivada(false);

    try {
      setGuardando(true);

      // Guardar cambios con la playlist ahora privada
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        esPublica: false,
        esColaborativa: false,
        portadaFile,
        amigosSeleccionados: [],
      });

      onCerrar();
    } catch (error: any) {
      setMensajeError(error.message || "Error al guardar la playlist");
    } finally {
      setGuardando(false);
    }
  };

  const cancelarHacerPrivada = () => {
    setMostrarConfirmacionPrivada(false);
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setMensajeError("El título es obligatorio");
      return;
    }

    // Si está haciendo privada una playlist colaborativa con colaboradores, pedir confirmación
    if (
      !esPublica &&
      (playlist as any).esColaborativa &&
      invitados.length > 0
    ) {
      setMostrarConfirmacionPrivada(true);
      return;
    }

    try {
      setGuardando(true);

      // Guardar cambios de la playlist y pasar los amigos seleccionados
      await onGuardar({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        esPublica,
        esColaborativa,
        portadaFile,
        amigosSeleccionados: esColaborativa ? amigosSeleccionados : [],
      });

      onCerrar();
    } catch (error: any) {
      setMensajeError(error.message || "Error al guardar la playlist");
    } finally {
      setGuardando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <>
      {mensajeError && (
        <Toast
          message={mensajeError}
          type="error"
          onClose={() => setMensajeError("")}
        />
      )}
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-green-500/10 via-teal-500/10 to-blue-500/10 blur-xl" />
            <div className="relative flex items-center justify-between p-6 pb-4 shrink-0 border-b border-neutral-800/50">
              <h3 className="text-xl font-bold bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Editar Playlist
              </h3>
              <button
                onClick={onCerrar}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <form
            onSubmit={manejarGuardar}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="overflow-y-auto px-6 pb-4">
              <div className="space-y-4">
                {/* Portada */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Portada de la playlist
                  </label>
                  <div className="flex items-start gap-4">
                    {portadaPreview ? (
                      <div className="group relative h-32 w-32 overflow-hidden rounded-xl ring-2 ring-neutral-700">
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
                      <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-800/30 transition-all hover:border-green-500/50 hover:bg-neutral-800/50">
                        <Upload size={32} className="mb-2 text-neutral-500" />
                        <span className="px-2 text-center text-xs font-semibold text-neutral-400">
                          Cambiar portada
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

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    maxLength={100}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nombre de la playlist"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Describe tu playlist (opcional)"
                  />
                </div>

                {/* Switches */}
                <div className="space-y-3">
                  {/* Pública/Privada */}
                  <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div>
                      <label
                        htmlFor="esPublica"
                        className="font-medium text-white"
                      >
                        Playlist pública
                      </label>
                      <p className="text-xs text-neutral-400 mt-1">
                        Visible para todos los usuarios
                      </p>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        id="esPublica"
                        checked={esPublica}
                        onChange={(e) => manejarCambioPublica(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-full h-full bg-neutral-700 rounded-full peer-checked:bg-green-500 transition-colors cursor-pointer"></div>
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </label>
                  </div>

                  {/* Colaborativa */}
                  <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div>
                      <label
                        htmlFor="esColaborativa"
                        className="font-medium text-white"
                      >
                        Playlist colaborativa
                      </label>
                      <p className="text-xs text-neutral-400 mt-1">
                        Otros usuarios pueden agregar canciones
                      </p>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        id="esColaborativa"
                        checked={esColaborativa}
                        onChange={(e) =>
                          manejarCambioColaborativa(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-full h-full bg-neutral-700 rounded-full peer-checked:bg-green-500 transition-colors cursor-pointer"></div>
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </label>
                  </div>
                </div>

                {/* Buscador de amigos colaboradores */}
                {esColaborativa && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-300">
                      Selecciona amigos para invitar
                    </label>

                    {/* Buscador */}
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                        size={18}
                      />
                      <input
                        type="text"
                        value={busquedaAmigo}
                        onChange={(e) => setBusquedaAmigo(e.target.value)}
                        placeholder="Buscar amigos..."
                        className="w-full px-4 py-2 pl-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Lista de amigos */}
                    {cargandoAmigos ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {amigos
                          .filter((amigo) => {
                            const busqueda = busquedaAmigo.toLowerCase().trim();
                            if (!busqueda) return true;
                            return (
                              amigo.nick?.toLowerCase().includes(busqueda) ||
                              amigo.nombre?.toLowerCase().includes(busqueda)
                            );
                          })
                          .slice(0, busquedaAmigo.trim() ? undefined : 3)
                          .map((amigo) => (
                            <div
                              key={amigo._id}
                              className="flex items-center gap-3 p-2 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-neutral-700 overflow-hidden shrink-0">
                                <img
                                  src={amigo.avatarUrl || "/avatar.png"}
                                  alt={amigo.nick}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {amigo.nick}
                                </p>
                                <p className="text-xs text-neutral-400 truncate">
                                  {amigo.nombre}
                                </p>
                              </div>
                              {invitados.includes(amigo._id) ? (
                                <span className="px-3 py-1 text-xs bg-neutral-700 text-neutral-400 rounded-lg">
                                  Ya invitado
                                </span>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={amigosSeleccionados.includes(
                                    amigo._id
                                  )}
                                  onChange={() =>
                                    toggleAmigoSeleccionado(amigo._id)
                                  }
                                  className="w-5 h-5 rounded border-2 border-neutral-600 bg-neutral-800 checked:bg-green-500 checked:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                                />
                              )}
                            </div>
                          ))}

                        {amigos.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-neutral-400">
                              No tienes amigos aún
                            </p>
                          </div>
                        )}

                        {busquedaAmigo &&
                          amigos.filter((amigo) => {
                            const busqueda = busquedaAmigo.toLowerCase().trim();
                            return (
                              amigo.nick?.toLowerCase().includes(busqueda) ||
                              amigo.nombre?.toLowerCase().includes(busqueda)
                            );
                          }).length === 0 &&
                          amigos.length > 0 && (
                            <div className="text-center py-4">
                              <p className="text-sm text-neutral-400">
                                No se encontraron amigos con "{busquedaAmigo}"
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 p-6 pt-4 border-t border-neutral-800 shrink-0">
              <button
                type="button"
                onClick={onCerrar}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 px-4 py-2 bg-linear-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 shadow-lg"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación para desactivar colaborativa */}
      {mostrarConfirmacionDesactivar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-neutral-900 rounded-xl p-6 max-w-md w-full mx-4 border border-neutral-800">
            <h3 className="text-lg font-bold text-white mb-3">
              Desactivar modo colaborativo
            </h3>
            <p className="text-neutral-300 text-sm mb-6">
              Esta playlist tiene {invitados.length} colaborador(es). Si
              desactivas el modo colaborativo, todos los colaboradores perderán
              acceso. ¿Continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={confirmarDesactivarColaborativa}
                className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors border border-cyan-500/30"
              >
                Aceptar
              </button>
              <button
                onClick={cancelarDesactivarColaborativa}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para hacer privada */}
      {mostrarConfirmacionPrivada && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-neutral-900 rounded-xl p-6 max-w-md w-full mx-4 border border-neutral-800">
            <h3 className="text-lg font-bold text-white mb-3">
              Hacer playlist privada
            </h3>
            <p className="text-neutral-300 text-sm mb-6">
              Esta playlist es colaborativa con {invitados.length}{" "}
              colaborador(es). Al hacerla privada, el modo colaborativo se
              desactivará automáticamente. ¿Continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={confirmarHacerPrivada}
                className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors border border-cyan-500/30"
              >
                Aceptar
              </button>
              <button
                onClick={cancelarHacerPrivada}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
