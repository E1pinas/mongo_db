import { useEffect, useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import type { Notificacion, NotificacionTipo } from "../types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import PostModal from "../components/social/PostModal";
import { usePlayer } from "../contexts/PlayerContext";
import { musicService } from "../services/music.service";
import { albumService } from "../services/album.service";
import { LoadingSpinner, EmptyState, Button } from "../components/common";

/**
 * Notifications - Página de notificaciones
 *
 * Muestra todas las notificaciones del usuario (nuevas canciones, seguidores, comentarios, etc.)
 */

export default function Notifications() {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const navigate = useNavigate();
  const { playSong, playQueue, clearQueue } = usePlayer();

  const [filter, setFilter] = useState<
    "todas" | "musica" | "social" | "sistema"
  >("todas");

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  // Filtrar notificaciones según el filtro activo
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "todas") return true;
    if (filter === "musica")
      return [
        "nueva_cancion_artista",
        "nuevo_album_artista",
        "nueva_playlist_artista",
      ].includes(notif.tipo);
    if (filter === "social")
      return [
        "nuevo_seguidor",
        "solicitud_amistad",
        "amistad_aceptada",
        "nuevo_post",
        "like_post",
        "comentario_post",
        "repost",
      ].includes(notif.tipo);
    if (filter === "sistema") return notif.tipo === "sistema";
    return true;
  });

  const handleNotificationClick = async (notif: Notificacion) => {
    // Marcar como leída
    if (!notif.leida) {
      await markAsRead(notif._id);
    }

    // Navegar según el tipo de recurso
    if (notif.recurso) {
      switch (notif.recurso.tipo) {
        case "song":
        case "cancion":
          // Cargar la canción y reproducirla inmediatamente
          try {
            console.log(
              "🎵 Intentando cargar canción con ID:",
              notif.recurso.id
            );
            const cancion = await musicService.getSongById(notif.recurso.id);
            console.log("✅ Canción cargada:", cancion);
            console.log("🔍 Es single?:", cancion.esSingle);

            // Si es single, usar contexto de single
            if (cancion.esSingle) {
              const contexto = {
                type: "album" as const,
                id: "single",
                name: `Single: ${cancion.titulo}`,
              };
              console.log("📁 Reproduciendo con contexto:", contexto);
              playQueue([cancion], 0, contexto);
            } else {
              // Si tiene álbum, reproducir solo esta canción sin contexto especial
              console.log("📁 Reproduciendo sin contexto (tiene álbum)");
              playQueue([cancion], 0);
            }
          } catch (error: any) {
            console.error("❌ Error al cargar la canción:", error);
            console.error("❌ ID de la canción:", notif.recurso.id);

            // Mostrar mensaje al usuario
            alert(
              error.response?.status === 404
                ? "Esta canción ya no está disponible o fue eliminada"
                : "No se pudo cargar la canción. Intenta más tarde."
            );
          }
          break;
        case "album":
          // Cargar el álbum y agregar todas sus canciones a la cola
          try {
            const album = await albumService.obtenerAlbum(notif.recurso.id);
            if (album.canciones && album.canciones.length > 0) {
              // Reproducir todas las canciones del álbum
              playQueue(album.canciones, 0, {
                type: "album",
                id: album._id,
                name: album.titulo,
              });
            }
          } catch (error) {
            console.error("Error al cargar el álbum:", error);
            // Si falla, navegar a la página del álbum
            navigate(`/album/${notif.recurso.id}`);
          }
          break;
        case "playlist":
          // Cargar la playlist y agregar todas sus canciones a la cola
          try {
            const playlist = await musicService.getPlaylistById(
              notif.recurso.id
            );
            if (playlist.canciones && playlist.canciones.length > 0) {
              // Reproducir todas las canciones de la playlist
              playQueue(playlist.canciones, 0, {
                type: "playlist",
                id: playlist._id,
                name: playlist.titulo,
              });
            }
          } catch (error) {
            console.error("Error al cargar la playlist:", error);
            // Si falla, navegar a la página de la playlist
            navigate(`/playlist/${notif.recurso.id}`);
          }
          break;
        case "usuario":
          navigate(`/profile/${notif.recurso.id}`);
          break;
        case "post":
          // Abrir modal del post en lugar de navegar al perfil
          setSelectedPostId(notif.recurso.id);
          setShowPostModal(true);
          break;
        case "comentario":
          // Navegar al perfil donde está el comentario
          if (typeof notif.usuarioOrigen === "object" && notif.usuarioOrigen) {
            navigate(`/profile/${notif.usuarioOrigen._id}`);
          }
          break;
      }
    } else if (notif.usuarioOrigen && typeof notif.usuarioOrigen === "object") {
      // Si no hay recurso específico, ir al perfil del usuario origen
      navigate(`/profile/${notif.usuarioOrigen._id}`);
    }
  };

  const getFormattedMessage = (notif: Notificacion) => {
    // SIEMPRE usar el mensaje de la base de datos que ya incluye toda la información
    return notif.mensaje;
  };

  const getNotificationIcon = (notif: Notificacion) => {
    // Si hay un usuario origen, mostrar su foto (o la por defecto)
    if (notif.usuarioOrigen && typeof notif.usuarioOrigen === "object") {
      return (
        <img
          src={
            notif.usuarioOrigen.avatarUrl &&
            notif.usuarioOrigen.avatarUrl.trim() !== ""
              ? notif.usuarioOrigen.avatarUrl
              : "/avatar.png"
          }
          alt={notif.usuarioOrigen.nombreArtistico || notif.usuarioOrigen.nick}
          className="w-12 h-12 rounded-full shrink-0 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/avatar.png";
          }}
        />
      );
    }

    // Sino, mostrar icono según el tipo
    const tipo = notif.tipo;
    switch (tipo) {
      case "nueva_cancion_artista":
      case "nuevo_album_artista":
        return (
          <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-full shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
        );
      case "nueva_playlist_artista":
        return (
          <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-full shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15V6"></path>
              <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
              <path d="M12 12H3"></path>
              <path d="M16 6H3"></path>
              <path d="M12 18H3"></path>
            </svg>
          </div>
        );
      case "sistema":
        return (
          <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-yellow-500 rounded-full shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>
        );
      case "nuevo_seguidor":
      case "solicitud_amistad":
      case "amistad_aceptada":
        return (
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        );
      case "comentario_en_perfil":
      case "respuesta_comentario":
      case "like_comentario":
        return (
          <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-rose-500 rounded-full shrink-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-neutral-700 rounded-full shrink-0"></div>
        );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Notificaciones</h1>
        <p className="text-neutral-400">Mantente al día con tu actividad</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setFilter("todas")}
          className={`px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform ${
            filter === "todas"
              ? "bg-white text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter("musica")}
          className={`px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform ${
            filter === "musica"
              ? "bg-white text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          Música
        </button>
        <button
          onClick={() => setFilter("social")}
          className={`px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform ${
            filter === "social"
              ? "bg-white text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          Social
        </button>
        <button
          onClick={() => setFilter("sistema")}
          className={`px-4 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-transform ${
            filter === "sistema"
              ? "bg-white text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          Sistema
        </button>
      </div>

      {/* Marcar todas como leídas */}
      {notifications.some((n) => !n.leida) && (
        <div className="flex justify-end mb-4">
          <button
            onClick={markAllAsRead}
            className="text-sm text-green-500 hover:text-green-400 font-semibold"
          >
            Marcar todas como leídas
          </button>
        </div>
      )}

      {/* Lista de notificaciones */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={() => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-600"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
          )}
          title="No hay notificaciones"
          description={
            filter === "todas"
              ? "Estarás al día con tu actividad"
              : `No hay notificaciones de ${filter}`
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`bg-neutral-800/50 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ${
                !notif.leida ? "border-l-4 border-orange-500" : ""
              } relative group`}
            >
              <div className="flex items-start gap-4">
                {getNotificationIcon(notif)}
                <div className="flex-1">
                  <p
                    className={`${
                      !notif.leida ? "font-semibold" : "font-medium"
                    } mb-1`}
                  >
                    {getFormattedMessage(notif)}
                  </p>
                  <span className="text-xs text-neutral-500">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-neutral-700 rounded-full"
                  title="Eliminar notificación"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Post */}
      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          isOpen={showPostModal}
          onClose={() => {
            setShowPostModal(false);
            setSelectedPostId(null);
          }}
        />
      )}
    </div>
  );
}
