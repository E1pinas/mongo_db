import { useState } from "react";
import {
  Music,
  Disc,
  ListMusic,
  Play,
  Pause,
  Eye,
  Ban,
  Trash2,
} from "lucide-react";
import Toast from "../../../components/common/Toast";
import { servicioAdmin } from "../servicios";

type ToastType = "success" | "error" | "info";

interface PropsVistaContenido {
  abrirModalOcultar: (cancion: any) => void;
  abrirModalQuitar: (cancion: any) => void;
}

export const VistaContenido: React.FC<PropsVistaContenido> = ({
  abrirModalOcultar,
  abrirModalQuitar,
}) => {
  const [tipoContenido, setTipoContenido] = useState<
    "canciones" | "albumes" | "playlists"
  >("canciones");
  const [contenido, setContenido] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  // Estados para el reproductor
  const [idAudioReproduciendo, setIdAudioReproduciendo] = useState<
    string | null
  >(null);
  const [audioActual, setAudioActual] = useState<HTMLAudioElement | null>(null);

  // Estados para modal de eliminación
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [contenidoAEliminar, setContenidoAEliminar] = useState<any>(null);
  const [razonEliminacion, setRazonEliminacion] = useState("");

  // Estados para Toast
  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState<ToastType>("info");
  const [mostrarToast, setMostrarToast] = useState(false);

  const mostrarNotificacionToast = (mensaje: string, tipo: ToastType) => {
    setMensajeToast(mensaje);
    setTipoToast(tipo);
    setMostrarToast(true);
  };

  const buscarContenido = async () => {
    if (!busqueda.trim()) return;

    try {
      setCargando(true);
      const resultado = await servicioAdmin.buscarContenido(
        busqueda,
        tipoContenido
      );

      if (tipoContenido === "canciones") {
        setContenido(resultado.canciones || resultado || []);
      } else if (tipoContenido === "albumes") {
        setContenido(resultado.albumes || resultado || []);
      } else {
        setContenido(resultado.playlists || resultado || []);
      }
    } catch (error) {
      console.error("Error buscando contenido:", error);
      mostrarNotificacionToast("Error al buscar contenido", "error");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEliminar = (item: any, tipo: string) => {
    setContenidoAEliminar({ ...item, tipo });
    setRazonEliminacion("");
    setMostrarModalEliminar(true);
  };

  const eliminarContenido = async () => {
    if (!razonEliminacion.trim()) {
      mostrarNotificacionToast(
        "Debes proporcionar una razón para la eliminación",
        "error"
      );
      return;
    }

    try {
      const { _id, tipo, titulo, nombre } = contenidoAEliminar;
      await servicioAdmin.eliminarContenido(_id, tipo);

      setMostrarModalEliminar(false);
      setContenidoAEliminar(null);
      setRazonEliminacion("");
      mostrarNotificacionToast(
        `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} "${
          titulo || nombre
        }" eliminado correctamente`,
        "success"
      );
      buscarContenido();
    } catch (error) {
      console.error("Error eliminando contenido:", error);
      mostrarNotificacionToast("Error al eliminar contenido", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
          Gestión de Contenido
        </h2>

        {/* Selector de tipo */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setTipoContenido("canciones");
              setBusqueda("");
              setContenido([]);
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              tipoContenido === "canciones"
                ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30"
                : "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            }`}
          >
            <Music className="w-4 h-4 inline mr-2" />
            Canciones
          </button>
          <button
            onClick={() => {
              setTipoContenido("albumes");
              setBusqueda("");
              setContenido([]);
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              tipoContenido === "albumes"
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                : "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            }`}
          >
            <Disc className="w-4 h-4 inline mr-2" />
            Álbumes
          </button>
          <button
            onClick={() => {
              setTipoContenido("playlists");
              setBusqueda("");
              setContenido([]);
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              tipoContenido === "playlists"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            }`}
          >
            <ListMusic className="w-4 h-4 inline mr-2" />
            Playlists
          </button>
        </div>

        {/* Buscador */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && buscarContenido()}
            placeholder={`Buscar ${tipoContenido}...`}
            className="flex-1 bg-neutral-800 text-white px-5 py-3 rounded-xl border border-neutral-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
          />
          <button
            onClick={buscarContenido}
            disabled={cargando}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-green-500/30 transition-all"
          >
            {cargando ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Resultados */}
        {contenido.length > 0 && (
          <div className="space-y-3">
            {contenido.map((item) => (
              <div
                key={item._id}
                className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Botón de Play/Pausa (solo para canciones) */}
                  {tipoContenido === "canciones" && item.audioUrl && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (idAudioReproduciendo === item._id && audioActual) {
                          audioActual.pause();
                          setIdAudioReproduciendo(null);
                          setAudioActual(null);
                        } else {
                          if (audioActual) {
                            audioActual.pause();
                          }

                          const audio = new Audio(item.audioUrl);
                          audio
                            .play()
                            .catch((err) =>
                              console.error("Error reproduciendo:", err)
                            );

                          audio.addEventListener("ended", () => {
                            setIdAudioReproduciendo(null);
                            setAudioActual(null);
                          });

                          setAudioActual(audio);
                          setIdAudioReproduciendo(item._id);
                        }
                      }}
                      className="shrink-0 w-14 h-14 bg-gradient-to-br from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-full flex items-center justify-center transition-all shadow-lg shadow-green-500/30"
                      title={
                        idAudioReproduciendo === item._id
                          ? "Pausar canción"
                          : "Reproducir canción"
                      }
                    >
                      {idAudioReproduciendo === item._id ? (
                        <Pause className="w-7 h-7 text-white" />
                      ) : (
                        <Play className="w-7 h-7 ml-1 text-white" />
                      )}
                    </button>
                  )}

                  {/* Imagen */}
                  {(item.portadaUrl || item.portada) && (
                    <img
                      src={item.portadaUrl || item.portada}
                      alt={item.titulo || item.nombre}
                      className="w-16 h-16 rounded object-cover shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-white">
                      {item.titulo || item.nombre}
                    </p>
                    {item.artista && (
                      <p className="text-green-400 text-base font-medium">
                        {typeof item.artista === "string"
                          ? item.artista
                          : item.artista.nombreArtistico || item.artista.nick}
                      </p>
                    )}
                    {item.creador && (
                      <p className="text-gray-400 text-sm">
                        Por: @{item.creador.nick}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      {item.reproducciones !== undefined && (
                        <span>▶ {item.reproducciones} reproducciones</span>
                      )}
                      {item.megusta !== undefined && (
                        <span>❤️ {item.megusta} me gusta</span>
                      )}
                      {item.canciones !== undefined && (
                        <span>🎵 {item.canciones.length} canciones</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  {tipoContenido === "canciones" && (
                    <>
                      {item.oculta ? (
                        <button
                          onClick={() => abrirModalQuitar(item)}
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap shadow-md shadow-green-500/30 transition-all"
                          title="Hacer visible nuevamente la canción"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          Mostrar
                        </button>
                      ) : (
                        <button
                          onClick={() => abrirModalOcultar(item)}
                          className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap shadow-md shadow-yellow-500/30 transition-all"
                          title="La canción seguirá existiendo pero no se podrá reproducir"
                        >
                          <Ban className="w-4 h-4 inline mr-1" />
                          Ocultar
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() =>
                      abrirModalEliminar(
                        item,
                        tipoContenido === "canciones"
                          ? "cancion"
                          : tipoContenido === "albumes"
                          ? "album"
                          : "playlist"
                      )
                    }
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap shadow-md shadow-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {contenido.length === 0 && busqueda && !cargando && (
          <p className="text-gray-400 text-center py-4">
            No se encontró contenido
          </p>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {mostrarModalEliminar && contenidoAEliminar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full border-2 border-red-600/50 shadow-2xl shadow-red-600/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Eliminar{" "}
                  {contenidoAEliminar.tipo === "cancion"
                    ? "Canción"
                    : contenidoAEliminar.tipo === "album"
                    ? "Álbum"
                    : "Playlist"}
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <div className="mb-5 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <p className="font-semibold text-white text-lg">
                {contenidoAEliminar.titulo || contenidoAEliminar.nombre}
              </p>
              {contenidoAEliminar.artista && (
                <p className="text-green-400 text-sm mt-1 font-medium">
                  {typeof contenidoAEliminar.artista === "string"
                    ? contenidoAEliminar.artista
                    : contenidoAEliminar.artista.nombreArtistico ||
                      contenidoAEliminar.artista.nick}
                </p>
              )}
              {contenidoAEliminar.creador && (
                <p className="text-neutral-400 text-sm mt-1">
                  Por: @{contenidoAEliminar.creador.nick}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Razón de la eliminación (obligatorio):
              </label>
              <textarea
                value={razonEliminacion}
                onChange={(e) => setRazonEliminacion(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm min-h-[100px] resize-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Explica por qué este contenido debe ser eliminado. Esta información quedará registrada."
              />
            </div>

            <div className="mb-4 p-2.5 bg-red-900/20 border border-red-700/50 rounded-xl">
              <p className="text-xs text-red-400 font-medium">
                ⚠️ Esta acción eliminará permanentemente el contenido y todos
                sus datos asociados.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMostrarModalEliminar(false);
                  setContenidoAEliminar(null);
                  setRazonEliminacion("");
                }}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarContenido}
                disabled={!razonEliminacion.trim()}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:shadow-none"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {mostrarToast && (
        <Toast
          message={mensajeToast}
          type={tipoToast}
          onClose={() => setMostrarToast(false)}
        />
      )}
    </div>
  );
};
