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
    manejarAceptar,
    manejarRechazar,
    manejarBloquear,
    abrirModalEliminar,
    confirmarEliminarAmigo,
    cerrarModalEliminar,
    abrirModalDesbloquear,
    confirmarDesbloquear,
    cerrarModalDesbloquear,
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
      </div>
    </div>
  );
}
