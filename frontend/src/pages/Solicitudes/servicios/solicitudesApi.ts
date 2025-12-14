import {
  friendshipService,
  type SolicitudAmistad,
} from "../../../services/friendship.service";
import { bloqueoService } from "../../../services/bloqueo.service";
import type { Usuario } from "../../../types";

export const servicioSolicitudes = {
  /**
   * Obtener solicitudes de amistad pendientes
   */
  obtenerSolicitudesPendientes: async (): Promise<SolicitudAmistad[]> => {
    return await friendshipService.getPendingRequests();
  },

  /**
   * Obtener lista de amigos
   */
  obtenerAmigos: async (): Promise<Usuario[]> => {
    return await friendshipService.getFriends();
  },

  /**
   * Obtener lista de usuarios bloqueados
   */
  obtenerBloqueados: async (): Promise<any[]> => {
    const data = await bloqueoService.obtenerBloqueados();
    return data.bloqueados || [];
  },

  /**
   * Aceptar solicitud de amistad
   */
  aceptarSolicitud: async (solicitudId: string): Promise<void> => {
    await friendshipService.acceptFriendRequest(solicitudId);
  },

  /**
   * Rechazar solicitud de amistad
   */
  rechazarSolicitud: async (solicitudId: string): Promise<void> => {
    await friendshipService.rejectFriendRequest(solicitudId);
  },

  /**
   * Bloquear usuario desde solicitud
   */
  bloquearDesdeSolicitud: async (solicitudId: string): Promise<void> => {
    await friendshipService.blockFromRequest(solicitudId);
  },

  /**
   * Eliminar un amigo
   */
  eliminarAmigo: async (amigoId: string): Promise<void> => {
    await friendshipService.removeFriend(amigoId);
  },

  /**
   * Desbloquear un usuario
   */
  desbloquearUsuario: async (usuarioId: string): Promise<void> => {
    await bloqueoService.desbloquearUsuario(usuarioId);
  },
};
