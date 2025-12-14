import { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  CheckCircle,
  Trash2,
  X,
  AlertTriangle,
  Ban,
  Heart,
  Shield,
} from "lucide-react";
import { servicioAdmin } from "../servicios";
import { useAuth } from "../../../contexts/AuthContext";
import ToastComponent from "../../../components/common/Toast";

type ToastType = "success" | "error" | "info";

interface Toast {
  mensaje: string;
  tipo: ToastType;
  mostrar: boolean;
}

export const VistaUsuarios: React.FC = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [historialConducta, setHistorialConducta] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | "activo" | "suspendido"
  >("todos");
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<any>(null);
  const [toast, setToast] = useState<Toast>({
    mensaje: "",
    tipo: "info",
    mostrar: false,
  });

  const mostrarNotificacionToast = (mensaje: string, tipo: ToastType) => {
    setToast({ mensaje, tipo, mostrar: true });
  };

  const buscarUsuarios = async () => {
    if (!busqueda.trim()) {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const estadoParam =
          filtroEstado !== "todos" ? `&estado=${filtroEstado}` : "";
        const res = await fetch(
          `http://localhost:3900/api/moderacion/usuarios?limit=50${estadoParam}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const usuariosFiltrados = (data.usuarios || [])
          .filter((u: any) => u.role === "user")
          .filter((u: any) => {
            if (filtroEstado === "todos") return true;
            if (filtroEstado === "activo") return u.estado === "activo";
            if (filtroEstado === "suspendido") return u.estado === "suspendido";
            return true;
          });
        setUsuarios(usuariosFiltrados);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      } finally {
        setCargando(false);
      }
      return;
    }

    try {
      setCargando(true);
      const usuarios = await servicioAdmin.buscarUsuarios(
        busqueda,
        filtroEstado
      );
      setUsuarios(usuarios.usuarios || []);
    } catch (error) {
      console.error("Error buscando usuarios:", error);
      mostrarNotificacionToast("Error al buscar usuarios", "error");
    } finally {
      setCargando(false);
    }
  };

  const suspenderUsuario = async (
    usuarioId: string,
    razon: string,
    dias: number
  ) => {
    try {
      await servicioAdmin.suspenderUsuario(usuarioId, razon, dias);
      mostrarNotificacionToast("Usuario suspendido correctamente", "success");
      buscarUsuarios();
    } catch (error) {
      console.error("Error suspendiendo usuario:", error);
      mostrarNotificacionToast("Error al suspender usuario", "error");
    } finally {
      setUsuarioSeleccionado(null);
    }
  };

  const abrirModalEliminarUsuario = (usuario: any) => {
    setUsuarioAEliminar(usuario);
    setMostrarModalEliminar(true);
  };

  const eliminarUsuario = async () => {
    if (!usuarioAEliminar) return;

    try {
      const token = localStorage.getItem("token");
      const esAdmin = usuarioAEliminar.role === "admin";
      const endpoint = esAdmin
        ? `http://localhost:3900/api/admin/${usuarioAEliminar._id}`
        : `http://localhost:3900/api/admin/usuarios/${usuarioAEliminar._id}/eliminar`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setMostrarModalEliminar(false);
        setUsuarioAEliminar(null);

        if (data.eliminado) {
          mostrarNotificacionToast(
            `Usuario eliminado permanentemente.\n\n📊 Contenido eliminado:\n• Canciones: ${data.eliminado.canciones}\n• Álbumes: ${data.eliminado.albumes}\n• Playlists: ${data.eliminado.playlists}\n• Archivos R2: ${data.eliminado.archivosR2}`,
            "success"
          );
        } else {
          mostrarNotificacionToast(
            "Administrador eliminado correctamente",
            "success"
          );
        }
      } else {
        mostrarNotificacionToast(
          data.message || "Error al eliminar usuario",
          "error"
        );
      }

      buscarUsuarios();
      setUsuarioSeleccionado(null);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      mostrarNotificacionToast("Error al eliminar usuario", "error");
    }
  };

  const reactivarUsuario = async (usuarioId: string) => {
    try {
      await servicioAdmin.levantarSuspension(usuarioId);
      buscarUsuarios();
      setUsuarioSeleccionado(null);
      mostrarNotificacionToast("Usuario reactivado correctamente", "success");
    } catch (error) {
      console.error("Error reactivando usuario:", error);
      mostrarNotificacionToast("Error al reactivar usuario", "error");
    }
  };

  const cargarHistorialConducta = async (usuarioId: string) => {
    try {
      setCargandoHistorial(true);
      const historial = await servicioAdmin.obtenerHistorialConducta(usuarioId);
      setHistorialConducta(historial.historialConducta || []);
    } catch (error) {
      console.error("Error cargando historial:", error);
      mostrarNotificacionToast(
        "Error al cargar historial de conducta",
        "error"
      );
      setHistorialConducta([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  useEffect(() => {
    if (usuarioSeleccionado?.accion === "historial") {
      cargarHistorialConducta(usuarioSeleccionado._id);
    }
  }, [usuarioSeleccionado]);

  useEffect(() => {
    if (usuarios.length > 0 || filtroEstado !== "todos") {
      buscarUsuarios();
    }
  }, [filtroEstado]);

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Gestión de Usuarios
          </h2>
        </div>

        {/* Filtros de estado */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFiltroEstado("todos")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "todos"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroEstado("activo")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "activo"
                ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                : "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltroEstado("suspendido")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "suspendido"
                ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/30"
                : "bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
            }`}
          >
            Suspendidos
          </button>
        </div>

        {/* Buscador */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && buscarUsuarios()}
            placeholder="Buscar por nick o email..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={buscarUsuarios}
            disabled={cargando}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {cargando ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Resultados */}
        {usuarios.length > 0 && (
          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario._id}
                className="bg-neutral-900 rounded-lg p-4 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {usuario.nombreArtistico && (
                        <p className="font-semibold text-lg">
                          {usuario.nombreArtistico}
                        </p>
                      )}
                      <span className="text-neutral-400 text-sm">
                        (@{usuario.nick})
                      </span>

                      {usuario.estado !== "activo" && (
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            usuario.estado === "suspendido"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                        >
                          {usuario.estado}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm">{usuario.email}</p>

                    {usuario.estado === "suspendido" && (
                      <div className="text-yellow-400 text-xs mt-1">
                        {usuario.razonSuspension && (
                          <p>Razón: {usuario.razonSuspension}</p>
                        )}
                        {(usuario as any).suspendidoHasta && (
                          <p className="mt-0.5">
                            Expira:{" "}
                            {new Date(
                              (usuario as any).suspendidoHasta
                            ).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {!(usuario as any).suspendidoHasta && (
                          <p className="mt-0.5 font-semibold">
                            ⚠️ Suspensión permanente
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end">
                    {usuario.role === "user" && (
                      <button
                        onClick={() =>
                          setUsuarioSeleccionado({
                            ...usuario,
                            accion: "historial",
                          })
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm whitespace-nowrap"
                        title="Ver historial de conducta"
                      >
                        <Activity className="w-4 h-4 inline mr-1" />
                        Historial
                      </button>
                    )}

                    {usuario.estado === "activo" &&
                      usuario.role !== "super_admin" &&
                      (usuario.role === "user" ||
                        user?.role === "super_admin") && (
                        <button
                          onClick={() =>
                            setUsuarioSeleccionado({
                              ...usuario,
                              accion: "suspender",
                            })
                          }
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm whitespace-nowrap"
                        >
                          <Clock className="w-4 h-4 inline mr-1" />
                          Suspender
                        </button>
                      )}

                    {usuario.estado !== "activo" &&
                      usuario.role !== "super_admin" && (
                        <button
                          onClick={() => reactivarUsuario(usuario._id)}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Reactivar
                        </button>
                      )}

                    {usuario.role !== "super_admin" &&
                      (usuario.role === "user" ||
                        user?.role === "super_admin") && (
                        <button
                          onClick={() => abrirModalEliminarUsuario(usuario)}
                          className="bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-sm whitespace-nowrap border border-red-700"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Eliminar
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {usuarios.length === 0 && busqueda && !cargando && (
          <p className="text-gray-400 text-center py-4">
            No se encontraron usuarios
          </p>
        )}
      </div>

      {/* Modal de suspensión */}
      {usuarioSeleccionado && usuarioSeleccionado.accion === "suspender" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-neutral-800 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Suspender Usuario
            </h3>

            <div className="mb-4">
              <p className="text-neutral-300 mb-4">
                Usuario:{" "}
                <span className="text-white font-semibold">
                  @{usuarioSeleccionado.nick}
                </span>
              </p>

              <div className="mb-4 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 rounded-xl">
                <p className="text-sm text-yellow-200 font-semibold mb-2">
                  ℹ️ La suspensión desactiva funcionalidades:
                </p>
                <ul className="text-xs text-yellow-300 mt-2 ml-4 list-disc space-y-1">
                  <li>No podrá escuchar música</li>
                  <li>No podrá crear álbumes, canciones o playlists</li>
                  <li>No podrá ver perfiles de otros usuarios</li>
                  <li>Podrá iniciar sesión pero sin funcionalidades</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Duración de la suspensión:
                </label>
                <select
                  id="dias-suspension"
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
                >
                  <option value="3">3 días</option>
                  <option value="7">7 días (1 semana)</option>
                  <option value="14">14 días (2 semanas)</option>
                  <option value="30">30 días (1 mes)</option>
                  <option value="0">
                    Permanente (hasta reactivar manualmente)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Razón:
                </label>
                <textarea
                  id="razon-moderacion"
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="Describe el motivo..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUsuarioSeleccionado(null)}
                className="bg-neutral-700 hover:bg-neutral-600 px-6 py-2.5 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const razon =
                    (
                      document.getElementById(
                        "razon-moderacion"
                      ) as HTMLTextAreaElement
                    )?.value || "Sin razón especificada";
                  const dias = parseInt(
                    (
                      document.getElementById(
                        "dias-suspension"
                      ) as HTMLSelectElement
                    )?.value || "7"
                  );
                  suspenderUsuario(usuarioSeleccionado._id, razon, dias);
                }}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-yellow-500/30"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Conducta */}
      {usuarioSeleccionado && usuarioSeleccionado.accion === "historial" && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Historial de Conducta - @{usuarioSeleccionado.nick}
              </h3>
              <button
                onClick={() => {
                  setUsuarioSeleccionado(null);
                  setHistorialConducta([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3 bg-gray-700/50 p-2.5 rounded-lg">
              <div className="text-xs text-gray-300">
                <strong>{historialConducta.length}</strong> registros en
                historial
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {cargandoHistorial ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400">Cargando historial...</div>
                </div>
              ) : historialConducta.length === 0 ? (
                <div className="text-center py-8 bg-gray-700/30 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-300 font-semibold text-sm">
                    Sin historial de conducta
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Este usuario no tiene registros de advertencias o sanciones
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historialConducta.map((registro, index) => {
                    const accionColors: Record<string, string> = {
                      advertencia: "border-yellow-500 bg-yellow-500/10",
                      contenido_eliminado: "border-red-500 bg-red-500/10",
                      suspension: "border-orange-500 bg-orange-500/10",
                      vida_restaurada: "border-green-500 bg-green-500/10",
                      vida_agregada: "border-blue-500 bg-blue-500/10",
                    };

                    const accionIcons: Record<string, any> = {
                      advertencia: (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ),
                      contenido_eliminado: (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      ),
                      suspension: <Ban className="w-4 h-4 text-orange-500" />,
                      vida_restaurada: (
                        <Heart className="w-4 h-4 text-green-500 fill-current" />
                      ),
                      vida_agregada: (
                        <Heart className="w-4 h-4 text-blue-500 fill-current" />
                      ),
                    };

                    return (
                      <div
                        key={index}
                        className={`border-l-4 ${
                          accionColors[registro.accion] ||
                          "border-gray-500 bg-gray-700/30"
                        } rounded-r-lg p-3`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {accionIcons[registro.accion]}
                            <span className="font-semibold text-white text-sm capitalize">
                              {registro.accion.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-gray-400">
                              {new Date(registro.fecha).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(registro.fecha).toLocaleTimeString(
                                "es-ES",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>

                        {registro.tipoContenido && (
                          <div className="text-sm text-gray-300 mb-1">
                            <span className="text-gray-400">Tipo:</span>{" "}
                            <span className="capitalize">
                              {registro.tipoContenido}
                            </span>
                            {registro.nombreContenido && (
                              <span className="text-gray-400">
                                {" "}
                                - "{registro.nombreContenido}"
                              </span>
                            )}
                          </div>
                        )}

                        {registro.razon && (
                          <div className="text-sm text-gray-300 mb-2 bg-gray-900/50 p-2 rounded">
                            <span className="text-gray-400">Razón:</span>{" "}
                            {registro.razon}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Shield className="w-3 h-3" />
                            <span>
                              Moderador: @
                              {registro.moderador?.nick || "Sistema"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <button
                onClick={() => {
                  setUsuarioSeleccionado(null);
                  setHistorialConducta([]);
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación de Usuario */}
      {mostrarModalEliminar && usuarioAEliminar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full border-2 border-red-600/50 shadow-2xl shadow-red-600/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Eliminar{" "}
                  {usuarioAEliminar.role === "admin"
                    ? "Administrador"
                    : "Usuario"}
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Esta acción NO se puede deshacer
                </p>
              </div>
            </div>

            <div className="mb-5 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <p className="font-semibold text-white text-lg">
                @{usuarioAEliminar.nick}
              </p>
              {usuarioAEliminar.nombreArtistico && (
                <p className="text-purple-400 text-sm mt-1">
                  {usuarioAEliminar.nombreArtistico}
                </p>
              )}
              <p className="text-neutral-400 text-sm mt-1">
                {usuarioAEliminar.email}
              </p>
              {usuarioAEliminar.role === "admin" && (
                <div className="mt-2 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded inline-block">
                  <Shield className="w-3 h-3 inline mr-1" />
                  <span className="text-xs text-purple-300 font-semibold">
                    Administrador
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-xl">
              <p className="text-xs text-red-400 font-bold mb-1.5">
                ⚠️ ADVERTENCIA FINAL
              </p>
              {usuarioAEliminar.role === "admin" ? (
                <p className="text-xs text-red-300">
                  Se eliminará permanentemente al administrador del sistema.
                </p>
              ) : (
                <div className="text-xs text-red-300">
                  <p className="font-semibold mb-1">
                    Se eliminará permanentemente:
                  </p>
                  <ul className="ml-3 list-disc space-y-0.5 text-[11px]">
                    <li>Cuenta del usuario</li>
                    <li>Todas sus canciones</li>
                    <li>Todos sus álbumes</li>
                    <li>Todas sus playlists</li>
                    <li>Todos sus comentarios</li>
                    <li>Todos sus posts y reposts</li>
                    <li>Archivos de audio e imágenes</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMostrarModalEliminar(false);
                  setUsuarioAEliminar(null);
                }}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarUsuario}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-500/30"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.mostrar && (
        <ToastComponent
          message={toast.mensaje}
          type={toast.tipo}
          onClose={() => setToast({ ...toast, mostrar: false })}
        />
      )}
    </div>
  );
};
