import { useState } from "react";
import { bloqueoService } from "../../../services/bloqueo.service";

export const useDesbloquearUsuario = (
  blockedUsers: any[],
  setBlockedUsers: (users: any[]) => void
) => {
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const manejarDesbloquear = async (bloqueado: any) => {
    const usuario = bloqueado.usuario;
    if (
      !confirm(
        `¿Desbloquear a @${usuario.nick}? Podrá volver a ver tu perfil y enviarte solicitudes.`
      )
    ) {
      return;
    }

    try {
      setUnblockingId(usuario._id);
      await bloqueoService.desbloquearUsuario(usuario._id);
      setBlockedUsers(
        blockedUsers.filter((b) => b.usuario._id !== usuario._id)
      );
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      alert(error.message || "Error al desbloquear usuario");
    } finally {
      setUnblockingId(null);
    }
  };

  return { unblockingId, manejarDesbloquear };
};
