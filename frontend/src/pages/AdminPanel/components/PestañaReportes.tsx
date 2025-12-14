import { TarjetaReporte } from "./TarjetaReporte";
import { Reporte } from "../tipos";

type ToastType = "success" | "error" | "info";

interface PropsPestañaReportes {
  reportes: Reporte[];
  alResolver: (id: string, accion: string, razon: string) => void;
  alCambiarEstado: (id: string, estado: string) => void;
  filtroEstado: string;
  establecerFiltroEstado: (estado: string) => void;
  mostrarNotificacionToast?: (mensaje: string, tipo: ToastType) => void;
}

export const PestañaReportes: React.FC<PropsPestañaReportes> = ({
  reportes,
  alResolver,
  alCambiarEstado,
  filtroEstado,
  establecerFiltroEstado,
  mostrarNotificacionToast,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => establecerFiltroEstado("todos")}
          className={`px-4 py-2 rounded ${
            filtroEstado === "todos"
              ? "bg-purple-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => establecerFiltroEstado("pendiente")}
          className={`px-4 py-2 rounded ${
            filtroEstado === "pendiente"
              ? "bg-red-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => establecerFiltroEstado("en_revision")}
          className={`px-4 py-2 rounded ${
            filtroEstado === "en_revision"
              ? "bg-yellow-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          En Revisión
        </button>
        <button
          onClick={() => establecerFiltroEstado("resuelto")}
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
            <TarjetaReporte
              key={reporte._id}
              reporte={reporte}
              alResolver={alResolver}
              alCambiarEstado={alCambiarEstado}
              mostrarNotificacionToast={mostrarNotificacionToast}
            />
          ))
        )}
      </div>
    </div>
  );
};
