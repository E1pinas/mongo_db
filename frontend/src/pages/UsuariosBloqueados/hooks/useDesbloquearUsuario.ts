import { useState } from "react";
import { bloqueoService } from "../../../services/bloqueo.service";

export const useDesbloquearUsuario = (
  blockedUsers: any[],
  setBlockedUsers: (users: any[]) => void
) => {
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [usuarioADesbloquear, setUsuarioADesbloquear] = useState<any>(null);

  const limpiarError = () => setMensajeError("");

  const manejarDesbloquear = (bloqueado: any) => {
    setUsuarioADesbloquear(bloqueado);
    setMostrarConfirm(true);
  };

  const confirmarDesbloqueo = async () => {
    if (!usuarioADesbloquear) return;

    const usuario = usuarioADesbloquear.usuario;
    try {
      setUnblockingId(usuario._id);
      await bloqueoService.desbloquearUsuario(usuario._id);
      setBlockedUsers(
        blockedUsers.filter((b) => b.usuario._id !== usuario._id)
      );
      setMostrarConfirm(false);
      setUsuarioADesbloquear(null);
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      setMensajeError(error.message || "Error al desbloquear usuario");
    } finally {
      setUnblockingId(null);
    }
  };

  const cancelarDesbloqueo = () => {
    setMostrarConfirm(false);
    setUsuarioADesbloquear(null);
  };

  return {
    unblockingId,
    manejarDesbloquear,
    confirmarDesbloqueo,
    cancelarDesbloqueo,
    mostrarConfirm,
    usuarioADesbloquear,
    mensajeError,
    limpiarError,
  };
};
