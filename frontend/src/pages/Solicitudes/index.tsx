import { useState } from "react";
import type { TipoPestana } from "./tipos";
import { useDatosSolicitudes } from "./hooks/useDatosSolicitudes";
import { useAccionesSolicitudes } from "./hooks/useAccionesSolicitudes";
import { PestanasSolicitudes } from "./componentes/PestanasSolicitudes";
import { ListaSolicitudesRecibidas } from "./componentes/ListaSolicitudesRecibidas";
import { ListaAmigos } from "./componentes/ListaAmigos";
import { ListaBloqueados } from "./componentes/ListaBloqueados";
import { ModalEliminarAmigo } from "./componentes/ModalEliminarAmigo";
import { ModalDesbloquearUsuario } from "./componentes/ModalDesbloquearUsuario";
import Toast from "../../components/Toast";

export function Solicitudes() {
  const [pestanaActiva, setPestanaActiva] = useState<TipoPestana>("recibidas");

  const {
    solicitudesRecibidas,
    amigos,
    bloqueados,
    cargando,
    setSolicitudesRecibidas,
    setAmigos,
    setBloqueados,
  } = useDatosSolicitudes({ pestanaActiva });

  const {
    actionLoading,
    amigoParaEliminar,
    bloqueadoSeleccionado,
    mostrarModalEliminar,
    mostrarModalDesbloquear,
    mensajeError,
    mostrarConfirmBloqueo,
    usuarioABloquear,
    manejarAceptar,
    manejarRechazar,
    manejarBloquear,
    confirmarBloqueo,
    cancelarBloqueo,
    abrirModalEliminar,
    confirmarEliminarAmigo,
    cerrarModalEliminar,
    abrirModalDesbloquear,
    confirmarDesbloquear,
    cerrarModalDesbloquear,
    limpiarError,
  } = useAccionesSolicitudes({
    solicitudesRecibidas,
    setSolicitudesRecibidas,
    amigos,
    setAmigos,
    bloqueados,
    setBloqueados,
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative">
            <h1 className="mb-3 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-5xl font-black text-transparent">
              Conexiones
            </h1>
            <p className="text-lg text-neutral-400">
              Gestiona tus amigos y solicitudes
            </p>
          </div>
        </div>

        {/* Tabs */}
        <PestanasSolicitudes
          pestanaActiva={pestanaActiva}
          onCambiarPestana={setPestanaActiva}
          contadorSolicitudes={solicitudesRecibidas.length}
          contadorAmigos={amigos.length}
          contadorBloqueados={bloqueados.length}
        />

        {/* Loading */}
        {cargando ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Tab: Solicitudes Recibidas */}
            {pestanaActiva === "recibidas" && (
              <ListaSolicitudesRecibidas
                solicitudes={solicitudesRecibidas}
                actionLoading={actionLoading}
                onAceptar={manejarAceptar}
                onRechazar={manejarRechazar}
                onBloquear={manejarBloquear}
              />
            )}

            {/* Tab: Amigos */}
            {pestanaActiva === "amigos" && (
              <ListaAmigos
                amigos={amigos}
                actionLoading={actionLoading}
                onEliminar={abrirModalEliminar}
              />
            )}

            {/* Tab: Bloqueados */}
            {pestanaActiva === "bloqueados" && (
              <ListaBloqueados
                bloqueados={bloqueados}
                actionLoading={actionLoading}
                onDesbloquear={abrirModalDesbloquear}
              />
            )}
          </>
        )}

        {/* Modal eliminar amigo */}
        <ModalEliminarAmigo
          mostrar={mostrarModalEliminar}
          amigoParaEliminar={amigoParaEliminar}
          actionLoading={actionLoading}
          onConfirmar={confirmarEliminarAmigo}
          onCancelar={cerrarModalEliminar}
        />

        {/* Modal desbloquear */}
        <ModalDesbloquearUsuario
          mostrar={mostrarModalDesbloquear}
          bloqueadoSeleccionado={bloqueadoSeleccionado}
          actionLoading={actionLoading}
          onConfirmar={confirmarDesbloquear}
          onCancelar={cerrarModalDesbloquear}
        />

        {/* Modal confirmar bloqueo */}
        {mostrarConfirmBloqueo && usuarioABloquear && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-xl p-6 max-w-md w-full border border-neutral-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-3">
                ¿Bloquear usuario?
              </h3>
              <p className="text-neutral-300 mb-2">
                ¿Estás seguro de que quieres bloquear a{" "}
                <span className="text-orange-400 font-semibold">
                  @{usuarioABloquear.nick}
                </span>
                ?
              </p>
              <p className="text-sm text-neutral-400 mb-6">
                Esta persona no podrá ver tu perfil ni enviarte solicitudes de
                amistad.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelarBloqueo}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
                  disabled={actionLoading !== null}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarBloqueo}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={actionLoading !== null}
                >
                  {actionLoading === usuarioABloquear.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Bloqueando...
                    </span>
                  ) : (
                    "Bloquear"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast de error */}
        {mensajeError && (
          <Toast message={mensajeError} type="error" onClose={limpiarError} />
        )}
      </div>
    </div>
  );
}
