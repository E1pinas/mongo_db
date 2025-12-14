import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Toast from "../../components/common/Toast";
import { Users, AlertTriangle, Music, Shield, Ban, Eye } from "lucide-react";
import {
  useEstadisticasAdmin,
  useReportes,
  useNotificacionToast,
} from "./hooks";
import {
  PestañaPanelControl,
  PestañaReportes,
  VistaUsuarios,
  VistaContenido,
  VistaAdministradores,
} from "./components";
import { TipoPestañaAdmin } from "./tipos";
import { servicioAdmin } from "./servicios/adminApi";

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [pestañaActiva, setPestañaActiva] =
    useState<TipoPestañaAdmin>("panelControl");
  const [filtroReportes, setFiltroReportes] = useState("pendiente");

  // Modales para gestión de contenido
  const [modalOcultarCancion, setModalOcultarCancion] = useState<any>(null);
  const [modalQuitarOcultamiento, setModalQuitarOcultamiento] =
    useState<any>(null);
  const [razonOcultar, setRazonOcultar] = useState("");

  const { estadisticas, cargando: cargandoStats } = useEstadisticasAdmin();
  const { reportes, resolverReporte, cambiarEstado } =
    useReportes(filtroReportes);
  const {
    mensaje,
    tipo,
    mostrar,
    mostrarNotificacionToast,
    ocultarNotificacionToast,
  } = useNotificacionToast();

  // Funciones para gestión de canciones
  const abrirModalOcultar = (cancion: any) => {
    setModalOcultarCancion(cancion);
    setRazonOcultar("");
  };

  const ocultarCancion = async () => {
    if (!razonOcultar.trim()) {
      mostrarNotificacionToast(
        "Debes proporcionar una razón para ocultar la canción",
        "warning"
      );
      return;
    }

    if (!modalOcultarCancion || !modalOcultarCancion._id) {
      mostrarNotificacionToast(
        "Error: No se pudo identificar la canción",
        "error"
      );
      return;
    }

    try {
      await servicioAdmin.ocultarCancion(modalOcultarCancion._id, razonOcultar);
      setModalOcultarCancion(null);
      setRazonOcultar("");
      mostrarNotificacionToast("Canción ocultada exitosamente", "success");
      // Recargar datos para reflejar los cambios
      window.location.reload();
    } catch (error: any) {
      console.error("Error ocultando canción:", error);
      mostrarNotificacionToast(
        error.message || "Error al ocultar canción",
        "error"
      );
    }
  };

  const abrirModalQuitar = (cancion: any) => {
    setModalQuitarOcultamiento(cancion);
  };

  const quitarOcultamiento = async () => {
    if (!modalQuitarOcultamiento || !modalQuitarOcultamiento._id) {
      mostrarNotificacionToast(
        "Error: No se pudo identificar la canción",
        "error"
      );
      return;
    }

    try {
      await servicioAdmin.mostrarCancion(modalQuitarOcultamiento._id);
      setModalQuitarOcultamiento(null);
      mostrarNotificacionToast("Ocultamiento quitado exitosamente", "success");
      // Recargar datos para reflejar los cambios
      window.location.reload();
    } catch (error: any) {
      console.error("Error quitando ocultamiento:", error);
      mostrarNotificacionToast(
        error.message || "Error al quitar ocultamiento",
        "error"
      );
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Navigate to="/" replace />;
  }

  if (cargandoStats) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl font-semibold">
            Cargando panel de administración...
          </div>
        </div>
      </div>
    );
  }

  const pestañas = [
    {
      id: "panelControl",
      nombre: "Panel de Control",
      icono: <Shield className="w-5 h-5" />,
    },
    {
      id: "reportes",
      nombre: "Reportes",
      icono: <AlertTriangle className="w-5 h-5" />,
      badge: estadisticas?.reportes.pendientes,
    },
    {
      id: "usuarios",
      nombre: "Usuarios",
      icono: <Users className="w-5 h-5" />,
    },
    {
      id: "contenido",
      nombre: "Contenido",
      icono: <Music className="w-5 h-5" />,
    },
  ];

  if (user.role === "super_admin") {
    pestañas.push({
      id: "administradores",
      nombre: "Administradores",
      icono: <Ban className="w-5 h-5" />,
      badge: undefined,
    });
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Panel de Administración
          </h1>
          <p className="text-neutral-400">
            Gestiona usuarios, contenido y reportes de la plataforma
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {pestañas.map((pestaña) => (
            <button
              key={pestaña.id}
              onClick={() => setPestañaActiva(pestaña.id as TipoPestañaAdmin)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap relative ${
                pestañaActiva === pestaña.id
                  ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {pestaña.icono}
              {pestaña.nombre}
              {pestaña.badge && pestaña.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pestaña.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div>
          {pestañaActiva === "panelControl" && estadisticas && (
            <PestañaPanelControl estadisticas={estadisticas} />
          )}

          {pestañaActiva === "reportes" && (
            <PestañaReportes
              reportes={reportes}
              alResolver={async (id, accion, razon) => {
                const resultado = await resolverReporte(id, accion, razon);
                if (resultado.success) {
                  mostrarNotificacionToast(
                    "Reporte resuelto correctamente",
                    "success"
                  );
                } else {
                  mostrarNotificacionToast(
                    resultado.error || "Error al resolver",
                    "error"
                  );
                }
              }}
              alCambiarEstado={async (id, estado) => {
                const resultado = await cambiarEstado(id, estado);
                if (resultado.success) {
                  mostrarNotificacionToast("Estado actualizado", "success");
                } else {
                  mostrarNotificacionToast(
                    resultado.error || "Error al cambiar estado",
                    "error"
                  );
                }
              }}
              filtroEstado={filtroReportes}
              establecerFiltroEstado={setFiltroReportes}
              mostrarNotificacionToast={mostrarNotificacionToast}
            />
          )}

          {pestañaActiva === "usuarios" && <VistaUsuarios />}

          {pestañaActiva === "contenido" && (
            <VistaContenido
              abrirModalOcultar={abrirModalOcultar}
              abrirModalQuitar={abrirModalQuitar}
            />
          )}

          {pestañaActiva === "administradores" &&
            user.role === "super_admin" && <VistaAdministradores />}
        </div>
      </div>

      {mostrar && (
        <Toast
          message={mensaje}
          type={tipo}
          onClose={ocultarNotificacionToast}
        />
      )}

      {/* Modal para ocultar canción */}
      {modalOcultarCancion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full border-2 border-yellow-600/50 shadow-2xl shadow-yellow-600/20">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Ban className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Ocultar Canción
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  No se eliminará pero no se podrá reproducir
                </p>
              </div>
            </div>

            <div className="mb-5 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <p className="font-semibold text-white text-lg">
                {modalOcultarCancion.titulo}
              </p>
              {modalOcultarCancion.artista && (
                <p className="text-green-400 text-sm mt-1 font-medium">
                  {typeof modalOcultarCancion.artista === "string"
                    ? modalOcultarCancion.artista
                    : modalOcultarCancion.artista.nombreArtistico ||
                      modalOcultarCancion.artista.nick}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Razón del ocultamiento (obligatorio):
              </label>
              <textarea
                value={razonOcultar}
                onChange={(e) => setRazonOcultar(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm min-h-[100px] resize-none focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                placeholder="Explica por qué esta canción debe ser ocultada. El artista recibirá esta información."
              />
            </div>

            <div className="mb-4 p-2.5 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
              <p className="text-xs text-yellow-400 font-medium">
                ⚠️ El artista recibirá una notificación con tu razón.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setModalOcultarCancion(null);
                  setRazonOcultar("");
                }}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={ocultarCancion}
                disabled={!razonOcultar.trim()}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:shadow-none"
              >
                Ocultar Canción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para quitar ocultamiento */}
      {modalQuitarOcultamiento && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-sm w-full border-2 border-green-600/50 shadow-2xl shadow-green-600/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Quitar Ocultamiento
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  La canción volverá a estar disponible
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <p className="font-semibold text-white text-lg">
                {modalQuitarOcultamiento.titulo}
              </p>
              {modalQuitarOcultamiento.artista && (
                <p className="text-green-400 text-sm mt-1 font-medium">
                  {typeof modalQuitarOcultamiento.artista === "string"
                    ? modalQuitarOcultamiento.artista
                    : modalQuitarOcultamiento.artista.nombreArtistico ||
                      modalQuitarOcultamiento.artista.nick}
                </p>
              )}
              {modalQuitarOcultamiento.razonOculta && (
                <div className="mt-3 p-3 bg-yellow-900/10 border border-yellow-700/50 rounded-lg">
                  <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                    Razón del ocultamiento:
                  </p>
                  <p className="text-sm text-neutral-200 mt-1">
                    {modalQuitarOcultamiento.razonOculta}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4 p-2.5 bg-green-900/20 border border-green-700/50 rounded-xl">
              <p className="text-xs text-green-400 font-medium">
                ✓ La canción volverá a estar disponible para todos los usuarios.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModalQuitarOcultamiento(null)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={quitarOcultamiento}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-green-500/30"
              >
                Quitar Ocultamiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
