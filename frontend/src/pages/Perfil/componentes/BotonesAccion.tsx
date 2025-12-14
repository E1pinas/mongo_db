import {
  UserPlus,
  UserCheck,
  UserX,
  Ban,
  Flag,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
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
  const [mostrarMenu, setMostrarMenu] = useState(false);

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
          className="px-6 py-2.5 bg-green-900/30 border border-green-700 hover:bg-red-900/30 hover:border-red-700 rounded-lg font-semibold transition-colors"
        >
          <UserCheck className="w-4 h-4 inline mr-2" />
          Amigos
        </button>
      );
    }

    if (estadoRelacion === "pendiente_recibida") {
      return (
        <div className="flex gap-2">
          <button
            onClick={alAceptarSolicitud}
            disabled={cargandoAccion}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Aceptar Solicitud
          </button>
          <button
            onClick={alRechazarSolicitud}
            disabled={cargandoAccion}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
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
          className="px-6 py-2.5 bg-yellow-900/30 border border-yellow-700 hover:bg-red-900/30 hover:border-red-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <UserX className="w-4 h-4 inline mr-2" />
          Solicitud Enviada
        </button>
      );
    }

    // Estado "ninguno"
    return (
      <button
        onClick={aceptaSolicitudes ? alEnviarSolicitud : undefined}
        disabled={cargandoAccion || !aceptaSolicitudes}
        className={`px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
          aceptaSolicitudes
            ? "bg-green-600 hover:bg-green-700"
            : "bg-neutral-700 cursor-not-allowed"
        }`}
      >
        <UserPlus className="w-4 h-4 inline mr-2" />
        {aceptaSolicitudes ? "Agregar Amigo" : "No Acepta Solicitudes"}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {/* Botón de seguir/dejar de seguir */}
      {estadoRelacion !== "bloqueado" && (
        <button
          onClick={estaSiguiendo ? alDejarDeSeguir : alSeguir}
          disabled={cargandoAccion}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
            estaSiguiendo
              ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {estaSiguiendo ? "Siguiendo" : "Seguir"}
        </button>
      )}

      {/* Botón principal de amistad */}
      {renderizarBotonPrincipal()}

      {/* Menú de opciones */}
      {estadoRelacion !== "bloqueado" && (
        <div className="relative">
          <button
            onClick={() => setMostrarMenu(!mostrarMenu)}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {mostrarMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMostrarMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => {
                    alReportar();
                    setMostrarMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors flex items-center gap-3"
                >
                  <Flag className="w-4 h-4 text-yellow-500" />
                  <span>Reportar Usuario</span>
                </button>
                <button
                  onClick={() => {
                    alBloquear();
                    setMostrarMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors flex items-center gap-3 text-red-400"
                >
                  <Ban className="w-4 h-4" />
                  <span>Bloquear Usuario</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
