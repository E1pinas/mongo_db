import { authService } from "../../../services/auth.service";
import { friendshipService } from "../../../services/friendship.service";
import { followerService } from "../../../services/follower.service";
import { recentService } from "../../../services/recent.service";
import { musicService } from "../../../services/music.service";
import type { Usuario, Cancion, Album, Playlist } from "../../../types";

export const servicioPerfil = {
  // Obtener perfil por nick
  obtenerPerfilPorNick: async (nick: string): Promise<Usuario> => {
    try {
      return await authService.getProfileByNick(nick);
    } catch (error: any) {
      throw error;
    }
  },

  // Agregar al historial de recientes
  agregarARecientes: async (usuarioId: string): Promise<void> => {
    try {
      recentService.addRecentItem({
        type: "profile" as any,
        id: usuarioId,
        data: {},
      });
    } catch (error) {
      console.error("Error al agregar a recientes:", error);
    }
  },

  // Verificar estado de amistad
  verificarEstadoAmistad: async (
    usuarioId: string
  ): Promise<{
    estado:
      | "ninguno"
      | "pendiente_enviada"
      | "pendiente_recibida"
      | "amigos"
      | "bloqueado";
    solicitudId?: string;
    aceptaSolicitudes: boolean;
  }> => {
    try {
      const respuesta = await friendshipService.getRelationshipStatus(
        usuarioId
      );
      return {
        estado: respuesta.estado,
        solicitudId: respuesta.solicitudId,
        aceptaSolicitudes: respuesta.aceptaSolicitudes !== false,
      };
    } catch (error) {
      console.error("Error al verificar estado de amistad:", error);
      return { estado: "ninguno", aceptaSolicitudes: true };
    }
  },

  // Verificar si sigue al usuario
  verificarSiSigue: async (usuarioId: string): Promise<boolean> => {
    try {
      return await followerService.checkIfFollowing(usuarioId);
    } catch (error) {
      console.error("Error al verificar seguimiento:", error);
      return false;
    }
  },

  // Seguir usuario
  seguirUsuario: async (usuarioId: string): Promise<void> => {
    await followerService.followUser(usuarioId);
  },

  // Dejar de seguir
  dejarDeSeguir: async (usuarioId: string): Promise<void> => {
    await followerService.unfollowUser(usuarioId);
  },

  // Enviar solicitud de amistad
  enviarSolicitudAmistad: async (usuarioId: string): Promise<void> => {
    await friendshipService.sendFriendRequest(usuarioId);
  },

  // Aceptar solicitud de amistad
  aceptarSolicitudAmistad: async (solicitudId: string): Promise<void> => {
    await friendshipService.acceptFriendRequest(solicitudId);
  },

  // Rechazar solicitud de amistad
  rechazarSolicitudAmistad: async (solicitudId: string): Promise<void> => {
    await friendshipService.rejectFriendRequest(solicitudId);
  },

  // Cancelar solicitud enviada
  cancelarSolicitudEnviada: async (solicitudId: string): Promise<void> => {
    await friendshipService.cancelFriendRequest(solicitudId);
  },

  // Eliminar amistad
  eliminarAmistad: async (amigoId: string): Promise<void> => {
    await friendshipService.removeFriend(amigoId);
  },

  // Obtener canciones del usuario
  obtenerCanciones: async (usuarioId: string): Promise<Cancion[]> => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(
      `http://localhost:3900/api/canciones/usuario/${usuarioId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!respuesta.ok) throw new Error("Error al obtener canciones");
    const datos = await respuesta.json();
    return datos.canciones || datos;
  },

  // Obtener álbumes del usuario
  obtenerAlbumes: async (usuarioId: string): Promise<Album[]> => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(
      `http://localhost:3900/api/albumes/usuario/${usuarioId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!respuesta.ok) throw new Error("Error al obtener álbumes");
    const datos = await respuesta.json();
    return datos.albumes || datos;
  },

  // Obtener playlists del usuario
  obtenerPlaylists: async (usuarioId: string): Promise<Playlist[]> => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(
      `http://localhost:3900/api/playlists/usuario/${usuarioId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!respuesta.ok) throw new Error("Error al obtener playlists");
    const datos = await respuesta.json();
    return datos.playlists || datos;
  },

  // Obtener seguidores
  obtenerSeguidores: async (usuarioId: string): Promise<Usuario[]> => {
    return await followerService.getFollowers(usuarioId);
  },

  // Obtener seguidos
  obtenerSeguidos: async (usuarioId: string): Promise<Usuario[]> => {
    return await followerService.getFollowing(usuarioId);
  },

  // Eliminar canción
  eliminarCancion: async (cancionId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(
      `http://localhost:3900/api/canciones/${cancionId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!respuesta.ok) {
      const datos = await respuesta.json();
      throw new Error(datos.message || "Error al eliminar canción");
    }
  },
};
