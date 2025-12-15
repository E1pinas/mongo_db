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
  agregarARecientes: async (usuario: Usuario): Promise<void> => {
    try {
      const usuarioExtendido = usuario as any;
      recentService.addRecentItem({
        type: "perfil" as any,
        id: usuario.nick, // Usar nick para la navegación
        titulo: usuario.nombreArtistico || usuario.nick,
        subtitulo: usuario.nombreArtistico
          ? `@${usuario.nick}`
          : `${usuario.nombre} ${usuario.apellidos}`,
        imagenUrl: usuarioExtendido.avatarUrl || "",
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
  obtenerCanciones: async (_usuarioId: string): Promise<Cancion[]> => {
    return await musicService.getMySongs();
  },

  // Obtener álbumes del usuario
  obtenerAlbumes: async (_usuarioId: string): Promise<Album[]> => {
    return await musicService.getMyAlbums();
  },

  // Obtener playlists del usuario
  obtenerPlaylists: async (_usuarioId: string): Promise<Playlist[]> => {
    return await musicService.getMyPlaylists();
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

  // Bloquear usuario
  bloquearUsuario: async (usuarioId: string, razon?: string): Promise<void> => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(
      `http://localhost:3900/api/bloqueos/${usuarioId}/bloquear`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ razon }),
      }
    );

    if (!respuesta.ok) {
      const datos = await respuesta.json();
      throw new Error(datos.message || "Error al bloquear usuario");
    }
  },
};
