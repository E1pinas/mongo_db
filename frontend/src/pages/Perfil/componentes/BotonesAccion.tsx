import { UserPlus, UserCheck, UserX, Ban, Flag } from "lucide-react";
import type { EstadoRelacion } from "../tipos";

interface PropsBotonesAccion {
  estadoRelacion: EstadoRelacion;
  estaSiguiendo: boolean;
  aceptaSolicitudes: boolean;
  cargandoAccion: boolean;
  alSeguir: () => void;
  alDejarDeSeguir: () => void;
  alEnviarSolicitud: () => void;
  alAceptarSolicitud: () => void;
  alRechazarSolicitud: () => void;
  alCancelarSolicitud: () => void;
  alEliminarAmigo: () => void;
  alReportar: () => void;
  alBloquear: () => void;
}

export const BotonesAccion: React.FC<PropsBotonesAccion> = ({
  estadoRelacion,
  estaSiguiendo,
  aceptaSolicitudes,
  cargandoAccion,
  alSeguir,
  alDejarDeSeguir,
  alEnviarSolicitud,
  alAceptarSolicitud,
  alRechazarSolicitud,
  alCancelarSolicitud,
  alEliminarAmigo,
  alReportar,
  alBloquear,
}) => {
  const renderizarBotonPrincipal = () => {
    if (estadoRelacion === "bloqueado") {
      return (
        <button
          disabled
          className="px-6 py-2.5 bg-red-900/30 border border-red-700 rounded-lg font-semibold text-red-400 cursor-not-allowed"
        >
          <Ban className="w-4 h-4 inline mr-2" />
          Usuario Bloqueado
        </button>
      );
    }

    if (estadoRelacion === "amigos") {
      return (
        <button
          onClick={alEliminarAmigo}
          disabled={cargandoAccion}
          className="px-5 py-2 bg-green-900/30 border border-green-700 hover:bg-red-900/30 hover:border-red-700 rounded-lg backdrop-blur-sm font-medium transition-colors flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          <span>Amigos</span>
        </button>
      );
    }

    if (estadoRelacion === "pendiente_recibida") {
      return (
        <div className="flex gap-2">
          <button
            onClick={alAceptarSolicitud}
            disabled={cargandoAccion}
            className="px-5 py-2 bg-green-600/80 hover:bg-green-700/80 rounded-lg backdrop-blur-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Aceptar Solicitud</span>
          </button>
          <button
            onClick={alRechazarSolicitud}
            disabled={cargandoAccion}
            className="px-4 py-2 bg-neutral-800/80 hover:bg-neutral-700/80 rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50"
          >
            <UserX className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (estadoRelacion === "pendiente_enviada") {
      return (
        <button
          onClick={alCancelarSolicitud}
          disabled={cargandoAccion}
          className="px-5 py-2 bg-yellow-900/30 border border-yellow-700 hover:bg-red-900/30 hover:border-red-700 rounded-lg backdrop-blur-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <UserX className="w-4 h-4" />
          <span>Cancelar Solicitud</span>
        </button>
      );
    }

    // Estado "ninguno"
    return (
      <button
        onClick={aceptaSolicitudes ? alEnviarSolicitud : undefined}
        disabled={cargandoAccion || !aceptaSolicitudes}
        className={`px-5 py-2 rounded-lg backdrop-blur-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
          aceptaSolicitudes
            ? "bg-green-600/80 hover:bg-green-700/80"
            : "bg-neutral-700/80 cursor-not-allowed"
        }`}
      >
        <UserPlus className="w-4 h-4" />
        <span>
          {aceptaSolicitudes ? "Agregar Amigo" : "No Acepta Solicitudes"}
        </span>
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. Botón principal de amistad/solicitud */}
      {renderizarBotonPrincipal()}

      {/* 2. Botón de seguir/dejar de seguir */}
      {estadoRelacion !== "bloqueado" && (
        <button
          onClick={estaSiguiendo ? alDejarDeSeguir : alSeguir}
          disabled={cargandoAccion}
          className={`px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 backdrop-blur-sm ${
            estaSiguiendo
              ? "bg-neutral-700/80 hover:bg-neutral-600/80"
              : "bg-blue-600/80 hover:bg-blue-700/80"
          }`}
        >
          {estaSiguiendo ? "Siguiendo" : "Seguir"}
        </button>
      )}

      {/* 3. Botón Reportar Usuario */}
      {estadoRelacion !== "bloqueado" && (
        <button
          onClick={alReportar}
          className="px-5 py-2 bg-neutral-700/80 hover:bg-neutral-600/80 backdrop-blur-sm rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Flag className="w-4 h-4 text-yellow-500" />
          <span>Reportar Usuario</span>
        </button>
      )}

      {/* 4. Botón Bloquear Usuario */}
      {estadoRelacion !== "bloqueado" && (
        <button
          onClick={alBloquear}
          className="px-5 py-2 bg-red-600/80 hover:bg-red-700/80 backdrop-blur-sm rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Ban className="w-4 h-4" />
          <span>Bloquear Usuario</span>
        </button>
      )}
    </div>
  );
};
