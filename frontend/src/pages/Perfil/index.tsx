import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, usePlayer } from "../../contexts";
import { Ban } from "lucide-react";
import type { Cancion } from "../../types";
import { useDatosPerfil, useEstadoRelacion, useContenidoPerfil } from "./hooks";
import {
  CabeceraPerfil,
  BotonesAccion,
  Pestañas,
  ListaUsuarios,
} from "./componentes";
import type { TipoPestaña } from "./tipos";
import BlockButton from "../../components/BlockButton";
import EditSongModal from "../../components/musica/EditSongModal";
import SongCommentsModal from "../../components/musica/SongCommentsModal";
import SongRow from "../../components/musica/SongRow";
import PostFeed from "../../components/social/PostFeed";
import { ReportModal } from "../../components/common/ReportModal";
import { servicioPerfil } from "./servicios";

export default function Perfil() {
  const { nick } = useParams<{ nick: string }>();
  const { user: usuarioActual } = useAuth();
  const navigate = useNavigate();

  // Estados locales
  const [pestañaActiva, setPestañaActiva] = useState<TipoPestaña>("posts");
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);
  const [mostrarModalEliminarAmigo, setMostrarModalEliminarAmigo] =
    useState(false);
  const [mostrarModalDejarSeguir, setMostrarModalDejarSeguir] = useState(false);
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [mostrarModalSuspendido, setMostrarModalSuspendido] = useState(false);
  const [cancionComentarios, setCancionComentarios] = useState<Cancion | null>(
    null
  );
  const [mostrarModalEliminarCancion, setMostrarModalEliminarCancion] =
    useState(false);
  const [cancionAEliminar, setCancionAEliminar] = useState<Cancion | null>(
    null
  );
  const [mostrarModalEditarCancion, setMostrarModalEditarCancion] =
    useState(false);
  const [cancionAEditar, setCancionAEditar] = useState<Cancion | null>(null);
  const [razonBloqueo, setRazonBloqueo] = useState("");

  // Hooks personalizados
  const { usuarioPerfil, cargando, errorPerfil } = useDatosPerfil(
    nick,
    usuarioActual
  );

  const {
    estadoRelacion,
    estaSiguiendo,
    aceptaSolicitudes,
    cargandoAccion,
    seguir,
    dejarDeSeguir,
    enviarSolicitudAmistad,
    aceptarSolicitud,
    rechazarSolicitud,
    cancelarSolicitud,
    eliminarAmistad,
  } = useEstadoRelacion(usuarioPerfil?._id, usuarioActual?._id);

  const {
    canciones,
    albumes,
    playlists,
    seguidores,
    seguidos,
    cargandoContenido,
    cargarContenido,
    setCanciones,
    setAlbumes,
    setPlaylists,
  } = useContenidoPerfil(usuarioPerfil?._id);

  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();

  // Determinar si es el propio usuario
  const esPropioUsuario = usuarioPerfil?._id === usuarioActual?._id;

  // Verificar si el usuario está suspendido
  useEffect(() => {
    if (usuarioActual && (usuarioActual as any).suspendido) {
      if (nick && nick !== usuarioActual.nick) {
        setMostrarModalSuspendido(true);
        return;
      }
    }
  }, [usuarioActual, nick]);

  // Si es admin/super_admin viendo su propio perfil, redirigir al panel
  useEffect(() => {
    if (
      usuarioActual &&
      (usuarioActual.role === "admin" ||
        usuarioActual.role === "super_admin") &&
      (!nick || nick === usuarioActual.nick)
    ) {
      navigate("/admin", { replace: true });
      return;
    }
  }, [usuarioActual, nick, navigate]);

  // Cargar contenido inicial (canciones)
  useEffect(() => {
    if (usuarioPerfil && esPropioUsuario) {
      cargarContenido("canciones");
    }
  }, [usuarioPerfil, esPropioUsuario]);

  // Cargar contenido cuando cambia la pestaña
  useEffect(() => {
    if (!usuarioPerfil) return;

    // Para canciones, álbumes y playlists, solo cargar si es el propio usuario
    if (pestañaActiva === "canciones" || pestañaActiva === "albumes" || pestañaActiva === "playlists") {
      if (esPropioUsuario) {
        cargarContenido(pestañaActiva);
      }
    } else if (pestañaActiva !== "posts") {
      // Para seguidores y siguiendo, cargar siempre
      cargarContenido(pestañaActiva);
    }
  }, [pestañaActiva, usuarioPerfil, esPropioUsuario]);

  // Manejadores de acciones
  const manejarSeguir = async () => {
    try {
      await seguir();
    } catch (error: any) {
      alert(error.message || "Error al seguir");
    }
  };

  const manejarDejarDeSeguir = async () => {
    try {
      await dejarDeSeguir();
      setMostrarModalDejarSeguir(false);
    } catch (error: any) {
      alert(error.message || "Error al dejar de seguir");
    }
  };

  const manejarEnviarSolicitud = async () => {
    try {
      await enviarSolicitudAmistad();
    } catch (error: any) {
      alert(error.message || "Error al enviar solicitud");
    }
  };

  const manejarCancelarSolicitud = async () => {
    try {
      await cancelarSolicitud();
    } catch (error: any) {
      alert(error.message || "Error al cancelar solicitud");
    }
  };

  const manejarEliminarAmigo = async () => {
    try {
      await eliminarAmistad();
      setMostrarModalEliminarAmigo(false);
    } catch (error: any) {
      alert(error.message || "Error al eliminar amistad");
    }
  };

  const manejarReproducirCancion = (cancion: Cancion) => {
    if (currentSong?._id === cancion._id && isPlaying) {
      togglePlay();
    } else {
      let cancionesDisponibles = canciones;

      if (usuarioActual?.esMenorDeEdad) {
        cancionesDisponibles = canciones.filter((c) => !c.esExplicita);

        if (cancion.esExplicita) {
          alert(
            "No puedes reproducir contenido explícito siendo menor de edad."
          );
          return;
        }
      }

      const indicCancion = cancionesDisponibles.findIndex(
        (c) => c._id === cancion._id
      );
      if (indicCancion !== -1) {
        playQueue(cancionesDisponibles, indicCancion);
      }
    }
  };

  const manejarEliminarCancion = async () => {
    if (!cancionAEliminar) return;

    try {
      await servicioPerfil.eliminarCancion(cancionAEliminar._id);
      setCanciones(canciones.filter((c) => c._id !== cancionAEliminar._id));
      setMostrarModalEliminarCancion(false);
      setCancionAEliminar(null);
      alert("Canción eliminada correctamente");
    } catch (error: any) {
      console.error("Error al eliminar canción:", error);
      alert(error.message || "Error al eliminar canción");
    }
  };

  const manejarGuardarCancionEditada = async (cancionEditada: Cancion) => {
    setCanciones(
      canciones.map((c) => (c._id === cancionEditada._id ? cancionEditada : c))
    );
    setMostrarModalEditarCancion(false);
    setCancionAEditar(null);
  };

  // Renderizado de estados de carga y error
  if (cargando) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl font-semibold">
            Cargando perfil...
          </div>
        </div>
      </div>
    );
  }

  if (!usuarioPerfil) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Usuario no encontrado
          </h2>
          <p className="text-neutral-400 mb-6">
            {errorPerfil?.mensaje ||
              "El usuario que buscas no existe o no está disponible."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Cabecera del perfil */}
      <CabeceraPerfil
        usuario={usuarioPerfil}
        esPropioUsuario={esPropioUsuario}
        totalCanciones={canciones.length}
        totalSeguidores={
          (usuarioPerfil as any).estadisticas?.totalSeguidores || 0
        }
        totalSiguiendo={(usuarioPerfil as any).estadisticas?.totalSeguidos || 0}
        alClickConfiguracion={() => navigate("/configuracion")}
        botonesAccion={
          !esPropioUsuario ? (
            <BotonesAccion
              estadoRelacion={estadoRelacion}
              estaSiguiendo={estaSiguiendo}
              aceptaSolicitudes={aceptaSolicitudes}
              cargandoAccion={cargandoAccion}
              alSeguir={manejarSeguir}
              alDejarDeSeguir={() => setMostrarModalDejarSeguir(true)}
              alEnviarSolicitud={manejarEnviarSolicitud}
              alAceptarSolicitud={aceptarSolicitud}
              alRechazarSolicitud={rechazarSolicitud}
              alCancelarSolicitud={manejarCancelarSolicitud}
              alEliminarAmigo={() => setMostrarModalEliminarAmigo(true)}
              alReportar={() => setMostrarModalReporte(true)}
              alBloquear={() => setMostrarModalBloqueo(true)}
            />
          ) : undefined
        }
      />

      {/* Pestañas */}
      <Pestañas
        pestañaActiva={pestañaActiva}
        alCambiarPestaña={setPestañaActiva}
        totalCanciones={canciones.length}
        totalAlbumes={albumes.length}
        totalPlaylists={playlists.length}
        totalSeguidores={
          (usuarioPerfil as any).estadisticas?.totalSeguidores || 0
        }
        totalSiguiendo={(usuarioPerfil as any).estadisticas?.totalSeguidos || 0}
      />

      {/* Contenido de las pestañas */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {pestañaActiva === "posts" && <PostFeed userId={usuarioPerfil._id} />}

        {pestañaActiva === "canciones" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Todas las pistas
            </h2>
            <div className="space-y-1">
              {cargandoContenido ? (
                <div className="text-center py-12 text-neutral-400">
                  Cargando canciones...
                </div>
              ) : canciones.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  No hay canciones
                </div>
              ) : (
                canciones.map((cancion, indice) => (
                  <SongRow
                    key={cancion._id}
                    cancion={cancion}
                    index={indice}
                    isCurrentSong={currentSong?._id === cancion._id}
                    isPlaying={currentSong?._id === cancion._id && isPlaying}
                    onPlay={() => manejarReproducirCancion(cancion)}
                    onOpenComments={() => setCancionComentarios(cancion)}
                    showCreatorActions={esPropioUsuario}
                    onEdit={
                      esPropioUsuario
                        ? () => {
                            setCancionAEditar(cancion);
                            setMostrarModalEditarCancion(true);
                          }
                        : undefined
                    }
                    onDelete={
                      esPropioUsuario
                        ? () => {
                            setCancionAEliminar(cancion);
                            setMostrarModalEliminarCancion(true);
                          }
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </div>
        )}

        {pestañaActiva === "albumes" && (
          <div>
            {cargandoContenido ? (
              <div className="text-center py-12 text-neutral-400">
                Cargando álbumes...
              </div>
            ) : albumes.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                No hay álbumes
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {albumes.map((album) => (
                  <div
                    key={album._id}
                    onClick={() => navigate(`/album/${album._id}`)}
                    className="bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <div className="aspect-square bg-neutral-800 rounded-lg mb-3 overflow-hidden">
                      {album.portada && (
                        <img
                          src={`http://localhost:3900/uploads/portadas/${album.portada}`}
                          alt={album.titulo}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold text-white truncate">
                      {album.titulo}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {album.canciones?.length || 0} canciones
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pestañaActiva === "playlists" && (
          <div>
            {cargandoContenido ? (
              <div className="text-center py-12 text-neutral-400">
                Cargando playlists...
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                No hay playlists
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <div className="aspect-square bg-neutral-800 rounded-lg mb-3 overflow-hidden">
                      {playlist.imagen && (
                        <img
                          src={`http://localhost:3900/uploads/playlists/${playlist.imagen}`}
                          alt={playlist.nombre}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold text-white truncate">
                      {playlist.nombre}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {playlist.canciones?.length || 0} canciones
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pestañaActiva === "seguidores" && (
          <ListaUsuarios
            usuarios={seguidores}
            titulo="Seguidores"
            cargando={cargandoContenido}
          />
        )}

        {pestañaActiva === "siguiendo" && (
          <ListaUsuarios
            usuarios={seguidos}
            titulo="Siguiendo"
            cargando={cargandoContenido}
          />
        )}
      </div>

      {/* Modales */}
      {mostrarModalBloqueo && usuarioPerfil && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-red-400">
              ¿Bloquear usuario?
            </h3>
            <div className="space-y-3 mb-6 text-sm text-neutral-300">
              <p>
                Al bloquear a{" "}
                {usuarioPerfil.nombreArtistico || usuarioPerfil.nick}:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>No podrá ver tu perfil</li>
                <li>No podrá encontrarte en búsquedas</li>
                <li>Se eliminarán las relaciones de amistad y seguimiento</li>
                <li>No podrá interactuar contigo</li>
              </ul>
            </div>

            {/* Campo de razón */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Razón del bloqueo (opcional)
              </label>
              <textarea
                value={razonBloqueo}
                onChange={(e) => setRazonBloqueo(e.target.value)}
                placeholder="Ej: Spam, acoso, contenido inapropiado..."
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {razonBloqueo.length}/200 caracteres
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    await servicioPerfil.bloquearUsuario(
                      usuarioPerfil._id,
                      razonBloqueo.trim() || undefined
                    );
                    setMostrarModalBloqueo(false);
                    setRazonBloqueo("");
                    navigate("/");
                  } catch (error: any) {
                    alert(error.message || "Error al bloquear usuario");
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
              >
                Sí, bloquear
              </button>
              <button
                onClick={() => {
                  setMostrarModalBloqueo(false);
                  setRazonBloqueo("");
                }}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalEliminarAmigo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Eliminar amigo</h3>
            <p className="text-neutral-300 mb-6">
              ¿Estás seguro de que quieres eliminar a{" "}
              {usuarioPerfil.nombreArtistico || usuarioPerfil.nick} de tus
              amigos?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModalEliminarAmigo(false)}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={manejarEliminarAmigo}
                disabled={cargandoAccion}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalDejarSeguir && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Dejar de seguir</h3>
            <p className="text-neutral-300 mb-6">
              ¿Estás seguro de que quieres dejar de seguir a{" "}
              {usuarioPerfil.nombreArtistico || usuarioPerfil.nick}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModalDejarSeguir(false)}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={manejarDejarDeSeguir}
                disabled={cargandoAccion}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Dejar de seguir
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalEliminarCancion && cancionAEliminar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-400">
              Eliminar canción
            </h3>
            <p className="text-neutral-300 mb-2">
              ¿Estás seguro de que quieres eliminar{" "}
              <strong>{cancionAEliminar.titulo}</strong>?
            </p>
            <p className="text-sm text-red-400 mb-6">
              Esta acción no se puede deshacer y la canción se eliminará
              permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalEliminarCancion(false);
                  setCancionAEliminar(null);
                }}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={manejarEliminarCancion}
                disabled={cargandoAccion}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalSuspendido && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-yellow-600/20 p-3 rounded-full">
                <Ban className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Tu cuenta está suspendida
                </h3>
                <p className="text-gray-300 mb-3">
                  No puedes ver perfiles de otros usuarios mientras tu cuenta
                  esté suspendida.
                </p>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">
                    Razón de la suspensión:
                  </p>
                  <p className="text-yellow-400 font-medium">
                    {(usuarioActual as any)?.razonSuspension ||
                      "Violación de normas comunitarias"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setMostrarModalSuspendido(false);
                navigate("/", { replace: true });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {cancionComentarios && (
        <SongCommentsModal
          song={cancionComentarios}
          isOpen={!!cancionComentarios}
          onClose={() => setCancionComentarios(null)}
        />
      )}

      {cancionAEditar && (
        <EditSongModal
          isOpen={mostrarModalEditarCancion}
          onClose={() => {
            setMostrarModalEditarCancion(false);
            setCancionAEditar(null);
          }}
          onSave={manejarGuardarCancionEditada}
          song={cancionAEditar}
        />
      )}

      {mostrarModalReporte && usuarioPerfil && (
        <ReportModal
          isOpen={mostrarModalReporte}
          onClose={() => setMostrarModalReporte(false)}
          contentType="usuario"
          contentId={usuarioPerfil._id}
          contentTitle={usuarioPerfil.nombreArtistico || usuarioPerfil.nick}
        />
      )}
    </div>
  );
}
