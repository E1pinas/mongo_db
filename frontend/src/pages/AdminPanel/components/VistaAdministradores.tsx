import { useState, useEffect } from "react";
import { UserPlus, Shield, Trash2, XCircle, AlertTriangle } from "lucide-react";
import Toast from "../../../components/common/Toast";
import { servicioAdmin } from "../servicios";
import { PAISES } from "../tipos";

type ToastType = "success" | "error" | "info";

export const VistaAdministradores: React.FC = () => {
  const [administradores, setAdministradores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [adminAEliminar, setAdminAEliminar] = useState<any>(null);
  const [nuevoAdmin, setNuevoAdmin] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    nick: "",
    pais: "",
    fechaNacimiento: "",
  });

  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState<ToastType>("info");
  const [mostrarToast, setMostrarToast] = useState(false);

  const mostrarNotificacionToast = (mensaje: string, tipo: ToastType) => {
    setMensajeToast(mensaje);
    setTipoToast(tipo);
    setMostrarToast(true);
  };

  useEffect(() => {
    cargarAdministradores();
  }, []);

  const cargarAdministradores = async () => {
    try {
      setCargando(true);
      const data = await servicioAdmin.obtenerAdministradores();
      if (data.status === "success") {
        setAdministradores(data.administradores || []);
      }
    } catch (error) {
      console.error("Error cargando administradores:", error);
      mostrarNotificacionToast("Error al cargar administradores", "error");
    } finally {
      setCargando(false);
    }
  };

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
      mostrarNotificacionToast("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      const data = await servicioAdmin.crearAdministrador(nuevoAdmin);
      if (data.status === "success") {
        mostrarNotificacionToast(
          "Administrador creado correctamente",
          "success"
        );
        setMostrarModalCrear(false);
        setNuevoAdmin({
          nombre: "",
          apellidos: "",
          email: "",
          password: "",
          nick: "",
          pais: "",
          fechaNacimiento: "",
        });
        cargarAdministradores();
      }
    } catch (error: any) {
      console.error("Error creando administrador:", error);
      mostrarNotificacionToast(
        error.message || "Error al crear administrador",
        "error"
      );
    }
  };

  const eliminarAdministrador = async () => {
    if (!adminAEliminar) return;

    try {
      await servicioAdmin.eliminarAdministrador(adminAEliminar._id);
      mostrarNotificacionToast(
        "Administrador eliminado correctamente",
        "success"
      );
      setAdminAEliminar(null);
      cargarAdministradores();
    } catch (error) {
      console.error("Error eliminando administrador:", error);
      mostrarNotificacionToast("Error al eliminar administrador", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Gestión de Administradores
          </h2>
          <button
            onClick={() => setMostrarModalCrear(true)}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/30 font-semibold"
          >
            <UserPlus className="w-5 h-5" />
            Crear Administrador
          </button>
        </div>

        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-neutral-400 mt-4">Cargando administradores...</p>
          </div>
        ) : administradores.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg">No hay administradores</p>
          </div>
        ) : (
          <div className="space-y-3">
            {administradores.map((admin) => (
              <div
                key={admin._id}
                className="bg-neutral-900 rounded-lg p-4 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg text-white">
                        {admin.nombreArtistico || admin.nombre}{" "}
                        {admin.apellidos}
                      </p>
                      <span className="text-neutral-400 text-sm">
                        (@{admin.nick})
                      </span>
                      <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-600 to-red-500 font-semibold">
                        {admin.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm">{admin.email}</p>
                    <p className="text-neutral-500 text-xs mt-1">
                      Creado:{" "}
                      {new Date(admin.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {admin.role !== "super_admin" && (
                    <button
                      onClick={() => setAdminAEliminar(admin)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Administrador */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-800 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-red-500" />
                Crear Nuevo Administrador
              </h3>
              <button
                onClick={() => setMostrarModalCrear(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nuevoAdmin.nombre}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, nombre: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Nombre del administrador"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={nuevoAdmin.apellidos}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, apellidos: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Apellidos"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Nick *
                </label>
                <input
                  type="text"
                  value={nuevoAdmin.nick}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, nick: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="@nickname"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  value={nuevoAdmin.email}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, email: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={nuevoAdmin.password}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, password: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Contraseña segura"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  País *
                </label>
                <select
                  value={nuevoAdmin.pais}
                  onChange={(e) =>
                    setNuevoAdmin({ ...nuevoAdmin, pais: e.target.value })
                  }
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-red-500 focus:outline-none transition-colors"
                >
                  <option value="">Seleccionar país</option>
                  {PAISES.map((pais) => (
                    <option key={pais.code} value={pais.nombre}>
                      {pais.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2 font-medium">
                  Fecha de Nacimiento *
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
                  className="w-full bg-neutral-800 text-white px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModalCrear(false)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearAdministrador}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30"
              >
                Crear Administrador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {adminAEliminar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border-2 border-red-600/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Eliminar Administrador
                </h3>
                <p className="text-neutral-400 text-sm">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 mb-4">
              <p className="text-white font-semibold mb-1">
                ¿Eliminar a @{adminAEliminar.nick}?
              </p>
              <p className="text-neutral-300 text-sm">
                {adminAEliminar.nombre} {adminAEliminar.apellidos}
              </p>
              <p className="text-neutral-400 text-sm">{adminAEliminar.email}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdminAEliminar(null)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarAdministrador}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30"
              >
                Eliminar
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
