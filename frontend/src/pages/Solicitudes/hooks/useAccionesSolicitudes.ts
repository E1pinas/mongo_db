import { useState } from "react";
import type { SolicitudAmistad } from "../../../services/friendship.service";
import type { Usuario } from "../../../types";
import type { DatosEliminacionAmigo } from "../tipos";
import { servicioSolicitudes } from "../servicios/solicitudesApi";

interface UseAccionesSolicitudesParams {
  solicitudesRecibidas: SolicitudAmistad[];
  setSolicitudesRecibidas: React.Dispatch<
    React.SetStateAction<SolicitudAmistad[]>
  >;
  amigos: Usuario[];
  setAmigos: React.Dispatch<React.SetStateAction<Usuario[]>>;
  bloqueados: any[];
  setBloqueados: React.Dispatch<React.SetStateAction<any[]>>;
}

interface UseAccionesSolicitudesResult {
  actionLoading: string | null;
  amigoParaEliminar: DatosEliminacionAmigo | null;
  bloqueadoSeleccionado: any;
  mostrarModalEliminar: boolean;
  mostrarModalDesbloquear: boolean;
  mensajeError: string;
  mostrarConfirmBloqueo: boolean;
  usuarioABloquear: { id: string; nick: string } | null;
  manejarAceptar: (solicitudId: string) => Promise<void>;
  manejarRechazar: (solicitudId: string) => Promise<void>;
  manejarBloquear: (solicitudId: string) => Promise<void>;
  confirmarBloqueo: () => Promise<void>;
  cancelarBloqueo: () => void;
  abrirModalEliminar: (amigoId: string, nick: string) => void;
  confirmarEliminarAmigo: () => Promise<void>;
  cerrarModalEliminar: () => void;
  abrirModalDesbloquear: (bloqueado: any) => void;
  confirmarDesbloquear: () => Promise<void>;
  cerrarModalDesbloquear: () => void;
  limpiarError: () => void;
}

export const useAccionesSolicitudes = ({
  solicitudesRecibidas,
  setSolicitudesRecibidas,
  amigos,
  setAmigos,
  bloqueados,
  setBloqueados,
}: UseAccionesSolicitudesParams): UseAccionesSolicitudesResult => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [amigoParaEliminar, setAmigoParaEliminar] =
    useState<DatosEliminacionAmigo | null>(null);
  const [bloqueadoSeleccionado, setBloqueadoSeleccionado] = useState<any>(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalDesbloquear, setMostrarModalDesbloquear] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarConfirmBloqueo, setMostrarConfirmBloqueo] = useState(false);
  const [usuarioABloquear, setUsuarioABloquear] = useState<{
    id: string;
    nick: string;
  } | null>(null);

  const limpiarError = () => setMensajeError("");

  const manejarAceptar = async (solicitudId: string) => {
    try {
      setActionLoading(solicitudId);
      await servicioSolicitudes.aceptarSolicitud(solicitudId);
      setSolicitudesRecibidas(
        solicitudesRecibidas.filter((s) => s._id !== solicitudId)
      );
    } catch (error: any) {
      console.error("Error accepting request:", error);
      setMensajeError(error.message || "Error al aceptar solicitud");
    } finally {
      setActionLoading(null);
    }
  };

  const manejarRechazar = async (solicitudId: string) => {
    try {
      setActionLoading(solicitudId);
      await servicioSolicitudes.rechazarSolicitud(solicitudId);
      setSolicitudesRecibidas(
        solicitudesRecibidas.filter((s) => s._id !== solicitudId)
      );
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      setMensajeError(error.message || "Error al rechazar solicitud");
    } finally {
      setActionLoading(null);
    }
  };

  const manejarBloquear = async (solicitudId: string) => {
    const solicitud = solicitudesRecibidas.find((s) => s._id === solicitudId);
    if (!solicitud) return;

    const solicitante = solicitud.solicitante as Usuario;

    setUsuarioABloquear({ id: solicitudId, nick: solicitante.nick });
    setMostrarConfirmBloqueo(true);
  };

  const confirmarBloqueo = async () => {
    if (!usuarioABloquear) return;

    try {
      setActionLoading(usuarioABloquear.id);
      await servicioSolicitudes.bloquearDesdeSolicitud(usuarioABloquear.id);
      setSolicitudesRecibidas(
        solicitudesRecibidas.filter((s) => s._id !== usuarioABloquear.id)
      );
      setMostrarConfirmBloqueo(false);
      setUsuarioABloquear(null);
    } catch (error: any) {
      console.error("Error blocking user:", error);
      setMensajeError(error.message || "Error al bloquear usuario");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelarBloqueo = () => {
    setMostrarConfirmBloqueo(false);
    setUsuarioABloquear(null);
  };

  const abrirModalEliminar = (amigoId: string, nick: string) => {
    setAmigoParaEliminar({ id: amigoId, nick });
    setMostrarModalEliminar(true);
  };

  const confirmarEliminarAmigo = async () => {
    if (!amigoParaEliminar) return;

    try {
      setActionLoading(amigoParaEliminar.id);
      console.log(
        "🗑️ Frontend: Eliminando amigo con ID:",
        amigoParaEliminar.id
      );
      await servicioSolicitudes.eliminarAmigo(amigoParaEliminar.id);
      setAmigos(amigos.filter((a) => a._id !== amigoParaEliminar.id));
      setMostrarModalEliminar(false);
      setAmigoParaEliminar(null);
    } catch (error: any) {
      console.error("Error removing friend:", error);
      setMensajeError(error.message || "Error al eliminar amistad");
    } finally {
      setActionLoading(null);
    }
  };

  const cerrarModalEliminar = () => {
    setMostrarModalEliminar(false);
    setAmigoParaEliminar(null);
  };

  const abrirModalDesbloquear = (bloqueado: any) => {
    setBloqueadoSeleccionado(bloqueado);
    setMostrarModalDesbloquear(true);
  };

  const confirmarDesbloquear = async () => {
    if (!bloqueadoSeleccionado) return;
    const usuario = bloqueadoSeleccionado.usuario;

    try {
      setActionLoading(usuario._id);
      await servicioSolicitudes.desbloquearUsuario(usuario._id);
      setBloqueados(bloqueados.filter((b) => b.usuario._id !== usuario._id));
      setMostrarModalDesbloquear(false);
      setBloqueadoSeleccionado(null);
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      setMensajeError(error.message || "Error al desbloquear usuario");
    } finally {
      setActionLoading(null);
    }
  };

  const cerrarModalDesbloquear = () => {
    setMostrarModalDesbloquear(false);
    setBloqueadoSeleccionado(null);
  };

  return {
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
  };
};
