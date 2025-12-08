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
  tipoContenido: string;
  motivo: string;
  estado: string;
  prioridad: string;
  createdAt: string;
  contenidoDetalle?: any;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reportes" | "usuarios" | "contenido"
  >("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroReportes, setFiltroReportes] = useState<string>("pendiente");

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
      const reportesRes = await fetch(
        `http://localhost:3900/api/moderacion/reportes?limit=50${estadoParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const reportesData = await reportesRes.json();
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
      await fetch(
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
      loadDashboardData(); // Recargar datos
    } catch (error) {
      console.error("Error resolviendo reporte:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-gray-400">
                  {user.role === "super_admin"
                    ? "Super Administrador"
                    : "Administrador"}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400">Sesión: {user.nick}</div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("reportes")}
              className={`px-4 py-2 rounded-lg transition relative ${
                activeTab === "reportes"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Reportes
              {stats && stats.reportes.pendientes > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.reportes.pendientes}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("usuarios")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "usuarios"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("contenido")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "contenido"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Music className="w-4 h-4 inline mr-2" />
              Contenido
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && stats && (
          <DashboardView stats={stats} reportes={reportes} />
        )}
        {activeTab === "reportes" && (
          <ReportesView
            reportes={reportes}
            onResolve={handleResolverReporte}
            filtroEstado={filtroReportes}
            setFiltroEstado={setFiltroReportes}
          />
        )}
        {activeTab === "usuarios" && <UsuariosView />}
        {activeTab === "contenido" && <ContenidoView />}
      </div>
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
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">
            {stats.usuarios.suspendidos} usuarios suspendidos actualmente
          </span>
        </div>
      </div>
    )}

    {/* Reportes Recientes */}
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        Reportes Recientes (Pendientes)
      </h2>
      {reportes.length === 0 ? (
        <p className="text-gray-400">No hay reportes pendientes 🎉</p>
      ) : (
        <div className="space-y-3">
          {reportes.slice(0, 5).map((reporte) => (
            <ReporteCard key={reporte._id} reporte={reporte} compact />
          ))}
        </div>
      )}
    </div>

    {/* Nuevos Usuarios */}
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-500" />
        Actividad Reciente
      </h2>
      <div className="text-gray-300">
        <p>
          📈 {stats.usuarios.nuevosUltimos30Dias} nuevos usuarios en los últimos
          30 días
        </p>
      </div>
    </div>
  </div>
);

