import { useState, useEffect } from "react";
import {
  Music,
  Disc,
  ListMusic,
  MessageSquare,
  Users,
  Play,
  Pause,
} from "lucide-react";
import { Reporte } from "../tipos";
import { servicioAdmin } from "../servicios";

type ToastType = "success" | "error" | "info";

interface PropsTarjetaReporte {
  reporte: Reporte;
  alResolver?: (id: string, accion: string, razon: string) => void;
  alCambiarEstado?: (id: string, estado: string) => void;
  mostrarNotificacionToast?: (mensaje: string, tipo: ToastType) => void;
}

export const TarjetaReporte: React.FC<PropsTarjetaReporte> = ({
  reporte,
  alResolver,
  alCambiarEstado,
  mostrarNotificacionToast,
}) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const [reproductorAudio, setReproductorAudio] =
    useState<HTMLAudioElement | null>(null);
  const [estaReproduciendo, setEstaReproduciendo] = useState(false);

  const coloresPrioridad = {
    urgente: "bg-red-600",
    alta: "bg-orange-600",
    media: "bg-yellow-600",
    baja: "bg-blue-600",
  };

  const cambiarPrioridad = async (nuevaPrioridad: string) => {
    try {
      await servicioAdmin.cambiarPrioridadReporte(reporte._id, nuevaPrioridad);
      if (mostrarNotificacionToast) {
        mostrarNotificacionToast(
          `Prioridad cambiada a ${nuevaPrioridad}`,
          "success"
        );
      }
      window.location.reload();
    } catch (error) {
      console.error("Error cambiando prioridad:", error);
      if (mostrarNotificacionToast) {
        mostrarNotificacionToast("Error al cambiar prioridad", "error");
      }
    }
  };

  const iconosTipo = {
    cancion: <Music className="w-4 h-4" />,
    album: <Disc className="w-4 h-4" />,
    playlist: <ListMusic className="w-4 h-4" />,
    comentario: <MessageSquare className="w-4 h-4" />,
    usuario: <Users className="w-4 h-4" />,
  };

  const manejarReproducirPrevia = () => {
    if (!reporte.contenidoDetalle?.audioUrl) return;

    if (reproductorAudio) {
      if (estaReproduciendo) {
        reproductorAudio.pause();
        setEstaReproduciendo(false);
      } else {
        reproductorAudio.play();
        setEstaReproduciendo(true);
      }
    } else {
      const audio = new Audio(reporte.contenidoDetalle.audioUrl);
      audio.addEventListener("ended", () => setEstaReproduciendo(false));
      audio.play();
      setReproductorAudio(audio);
      setEstaReproduciendo(true);
    }
  };

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (reproductorAudio) {
        reproductorAudio.pause();
        reproductorAudio.src = "";
      }
    };
  }, [reproductorAudio]);

  const obtenerNombresArtistas = (artistas: any[]) => {
    if (!artistas || artistas.length === 0) return "Desconocido";
    return artistas
      .map((a) => (typeof a === "string" ? a : a.nombreArtistico || a.nick))
      .join(", ");
  };

  return (
    <div className="bg-neutral-900/60 rounded-2xl p-5 border border-neutral-800 hover:border-neutral-700 transition-all hover:bg-neutral-900/80">
      <div className="flex items-start gap-4">
        {/* Imagen del contenido */}
        {reporte.contenidoDetalle && (
          <div className="shrink-0">
            {(reporte.tipoContenido === "cancion" ||
              reporte.tipoContenido === "album" ||
              reporte.tipoContenido === "playlist") && (
              <img
                src={
                  reporte.contenidoDetalle.portadaUrl ||
                  reporte.contenidoDetalle.portada ||
                  "/cover.jpg"
                }
                alt="Portada"
                className="w-20 h-20 rounded-xl object-cover ring-2 ring-neutral-800"
              />
            )}
            {reporte.tipoContenido === "usuario" && (
              <img
                src={
                  reporte.contenidoDetalle.avatarUrl || "/default-avatar.png"
                }
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-neutral-800"
              />
            )}
          </div>
        )}

        {/* Información del reporte */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {iconosTipo[reporte.tipoContenido as keyof typeof iconosTipo]}
            <span className="font-semibold capitalize text-white">
              {reporte.tipoContenido}
            </span>
            {/* Selector de prioridad */}
            {reporte.estado !== "resuelto" ? (
              <select
                value={reporte.prioridad}
                onChange={(e) => cambiarPrioridad(e.target.value)}
                className={`px-2 py-1 text-xs rounded font-medium cursor-pointer border-2 border-transparent hover:border-white/30 transition-all ${
                  coloresPrioridad[
                    reporte.prioridad as keyof typeof coloresPrioridad
                  ]
                }`}
              >
                <option value="baja" className="bg-neutral-900">
                  BAJA
                </option>
                <option value="media" className="bg-neutral-900">
                  MEDIA
                </option>
                <option value="alta" className="bg-neutral-900">
                  ALTA
                </option>
                <option value="urgente" className="bg-neutral-900">
                  URGENTE
                </option>
              </select>
            ) : (
              <span
                className={`px-2 py-1 text-xs rounded font-medium ${
                  coloresPrioridad[
                    reporte.prioridad as keyof typeof coloresPrioridad
                  ]
                }`}
              >
                {reporte.prioridad.toUpperCase()}
              </span>
            )}
            <span
              className={`px-2 py-1 text-xs rounded font-medium ${
                reporte.estado === "pendiente"
                  ? "bg-red-600"
                  : reporte.estado === "en_revision"
                  ? "bg-yellow-600"
                  : "bg-green-600"
              }`}
            >
              {reporte.estado.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* Título del contenido reportado */}
          {reporte.contenidoDetalle && (
            <div className="mb-3">
              <h3 className="text-lg font-bold text-white mb-1">
                {reporte.contenidoDetalle.titulo ||
                  reporte.contenidoDetalle.nombre ||
                  reporte.contenidoDetalle.nombreArtistico ||
                  reporte.contenidoDetalle.nick ||
                  "Sin título"}
              </h3>
              {reporte.tipoContenido === "cancion" &&
                reporte.contenidoDetalle.artistas && (
                  <p className="text-gray-400 text-sm">
                    Por:{" "}
                    {obtenerNombresArtistas(reporte.contenidoDetalle.artistas)}
                  </p>
                )}
              {reporte.tipoContenido === "album" &&
                reporte.contenidoDetalle.artistas && (
                  <p className="text-gray-400 text-sm">
                    Por:{" "}
                    {obtenerNombresArtistas(reporte.contenidoDetalle.artistas)}
                  </p>
                )}
              {reporte.tipoContenido === "playlist" &&
                reporte.contenidoDetalle.creador && (
                  <p className="text-gray-400 text-sm">
                    Por: @
                    {reporte.contenidoDetalle.creador.nick ||
                      reporte.contenidoDetalle.creador}
                  </p>
                )}
              {reporte.tipoContenido === "comentario" &&
                reporte.contenidoDetalle.autor && (
                  <p className="text-gray-400 text-sm mb-2">
                    Por: @
                    {reporte.contenidoDetalle.autor.nick ||
                      reporte.contenidoDetalle.autor}
                  </p>
                )}
              {reporte.tipoContenido === "comentario" &&
                reporte.contenidoDetalle.texto && (
                  <p className="text-gray-300 text-sm italic bg-gray-900/50 p-2 rounded">
                    "{reporte.contenidoDetalle.texto}"
                  </p>
                )}
            </div>
          )}

          {/* Motivo del reporte */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-red-400">Motivo:</span>{" "}
              {reporte.motivo}
            </p>
            {reporte.detalles && (
              <p className="text-sm text-gray-400 mt-1">{reporte.detalles}</p>
            )}
          </div>

          {/* Reproductor de audio si es una canción */}
          {reporte.tipoContenido === "cancion" &&
            reporte.contenidoDetalle?.audioUrl && (
              <button
                onClick={manejarReproducirPrevia}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg mb-3 transition-colors"
              >
                {estaReproduciendo ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {estaReproduciendo
                  ? "Pausar Vista Previa"
                  : "Reproducir Vista Previa"}
              </button>
            )}

          {/* Información del reportador */}
          <p className="text-xs text-gray-500 mb-2">
            Reportado por: @{reporte.reportador.nick || "Anónimo"} el{" "}
            {new Date(reporte.fechaReporte).toLocaleString("es-ES")}
          </p>

          {/* Comentario de resolución (si existe) */}
          {reporte.estado === "resuelto" && reporte.comentarioResolucion && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
              <p className="text-sm text-green-400 font-semibold mb-1">
                Resolución: {reporte.accionTomada?.toUpperCase()}
              </p>
              <p className="text-sm text-gray-300">
                {reporte.comentarioResolucion}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Resuelto por: @{reporte.resueltoPersonal?.nick || "Admin"} el{" "}
                {new Date(reporte.fechaResolucion!).toLocaleString("es-ES")}
              </p>
            </div>
          )}

          {/* Botones de acción (solo si no está resuelto) */}
          {reporte.estado !== "resuelto" && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setMostrarAcciones(!mostrarAcciones)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                {mostrarAcciones ? "Ocultar Acciones" : "Ver Acciones"}
              </button>
              {alCambiarEstado && reporte.estado === "pendiente" && (
                <button
                  onClick={() => alCambiarEstado(reporte._id, "en_revision")}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Marcar en Revisión
                </button>
              )}
              {alCambiarEstado && reporte.estado === "en_revision" && (
                <button
                  onClick={() => alCambiarEstado(reporte._id, "pendiente")}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Devolver a Pendiente
                </button>
              )}
            </div>
          )}

          {/* Panel de acciones desplegable */}
          {mostrarAcciones && reporte.estado !== "resuelto" && alResolver && (
            <div className="mt-4 space-y-2 bg-neutral-800/50 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">
                Acciones de Moderación
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    alResolver(
                      reporte._id,
                      "advertencia",
                      "Se envió advertencia"
                    )
                  }
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm transition-colors"
                >
                  Enviar Advertencia
                </button>
                <button
                  onClick={() =>
                    alResolver(reporte._id, "ocultar", "Contenido ocultado")
                  }
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm transition-colors"
                >
                  Ocultar Contenido
                </button>
                <button
                  onClick={() =>
                    alResolver(reporte._id, "eliminar", "Contenido eliminado")
                  }
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                >
                  Eliminar Contenido
                </button>
                <button
                  onClick={() =>
                    alResolver(reporte._id, "suspender", "Usuario suspendido")
                  }
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                >
                  Suspender Usuario
                </button>
                <button
                  onClick={() =>
                    alResolver(
                      reporte._id,
                      "rechazar",
                      "Reporte sin fundamento"
                    )
                  }
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors md:col-span-2"
                >
                  Rechazar Reporte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
