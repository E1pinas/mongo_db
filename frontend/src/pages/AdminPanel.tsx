import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  Music,
  Disc,
  ListMusic,
  MessageSquare,
  BarChart3,
  Activity,
  Shield,
  Ban,
  Clock,
  Trash2,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Heart,
  UserPlus,
  X,
  Eye,
} from "lucide-react";

interface Stats {
  usuarios: {
    total: number;
    activos: number;
    suspendidos: number;
    nuevosUltimos30Dias: number;
  };
  contenido: {
    canciones: number;
    albumes: number;
    playlists: number;
  };
  reportes: {
    total: number;
    pendientes: number;
  };
}

interface Reporte {
  _id: string;
  reportadoPor: {
    nick: string;
    nombreArtistico?: string;
  };
  asignadoA?: {
    nick: string;
    nombreArtistico?: string;
  };
  tipoContenido: string;
  motivo: string;
  descripcion?: string;
  estado: string;
  prioridad: string;
  createdAt: string;
  contenidoDetalle?: any;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reportes" | "usuarios" | "contenido" | "administradores"
  >("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroReportes, setFiltroReportes] = useState<string>("pendiente");

  // Estados para modal de ocultar canción
  const [showOcultarModal, setShowOcultarModal] = useState(false);
  const [cancionAOcultar, setCancionAOcultar] = useState<any>(null);
  const [razonOcultar, setRazonOcultar] = useState("");

  // Estados para modal de quitar ocultamiento
  const [showQuitarModal, setShowQuitarModal] = useState(false);
  const [cancionAMostrar, setCancionAMostrar] = useState<any>(null);

  // Verificar que sea admin o super_admin
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadDashboardData();
  }, [activeTab, filtroReportes]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Cargar estadísticas
      const statsRes = await fetch(
        "http://localhost:3900/api/moderacion/estadisticas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const statsData = await statsRes.json();
      setStats(statsData.estadisticas);

      // Cargar reportes con filtro
      const estadoParam =
        filtroReportes === "todos" ? "" : `&estado=${filtroReportes}`;
      const url = `http://localhost:3900/api/moderacion/reportes?limit=50${estadoParam}`;
      console.log("🔍 Cargando reportes desde:", url);
      console.log("📊 Filtro actual:", filtroReportes);

      const reportesRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reportesData = await reportesRes.json();
      console.log("✅ Reportes recibidos:", reportesData.reportes?.length || 0);
      console.log("📦 Datos completos:", reportesData);
      setReportes(reportesData.reportes || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolverReporte = async (
    reporteId: string,
    accion: string,
    razon: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3900/api/moderacion/reportes/${reporteId}/resolver`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accion, nota: razon }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        loadDashboardData(); // Recargar datos

        // Mensajes específicos según la acción
        let mensaje = "Reporte resuelto correctamente";
        if (accion === "eliminar_contenido") {
          mensaje = "Contenido eliminado exitosamente";
        } else if (accion === "suspender_usuario") {
          mensaje = "Usuario suspendido correctamente";
        } else if (accion === "banear_usuario") {
          mensaje = "Usuario baneado permanentemente";
        } else if (accion === "advertencia") {
          mensaje = "Advertencia enviada al usuario";
        }

        alert(mensaje);
      } else {
        alert(data.message || "Error al resolver reporte");
      }
    } catch (error) {
      console.error("Error resolviendo reporte:", error);
      alert("Error al resolver reporte");
    }
  };

  const handleCambiarEstado = async (reporteId: string, estado: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:3900/api/moderacion/reportes/${reporteId}/estado`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado }),
        }
      );
      loadDashboardData(); // Recargar datos
      alert(`Reporte marcado como ${estado}`);
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Error al cambiar estado del reporte");
    }
  };

  // Funciones para gestión de contenido
  const abrirModalOcultar = (cancion: any) => {
    setCancionAOcultar(cancion);
    setRazonOcultar("");
    setShowOcultarModal(true);
  };

  const ocultarCancion = async () => {
    if (!razonOcultar.trim()) {
      alert("Debes proporcionar una razón para ocultar la canción");
      return;
    }

    if (!cancionAOcultar || !cancionAOcultar._id) {
      alert("Error: No se pudo identificar la canción");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3900/api/moderacion/canciones/${cancionAOcultar._id}/ocultar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ razon: razonOcultar }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowOcultarModal(false);
        setCancionAOcultar(null);
        setRazonOcultar("");
        alert("Canción ocultada exitosamente");
        // Recargar datos para reflejar los cambios
        window.location.reload();
      } else {
        alert(data.message || "Error al ocultar canción");
      }
    } catch (error) {
      console.error("Error ocultando canción:", error);
      alert(
        `Error al ocultar canción: ${error.message || "Error desconocido"}`
      );
    }
  };

  const abrirModalQuitar = (cancion: any) => {
    setCancionAMostrar(cancion);
    setShowQuitarModal(true);
  };

  const quitarOcultamiento = async () => {
    if (!cancionAMostrar || !cancionAMostrar._id) {
      alert("Error: No se pudo identificar la canción");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3900/api/moderacion/canciones/${cancionAMostrar._id}/mostrar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setShowQuitarModal(false);
        setCancionAMostrar(null);
        alert("Ocultamiento quitado exitosamente");
        // Recargar datos para reflejar los cambios
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || "Error al quitar ocultamiento");
      }
    } catch (error) {
      console.error("Error quitando ocultamiento:", error);
      alert("Error al quitar ocultamiento");
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-800 sticky top-0 z-10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-sm text-neutral-400 font-medium">
                  {user.role === "super_admin"
                    ? "Super Administrador"
                    : "Administrador"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700">
              <span className="text-sm text-neutral-300 font-medium">
                {user.nick}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 border border-neutral-700"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Todo
            </button>
            <button
              onClick={() => setActiveTab("reportes")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all relative ${
                activeTab === "reportes"
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 border border-neutral-700"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Reportes
              {stats && stats.reportes.pendientes > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-red-500/50">
                  {stats.reportes.pendientes}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("usuarios")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === "usuarios"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 border border-neutral-700"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("contenido")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === "contenido"
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 border border-neutral-700"
              }`}
            >
              <Music className="w-4 h-4 inline mr-2" />
              Contenido
            </button>
            {/* Tab de Administradores (solo super_admin) */}
            {user?.role === "super_admin" && (
              <button
                onClick={() => setActiveTab("administradores")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === "administradores"
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 border border-neutral-700"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Administradores
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="backdrop-blur-sm">
          {activeTab === "dashboard" && stats && (
            <DashboardView stats={stats} reportes={reportes} />
          )}
          {activeTab === "reportes" && (
            <ReportesView
              reportes={reportes}
              onResolve={handleResolverReporte}
              onCambiarEstado={handleCambiarEstado}
              filtroEstado={filtroReportes}
              setFiltroEstado={setFiltroReportes}
            />
          )}
          {activeTab === "usuarios" && <UsuariosView />}
          {activeTab === "contenido" && (
            <ContenidoView
              abrirModalOcultar={abrirModalOcultar}
              abrirModalQuitar={abrirModalQuitar}
            />
          )}
        </div>
      </div>

      {/* Modal para ocultar canción */}
      {showOcultarModal && cancionAOcultar && (
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
                {cancionAOcultar.titulo}
              </p>
              {cancionAOcultar.artista && (
                <p className="text-green-400 text-sm mt-1 font-medium">
                  {typeof cancionAOcultar.artista === "string"
                    ? cancionAOcultar.artista
                    : cancionAOcultar.artista.nombreArtistico ||
                      cancionAOcultar.artista.nick}
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
                  setShowOcultarModal(false);
                  setCancionAOcultar(null);
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
      {showQuitarModal && cancionAMostrar && (
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
                {cancionAMostrar.titulo}
              </p>
              {cancionAMostrar.artista && (
                <p className="text-green-400 text-sm mt-1 font-medium">
                  {typeof cancionAMostrar.artista === "string"
                    ? cancionAMostrar.artista
                    : cancionAMostrar.artista.nombreArtistico ||
                      cancionAMostrar.artista.nick}
                </p>
              )}
              {cancionAMostrar.razonOculta && (
                <div className="mt-3 p-3 bg-yellow-900/10 border border-yellow-700/50 rounded-lg">
                  <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                    Razón del ocultamiento:
                  </p>
                  <p className="text-sm text-neutral-200 mt-1">
                    {cancionAMostrar.razonOculta}
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
                onClick={() => {
                  setShowQuitarModal(false);
                  setCancionAMostrar(null);
                }}
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

// Dashboard View
const DashboardView = ({
  stats,
  reportes,
}: {
  stats: Stats;
  reportes: Reporte[];
}) => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="w-6 h-6" />}
        title="Total Usuarios"
        value={stats.usuarios.total}
        subtitle={`${stats.usuarios.activos} activos`}
        color="blue"
      />
      <StatCard
        icon={<Music className="w-6 h-6" />}
        title="Canciones"
        value={stats.contenido.canciones}
        color="green"
      />
      <StatCard
        icon={<Disc className="w-6 h-6" />}
        title="Álbumes"
        value={stats.contenido.albumes}
        color="purple"
      />
      <StatCard
        icon={<AlertTriangle className="w-6 h-6" />}
        title="Reportes Pendientes"
        value={stats.reportes.pendientes}
        subtitle={`${stats.reportes.total} total`}
        color="red"
      />
    </div>

    {/* Usuarios Suspendidos */}
    {stats.usuarios.suspendidos > 0 && (
      <div className="bg-yellow-900/10 border border-yellow-700/50 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-yellow-400">
          <Clock className="w-6 h-6" />
          <span className="font-semibold text-lg">
            {stats.usuarios.suspendidos} usuarios suspendidos actualmente
          </span>
        </div>
      </div>
    )}

    {/* Reportes Recientes */}
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all">
      <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
        <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
          Reportes Recientes (Pendientes)
        </span>
      </h2>
      {reportes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-400 text-lg">No hay reportes pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.slice(0, 5).map((reporte) => (
            <ReporteCard key={reporte._id} reporte={reporte} compact />
          ))}
        </div>
      )}
    </div>

    {/* Nuevos Usuarios */}
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all">
      <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
        <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
          Actividad Reciente
        </span>
      </h2>
      <div className="text-neutral-300 text-lg">
        <p>
          📈{" "}
          <span className="font-bold text-white">
            {stats.usuarios.nuevosUltimos30Dias}
          </span>{" "}
          nuevos usuarios en los últimos 30 días
        </p>
      </div>
    </div>
  </div>
);

// Reportes View
const ReportesView = ({
  reportes,
  onResolve,
  onCambiarEstado,
  filtroEstado,
  setFiltroEstado,
}: {
  reportes: Reporte[];
  onResolve: (id: string, accion: string, razon: string) => void;
  onCambiarEstado: (id: string, estado: string) => void;
  filtroEstado: string;
  setFiltroEstado: (estado: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setFiltroEstado("todos")}
          className={`px-4 py-2 rounded ${
            filtroEstado === "todos"
              ? "bg-purple-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroEstado("pendiente")}
          className={`px-4 py-2 rounded ${
            filtroEstado === "pendiente"
              ? "bg-red-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltroEstado("en_revision")}
          className={`px-4 py-2 rounded ${
            filtroEstado === "en_revision"
              ? "bg-yellow-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          En Revisión
        </button>
        <button
          onClick={() => setFiltroEstado("resuelto")}
          className={`px-4 py-2 rounded ${
            filtroEstado === "resuelto"
              ? "bg-green-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Resueltos
        </button>
      </div>

      <div className="space-y-4">
        {reportes.length === 0 ? (
          <div className="bg-neutral-900/60 rounded-2xl p-12 text-center border border-neutral-800">
            <p className="text-neutral-400 text-lg">
              No hay reportes {filtroEstado === "todos" ? "" : filtroEstado}
            </p>
          </div>
        ) : (
          reportes.map((reporte) => (
            <ReporteCard
              key={reporte._id}
              reporte={reporte}
              onResolve={onResolve}
              onCambiarEstado={onCambiarEstado}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Usuarios View
const UsuariosView = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCrearAdmin, setShowCrearAdmin] = useState(false);
  const [historialConducta, setHistorialConducta] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [showOcultarModal, setShowOcultarModal] = useState(false);
  const [cancionAOcultar, setCancionAOcultar] = useState<any>(null);
  const [razonOcultar, setRazonOcultar] = useState("");

  // Estado para modal de eliminación de usuarios
  const [showEliminarUsuarioModal, setShowEliminarUsuarioModal] =
    useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<any>(null);

  const [nuevoAdmin, setNuevoAdmin] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    nick: "",
    pais: "",
    fechaNacimiento: "",
  });

  const buscarUsuarios = async () => {
    if (!busqueda.trim()) {
      // Si no hay búsqueda, cargar todos los usuarios
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3900/api/moderacion/usuarios?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setUsuarios(data.usuarios || []);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Usar endpoint de moderación para búsqueda completa con todos los campos
      const res = await fetch(
        `http://localhost:3900/api/moderacion/usuarios/buscar?q=${encodeURIComponent(
          busqueda
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error("Error buscando usuarios:", error);
      alert("Error al buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const suspenderUsuario = async (
    usuarioId: string,
    razon: string,
    dias: number
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3900/api/admin/usuarios/${usuarioId}/suspender`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ razon, dias }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Error al suspender usuario");
      }

      buscarUsuarios();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error suspendiendo usuario:", error);
      alert("Error al suspender usuario");
    }
  };

  const abrirModalEliminarUsuario = (usuario: any) => {
    setUsuarioAEliminar(usuario);
    setShowEliminarUsuarioModal(true);
  };

  const eliminarUsuario = async () => {
    if (!usuarioAEliminar) return;

    try {
      const token = localStorage.getItem("token");
      const esAdmin = usuarioAEliminar.role === "admin";

      // Usar endpoint diferente si es admin
      const endpoint = esAdmin
        ? `http://localhost:3900/api/admin/${usuarioAEliminar._id}`
        : `http://localhost:3900/api/admin/usuarios/${usuarioAEliminar._id}/eliminar`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setShowEliminarUsuarioModal(false);
        setUsuarioAEliminar(null);

        if (data.eliminado) {
          alert(
            `Usuario eliminado permanentemente.\n\n📊 Contenido eliminado:\n• Canciones: ${data.eliminado.canciones}\n• Álbumes: ${data.eliminado.albumes}\n• Playlists: ${data.eliminado.playlists}\n• Archivos R2: ${data.eliminado.archivosR2} (audio, imágenes, portadas)`
          );
        } else {
          alert("Administrador eliminado correctamente");
        }
      } else {
        alert(data.message || "Error al eliminar usuario");
      }

      buscarUsuarios();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert("Error al eliminar usuario");
    }
  };

  const reactivarUsuario = async (usuarioId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:3900/api/moderacion/usuarios/${usuarioId}/reactivar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      buscarUsuarios();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error reactivando usuario:", error);
      alert("Error al reactivar usuario");
    }
  };

  const cargarHistorialConducta = async (usuarioId: string) => {
    try {
      setLoadingHistorial(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3900/api/admin/usuarios/${usuarioId}/conducta`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.status === "success") {
        setHistorialConducta(data.historialConducta || []);
      } else {
        alert("Error al cargar historial");
        setHistorialConducta([]);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
      alert("Error al cargar historial de conducta");
      setHistorialConducta([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Efecto para cargar historial cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUser?.accion === "historial") {
      cargarHistorialConducta(selectedUser._id);
    }
  }, [selectedUser]);

  const crearAdministrador = async () => {
    if (
      !nuevoAdmin.nombre ||
      !nuevoAdmin.apellidos ||
      !nuevoAdmin.email ||
      !nuevoAdmin.password ||
      !nuevoAdmin.nick ||
      !nuevoAdmin.pais ||
      !nuevoAdmin.fechaNacimiento
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3900/api/admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoAdmin),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Administrador creado correctamente");
        setShowCrearAdmin(false);
        setNuevoAdmin({
          nombre: "",
          apellidos: "",
          email: "",
          password: "",
          nick: "",
          pais: "",
          fechaNacimiento: "",
        });
        buscarUsuarios();
      } else {
        alert(data.message || "Error al crear administrador");
      }
    } catch (error) {
      console.error("Error creando administrador:", error);
      alert("Error al crear administrador");
    }
  };

  // Debug
  console.log("UsuariosView - Usuario:", user?.nick, "Role:", user?.role);

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Gestión de Usuarios
          </h2>

          {/* Botón para crear admin (solo super_admin) */}
          {user?.role === "super_admin" && (
            <button
              onClick={() => setShowCrearAdmin(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30 font-semibold"
            >
              <UserPlus className="w-5 h-5" />
              Crear Administrador
            </button>
          )}
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
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Resultados */}
        {usuarios.length > 0 && (
          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div key={usuario._id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg">@{usuario.nick}</p>
                      {usuario.nombreArtistico && (
                        <span className="text-purple-400 text-sm">
                          ({usuario.nombreArtistico})
                        </span>
                      )}

                      {/* Vidas del usuario */}
                      {usuario.role === "user" && (
                        <div className="flex items-center gap-1 bg-linear-to-r from-pink-600 to-purple-600 px-3 py-1 rounded-full">
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="font-bold text-sm">
                            {usuario.vidas || 3}
                          </span>
                        </div>
                      )}

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

                    {usuario.estado === "baneado" && usuario.razonBaneo && (
                      <p className="text-red-400 text-xs mt-1">
                        Razón: {usuario.razonBaneo}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end">
                    {/* Ver historial de conducta (solo usuarios normales) */}
                    {usuario.role === "user" && (
                      <button
                        onClick={() =>
                          setSelectedUser({ ...usuario, accion: "historial" })
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm whitespace-nowrap"
                        title="Ver historial de conducta"
                      >
                        <Activity className="w-4 h-4 inline mr-1" />
                        Historial
                      </button>
                    )}

                    {/* Suspender: usuarios normales (ambos roles) o admins normales (solo super_admin) */}
                    {usuario.estado === "activo" &&
                      usuario.role !== "super_admin" &&
                      (usuario.role === "user" ||
                        user?.role === "super_admin") && (
                        <button
                          onClick={() =>
                            setSelectedUser({ ...usuario, accion: "suspender" })
                          }
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm whitespace-nowrap"
                        >
                          <Clock className="w-4 h-4 inline mr-1" />
                          Suspender
                        </button>
                      )}

                    {/* Reactivar usuario suspendido */}
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

                    {/* Eliminar: usuarios normales (ambos roles) o admins normales (solo super_admin) */}
                    {usuario.role !== "super_admin" &&
                      (usuario.role === "user" ||
                        user?.role === "super_admin") && (
                        <button
                          onClick={() => abrirModalEliminarUsuario(usuario)}
                          className="bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-sm whitespace-nowrap border border-red-700"
                          title={
                            usuario.role === "admin"
                              ? "Eliminar administrador PERMANENTEMENTE"
                              : "Eliminar usuario y todo su contenido PERMANENTEMENTE"
                          }
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

        {usuarios.length === 0 && busqueda && !loading && (
          <p className="text-gray-400 text-center py-4">
            No se encontraron usuarios
          </p>
        )}
      </div>

      {/* Modal de acción */}
      {selectedUser && selectedUser.accion === "suspender" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-5 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-3">Suspender Usuario</h3>

            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                Usuario:{" "}
                <span className="text-white font-semibold">
                  @{selectedUser.nick}
                </span>
              </p>

              <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
                <p className="text-sm text-yellow-200">
                  ℹ️ La suspensión desactiva funcionalidades:
                </p>
                <ul className="text-xs text-yellow-300 mt-2 ml-4 list-disc">
                  <li>No podrá escuchar música</li>
                  <li>No podrá crear álbumes, canciones o playlists</li>
                  <li>No podrá ver perfiles de otros usuarios</li>
                  <li>Podrá iniciar sesión pero sin funcionalidades</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Duración de la suspensión:
                </label>
                <select
                  id="dias-suspension"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
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
                <label className="block text-sm text-gray-400 mb-2">
                  Razón:
                </label>
                <textarea
                  id="razon-moderacion"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                  rows={3}
                  placeholder="Describe el motivo..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
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
                  suspenderUsuario(selectedUser._id, razon, dias);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear administrador */}
      {showCrearAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-5 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-500" />
                Crear Nuevo Administrador
              </h3>
              <button
                onClick={() => {
                  setShowCrearAdmin(false);
                  setNuevoAdmin({
                    nombre: "",
                    apellidos: "",
                    email: "",
                    password: "",
                    nick: "",
                    pais: "",
                    fechaNacimiento: "",
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nuevoAdmin.nombre}
                    onChange={(e) =>
                      setNuevoAdmin({ ...nuevoAdmin, nombre: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nuevoAdmin.apellidos}
                    onChange={(e) =>
                      setNuevoAdmin({
                        ...nuevoAdmin,
                        apellidos: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Nick <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nuevoAdmin.nick}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, nick: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="admin_juan"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={nuevoAdmin.email}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, email: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="admin@tcgmusic.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={nuevoAdmin.password}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, password: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  value={nuevoAdmin.pais}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, pais: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Seleccionar país</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="España">España</option>
                  <option value="México">México</option>
                  <option value="Perú">Perú</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={nuevoAdmin.fechaNacimiento}
                  onChange={(e) =>
                    setNuevoAdmin({
                      ...nuevoAdmin,
                      fechaNacimiento: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  max={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18)
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-sm text-purple-300">
                  <Shield className="w-4 h-4 inline mr-1" />
                  El nuevo usuario tendrá permisos de{" "}
                  <strong>administrador</strong> y podrá moderar contenido y
                  usuarios.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCrearAdmin(false);
                  setNuevoAdmin({
                    nombre: "",
                    apellidos: "",
                    email: "",
                    password: "",
                    nick: "",
                    pais: "",
                    fechaNacimiento: "",
                  });
                }}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearAdministrador}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Crear Administrador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Conducta  fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-5 p-4*/}
      {selectedUser && selectedUser.accion === "historial" && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-10 p-4">
          <div className="bg-gray-800 rounded-lg p-4 max-w-2xl w-full max-h-[50vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Historial de Conducta - @{selectedUser.nick}
              </h3>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setHistorialConducta([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3 bg-gray-700/50 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-current" />
                <span className="text-white font-bold text-base">
                  {selectedUser.vidas || 3}
                </span>
                <span className="text-gray-400 text-xs">vidas actuales</span>
              </div>
              <div className="h-5 w-px bg-gray-600"></div>
              <div className="text-xs text-gray-300">
                <strong>{historialConducta.length}</strong> registros en
                historial
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingHistorial ? (
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
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-pink-500 fill-current" />
                            <span className="text-gray-400">
                              {registro.vidasRestantes} vidas
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
                  setSelectedUser(null);
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
      {showEliminarUsuarioModal && usuarioAEliminar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-5 p-4">
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
                  setShowEliminarUsuarioModal(false);
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
    </div>
  );
};

// Contenido View
const ContenidoView = ({
  abrirModalOcultar,
  abrirModalQuitar,
}: {
  abrirModalOcultar: (cancion: any) => void;
  abrirModalQuitar: (cancion: any) => void;
}) => {
  const [tipoContenido, setTipoContenido] = useState<
    "canciones" | "albumes" | "playlists"
  >("canciones");
  const [contenido, setContenido] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para modal de eliminación
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [contenidoAEliminar, setContenidoAEliminar] = useState<any>(null);
  const [razonEliminacion, setRazonEliminacion] = useState("");

  const buscarContenido = async () => {
    if (!busqueda.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let endpoint = "";
      if (tipoContenido === "canciones") {
        endpoint = `http://localhost:3900/api/canciones/buscar?q=${encodeURIComponent(
          busqueda
        )}`;
      } else if (tipoContenido === "albumes") {
        endpoint = `http://localhost:3900/api/albumes/buscar?q=${encodeURIComponent(
          busqueda
        )}`;
      } else {
        endpoint = `http://localhost:3900/api/playlists/buscar?q=${encodeURIComponent(
          busqueda
        )}`;
      }

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      console.log("Respuesta búsqueda:", data);

      if (tipoContenido === "canciones") {
        setContenido(data.canciones || data || []);
      } else if (tipoContenido === "albumes") {
        setContenido(data.albumes || data || []);
      } else {
        setContenido(data.playlists || data || []);
      }
    } catch (error) {
      console.error("Error buscando contenido:", error);
      alert("Error al buscar contenido");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEliminar = (item: any, tipo: string) => {
    setContenidoAEliminar({ ...item, tipo });
    setRazonEliminacion("");
    setShowEliminarModal(true);
  };

  const eliminarContenido = async () => {
    if (!razonEliminacion.trim()) {
      alert("Debes proporcionar una razón para la eliminación");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const { _id, tipo, titulo, nombre } = contenidoAEliminar;
      let endpoint = "";

      if (tipo === "cancion") {
        endpoint = `http://localhost:3900/api/moderacion/canciones/${_id}`;
      } else if (tipo === "album") {
        endpoint = `http://localhost:3900/api/moderacion/albumes/${_id}`;
      } else if (tipo === "playlist") {
        endpoint = `http://localhost:3900/api/moderacion/playlists/${_id}`;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ razon: razonEliminacion }),
      });

      if (response.ok) {
        setShowEliminarModal(false);
        setContenidoAEliminar(null);
        setRazonEliminacion("");
        alert(
          `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} "${
            titulo || nombre
          }" eliminado correctamente`
        );
        buscarContenido();
      } else {
        const data = await response.json();
        alert(data.message || "Error al eliminar contenido");
      }
    } catch (error) {
      console.error("Error eliminando contenido:", error);
      alert("Error al eliminar contenido");
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
            onClick={() => setTipoContenido("canciones")}
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
            onClick={() => setTipoContenido("albumes")}
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
            onClick={() => setTipoContenido("playlists")}
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
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-green-500/30 transition-all"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Resultados */}
        {contenido.length > 0 && (
          <div className="space-y-3">
            {contenido.map((item) => (
              <div
                key={item._id}
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Botón de Play Grande (solo para canciones) */}
                  {tipoContenido === "canciones" && item.audioUrl && (
                    <button
                      onClick={() => {
                        const audio = new Audio(item.audioUrl);
                        audio.play();
                      }}
                      className="flex-shrink-0 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                      title="Reproducir canción"
                    >
                      <Play className="w-7 h-7 ml-1" />
                    </button>
                  )}

                  {/* Imagen */}
                  {(item.portadaUrl || item.portada) && (
                    <img
                      src={item.portadaUrl || item.portada}
                      alt={item.titulo || item.nombre}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {item.titulo || item.nombre}
                    </p>
                    {item.artista && (
                      <p className="text-blue-400 text-base font-medium">
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
                          Quitar
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

        {contenido.length === 0 && busqueda && !loading && (
          <p className="text-gray-400 text-center py-4">
            No se encontró contenido
          </p>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showEliminarModal && contenidoAEliminar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-10 p-4">
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
                  setShowEliminarModal(false);
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
    </div>
  );
};

// Components
const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
  color: "blue" | "green" | "purple" | "red";
}) => {
  const colorClasses = {
    blue: "from-blue-600 to-blue-500 shadow-blue-500/20",
    green: "from-green-600 to-green-500 shadow-green-500/20",
    purple: "from-purple-600 to-purple-500 shadow-purple-500/20",
    red: "from-red-600 to-red-500 shadow-red-500/20",
  };

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-400 text-sm font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-neutral-500 text-sm mt-2 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const ReporteCard = ({
  reporte,
  compact,
  onResolve,
  onCambiarEstado,
}: {
  reporte: Reporte;
  compact?: boolean;
  onResolve?: (id: string, accion: string, razon: string) => void;
  onCambiarEstado?: (id: string, estado: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const prioridadColors = {
    urgente: "bg-red-600",
    alta: "bg-orange-600",
    media: "bg-yellow-600",
    baja: "bg-blue-600",
  };

  const tipoIcons = {
    cancion: <Music className="w-4 h-4" />,
    album: <Disc className="w-4 h-4" />,
    playlist: <ListMusic className="w-4 h-4" />,
    comentario: <MessageSquare className="w-4 h-4" />,
    usuario: <Users className="w-4 h-4" />,
  };

  const handlePlayPreview = () => {
    if (!reporte.contenidoDetalle?.audioUrl) return;

    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        audioPlayer.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(reporte.contenidoDetalle.audioUrl);
      audio.addEventListener("ended", () => setIsPlaying(false));
      audio.play();
      setAudioPlayer(audio);
      setIsPlaying(true);
    }
  };

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
      }
    };
  }, [audioPlayer]);

  const getArtistNames = (artistas: any[]) => {
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
            {tipoIcons[reporte.tipoContenido as keyof typeof tipoIcons]}
            <span className="font-semibold capitalize text-white">
              {reporte.tipoContenido}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded font-medium ${
                prioridadColors[
                  reporte.prioridad as keyof typeof prioridadColors
                ]
              }`}
            >
              {reporte.prioridad.toUpperCase()}
            </span>
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
                  reporte.contenidoDetalle.nick ||
                  "Sin título"}
              </h3>
              {reporte.tipoContenido === "cancion" &&
                reporte.contenidoDetalle.artistas && (
                  <p className="text-gray-400 text-sm">
                    Por: {getArtistNames(reporte.contenidoDetalle.artistas)}
                  </p>
                )}
              {reporte.tipoContenido === "album" &&
                reporte.contenidoDetalle.artistas && (
                  <p className="text-gray-400 text-sm">
                    Por: {getArtistNames(reporte.contenidoDetalle.artistas)}
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
            <p className="text-red-400 text-sm font-semibold mb-1">
              Motivo: {reporte.motivo.replace(/_/g, " ")}
            </p>
            {reporte.descripcion && (
              <p className="text-gray-300 text-sm">{reporte.descripcion}</p>
            )}
          </div>

          {/* Info del reportador y asignación */}
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">
              Reportado por: @
              {reporte.reportadoPor.nombreArtistico ||
                reporte.reportadoPor.nick}{" "}
              •{" "}
              {new Date(reporte.createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {reporte.asignadoA && (
              <p className="text-purple-400 text-sm flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Asignado a: @
                {reporte.asignadoA.nombreArtistico || reporte.asignadoA.nick}
              </p>
            )}
          </div>

          {/* Reproductor para canciones */}
          {reporte.tipoContenido === "cancion" &&
            reporte.contenidoDetalle?.audioUrl && (
              <div className="mt-4 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-2">
                  Previsualizar canción reportada:
                </p>
                <button
                  onClick={handlePlayPreview}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isPlaying
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Reproducir
                    </>
                  )}
                </button>
              </div>
            )}
        </div>

        {/* Botones de acción */}
        {!compact && (onResolve || onCambiarEstado) && (
          <div className="shrink-0 flex flex-col gap-2">
            {/* Marcar como En Revisión (solo si está pendiente) */}
            {onCambiarEstado && reporte.estado === "pendiente" && (
              <button
                onClick={() => onCambiarEstado(reporte._id, "en_revision")}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                En Revisión
              </button>
            )}

            {/* Botón resolver (solo si está pendiente o en revisión) */}
            {onResolve &&
              (reporte.estado === "pendiente" ||
                reporte.estado === "en_revision") && (
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {showActions ? "Cancelar" : "Resolver"}
                </button>
              )}
          </div>
        )}
      </div>

      {/* Acciones de resolución */}
      {showActions && onResolve && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-3">
            Selecciona una acción para resolver este reporte:
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                onResolve(
                  reporte._id,
                  "eliminar_contenido",
                  "Contenido viola las políticas de la comunidad"
                )
              }
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar contenido
            </button>
            <button
              onClick={() =>
                onResolve(
                  reporte._id,
                  "suspender_usuario",
                  "Usuario suspendido por comportamiento inapropiado"
                )
              }
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Suspender usuario
            </button>
            <button
              onClick={() =>
                onResolve(
                  reporte._id,
                  "advertencia",
                  "Advertencia enviada al usuario"
                )
              }
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Enviar advertencia
            </button>
            <button
              onClick={() =>
                onResolve(reporte._id, "ninguna", "Reporte no procede")
              }
              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Rechazar reporte
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