// Reportes View
const ReportesView = ({
  reportes,
  onResolve,
  filtroEstado,
  setFiltroEstado,
}: {
  reportes: Reporte[];
  onResolve: (id: string, accion: string, razon: string) => void;
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
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              No hay reportes {filtroEstado === "todos" ? "" : filtroEstado}
            </p>
          </div>
        ) : (
          reportes.map((reporte) => (
            <ReporteCard
              key={reporte._id}
              reporte={reporte}
              onResolve={onResolve}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Usuarios View
const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const buscarUsuarios = async () => {
    if (!busqueda.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3900/api/usuarios/buscar?q=${encodeURIComponent(
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
    } finally {
      setLoading(false);
    }
  };

  const suspenderUsuario = async (
    usuarioId: string,
    dias: number,
    razon: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:3900/api/moderacion/usuarios/${usuarioId}/suspender`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dias, razon }),
        }
      );
      alert("Usuario suspendido correctamente");
      buscarUsuarios();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error suspendiendo usuario:", error);
      alert("Error al suspender usuario");
    }
  };

  const banearUsuario = async (usuarioId: string, razon: string) => {
    if (!confirm("¿Estás seguro de banear permanentemente a este usuario?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:3900/api/moderacion/usuarios/${usuarioId}/banear`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ razon }),
        }
      );
      alert("Usuario baneado correctamente");
      buscarUsuarios();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error baneando usuario:", error);
      alert("Error al banear usuario");
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
      alert("Usuario reactivado correctamente");
      buscarUsuarios();
      setSelectedUser(null);
    } catch (error) {
      console.error("Error reactivando usuario:", error);
      alert("Error al reactivar usuario");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>

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
              <div
                key={usuario._id}
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">@{usuario.nick}</p>
                    {usuario.nombreArtistico && (
                      <span className="text-purple-400 text-sm">
                        ({usuario.nombreArtistico})
                      </span>
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
                  {usuario.suspensionHasta &&
                    new Date(usuario.suspensionHasta) > new Date() && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Suspendido hasta:{" "}
                        {new Date(usuario.suspensionHasta).toLocaleDateString()}
                      </p>
                    )}
                </div>

                <div className="flex gap-2">
                  {usuario.estado === "activo" && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedUser({ ...usuario, accion: "suspender" })
                        }
                        className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                      >
                        <Clock className="w-4 h-4 inline mr-1" />
                        Suspender
                      </button>
                      <button
                        onClick={() =>
                          setSelectedUser({ ...usuario, accion: "banear" })
                        }
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                      >
                        <Ban className="w-4 h-4 inline mr-1" />
                        Banear
                      </button>
                    </>
                  )}
                  {usuario.estado !== "activo" && (
                    <button
                      onClick={() => reactivarUsuario(usuario._id)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Reactivar
                    </button>
                  )}
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
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {selectedUser.accion === "suspender"
                ? "Suspender Usuario"
                : "Banear Usuario"}
            </h3>

            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                Usuario:{" "}
                <span className="text-white font-semibold">
                  @{selectedUser.nick}
                </span>
              </p>

              {selectedUser.accion === "suspender" && (
                <div className="mb-3">
                  <label className="block text-sm text-gray-400 mb-2">
                    Días de suspensión:
                  </label>
                  <select
                    id="dias-suspension"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                  >
                    <option value="1">1 día</option>
                    <option value="3">3 días</option>
                    <option value="7">7 días</option>
                    <option value="14">14 días</option>
                    <option value="30">30 días</option>
                  </select>
                </div>
              )}

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

                  if (selectedUser.accion === "suspender") {
                    const dias = parseInt(
                      (
                        document.getElementById(
                          "dias-suspension"
                        ) as HTMLSelectElement
                      )?.value || "7"
                    );
                    suspenderUsuario(selectedUser._id, dias, razon);
                  } else {
                    banearUsuario(selectedUser._id, razon);
                  }
                }}
                className={`px-4 py-2 rounded ${
                  selectedUser.accion === "suspender"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Contenido View
const ContenidoView = () => {
  const [tipoContenido, setTipoContenido] = useState<
    "canciones" | "albumes" | "playlists"
  >("canciones");
  const [contenido, setContenido] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  const buscarContenido = async () => {
    if (!busqueda.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let endpoint = "";
      if (tipoContenido === "canciones") {
        endpoint = `http://localhost:3900/api/canciones?busqueda=${encodeURIComponent(
          busqueda
        )}`;
      } else if (tipoContenido === "albumes") {
        endpoint = `http://localhost:3900/api/albumes?busqueda=${encodeURIComponent(
          busqueda
        )}`;
      } else {
        endpoint = `http://localhost:3900/api/playlists?busqueda=${encodeURIComponent(
          busqueda
        )}`;
      }

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (tipoContenido === "canciones") {
        setContenido(data.canciones || []);
      } else if (tipoContenido === "albumes") {
        setContenido(data.albumes || []);
      } else {
        setContenido(data.playlists || []);
      }
    } catch (error) {
      console.error("Error buscando contenido:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarContenido = async (
    id: string,
    tipo: string,
    nombre: string
  ) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar este ${tipo}?\n"${nombre}"\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    const razon = prompt("Razón de la eliminación:");
    if (!razon) return;

    try {
      const token = localStorage.getItem("token");
      let endpoint = "";

      if (tipo === "cancion") {
        endpoint = `http://localhost:3900/api/moderacion/canciones/${id}`;
      } else if (tipo === "album") {
        endpoint = `http://localhost:3900/api/moderacion/albumes/${id}`;
      } else if (tipo === "playlist") {
        endpoint = `http://localhost:3900/api/moderacion/playlists/${id}`;
      }

      await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ razon }),
      });

      alert(
        `${
          tipo.charAt(0).toUpperCase() + tipo.slice(1)
        } eliminado correctamente`
      );
      buscarContenido();
    } catch (error) {
      console.error("Error eliminando contenido:", error);
      alert("Error al eliminar el contenido");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Gestión de Contenido</h2>

        {/* Selector de tipo */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTipoContenido("canciones")}
            className={`px-4 py-2 rounded-lg ${
              tipoContenido === "canciones"
                ? "bg-purple-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <Music className="w-4 h-4 inline mr-2" />
            Canciones
          </button>
          <button
            onClick={() => setTipoContenido("albumes")}
            className={`px-4 py-2 rounded-lg ${
              tipoContenido === "albumes"
                ? "bg-purple-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <Disc className="w-4 h-4 inline mr-2" />
            Álbumes
          </button>
          <button
            onClick={() => setTipoContenido("playlists")}
            className={`px-4 py-2 rounded-lg ${
              tipoContenido === "playlists"
                ? "bg-purple-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <ListMusic className="w-4 h-4 inline mr-2" />
            Playlists
          </button>
        </div>

        {/* Buscador */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && buscarContenido()}
            placeholder={`Buscar ${tipoContenido}...`}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={buscarContenido}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg disabled:opacity-50"
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
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Imagen */}
                  {item.portada && (
                    <img
                      src={item.portada}
                      alt={item.titulo || item.nombre}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {item.titulo || item.nombre}
                    </p>
                    {item.artista && (
                      <p className="text-gray-400 text-sm">
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
                <button
                  onClick={() =>
                    eliminarContenido(
                      item._id,
                      tipoContenido === "canciones"
                        ? "cancion"
                        : tipoContenido === "albumes"
                        ? "album"
                        : "playlist",
                      item.titulo || item.nombre
                    )
                  }
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm ml-4"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Eliminar
                </button>
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
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
};

const ReporteCard = ({
  reporte,
  compact,
  onResolve,
}: {
  reporte: Reporte;
  compact?: boolean;
  onResolve?: (id: string, accion: string, razon: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

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

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {tipoIcons[reporte.tipoContenido as keyof typeof tipoIcons]}
            <span className="font-semibold capitalize">
              {reporte.tipoContenido}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded ${
                prioridadColors[
                  reporte.prioridad as keyof typeof prioridadColors
                ]
              }`}
            >
              {reporte.prioridad}
            </span>
          </div>
          <p className="text-gray-300 text-sm">
            Motivo: <span className="text-white">{reporte.motivo}</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Por: @{reporte.reportadoPor.nick} •{" "}
            {new Date(reporte.createdAt).toLocaleDateString()}
          </p>
        </div>

        {!compact && onResolve && (
          <button
            onClick={() => setShowActions(!showActions)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm"
          >
            Resolver
          </button>
        )}
      </div>

      {showActions && onResolve && (
        <div className="mt-4 pt-4 border-t border-gray-600 flex gap-2">
          <button
            onClick={() =>
              onResolve(reporte._id, "eliminar_contenido", "Viola políticas")
            }
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Eliminar
          </button>
          <button
            onClick={() =>
              onResolve(reporte._id, "advertencia", "Primera advertencia")
            }
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
          >
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Advertir
          </button>
          <button
            onClick={() =>
              onResolve(reporte._id, "ninguna", "Reporte inválido")
            }
            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
          >
            <XCircle className="w-4 h-4 inline mr-1" />
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
