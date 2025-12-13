import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, usePlayer } from "../contexts";
import { authService } from "../services/auth.service";
import { friendshipService } from "../services/friendship.service";
import { followerService } from "../services/follower.service";
import { recentService } from "../services/recent.service";
import { musicService } from "../services/music.service";
import BlockButton from "../components/BlockButton";
import EditSongModal from "../components/musica/EditSongModal";
import {
  Music,
  Users,
  Calendar,
  Settings,
  Play,
  Heart,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  UserX,
  Ban,
  X,
  MessageCircle,
  FileText,
  Flag,
} from "lucide-react";
import type { Usuario, Cancion, Album, Playlist } from "../types";
import SongCommentsModal from "../components/musica/SongCommentsModal";
import SongRow from "../components/musica/SongRow";
import PostFeed from "../components/social/PostFeed";
import { formatTimeAgo } from "../utils/dateFormat";
import { formatDuration, formatNumber } from "../utils/formatHelpers";
import { ReportModal } from "../components/common/ReportModal";

/**
 * Profile - Página de perfil de usuario
 *
 * Diseño inspirado en SoundCloud y Steam con banner, avatar, tabs y estadísticas
 */

export default function Profile() {
  const { nick } = useParams<{ nick: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Verificar si el usuario está suspendido
  useEffect(() => {
    if (currentUser && (currentUser as any).suspendido) {
      // Si intenta ver otro perfil, bloquearlo
      if (nick && nick !== currentUser.nick) {
        setShowSuspendedModal(true);
        return;
      }
    }
  }, [currentUser, nick]);

  // Si es admin/super_admin viendo su propio perfil, redirigir al panel
  useEffect(() => {
    if (
      currentUser &&
      (currentUser.role === "admin" || currentUser.role === "super_admin") &&
      (!nick || nick === currentUser.nick)
    ) {
      navigate("/admin", { replace: true });
      return;
    }
  }, [currentUser, nick, navigate]);

  const [profileUser, setProfileUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "posts" | "canciones" | "albumes" | "playlists" | "seguidores" | "siguiendo"
  >("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [albumes, setAlbumes] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [seguidores, setSeguidores] = useState<Usuario[]>([]);
  const [seguidos, setSeguidos] = useState<Usuario[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Estados de amistad
  const [relationshipStatus, setRelationshipStatus] = useState<
    | "ninguno"
    | "pendiente_enviada"
    | "pendiente_recibida"
    | "amigos"
    | "bloqueado"
  >("ninguno");
  const [solicitudId, setSolicitudId] = useState<string | undefined>();
  const [aceptaSolicitudes, setAceptaSolicitudes] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [profileError, setProfileError] = useState<{
    type: "not_found" | "private" | "unavailable";
    message: string;
  } | null>(null);
  const [showRemoveFriendModal, setShowRemoveFriendModal] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [comentariosCancion, setComentariosCancion] = useState<Cancion | null>(
    null
  );
  const [showDeleteSongModal, setShowDeleteSongModal] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Cancion | null>(null);
  const [showEditSongModal, setShowEditSongModal] = useState(false);
  const [songToEdit, setSongToEdit] = useState<Cancion | null>(null);

  const { playQueue, currentSong, isPlaying, togglePlay } = usePlayer();

  useEffect(() => {
    loadProfile();
  }, [nick, currentUser]);

  useEffect(() => {
    if (
      profileUser &&
      (activeTab === "seguidores" || activeTab === "siguiendo")
    ) {
      loadFollowData();
    }
  }, [activeTab, profileUser]);

  const loadFollowData = async () => {
    if (!profileUser) return;

    try {
      setLoadingContent(true);
      if (activeTab === "seguidores") {
        const data = await followerService.getFollowers(profileUser._id);
        setSeguidores(data);
      } else if (activeTab === "siguiendo") {
        const data = await followerService.getFollowing(profileUser._id);
        setSeguidos(data);
      }
    } catch (error) {
      console.error("Error loading follow data:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      let userData: Usuario | null = null;

      // Si no hay nick en la URL, mostrar el perfil actual
      if (!nick) {
        userData = currentUser;
      }
      // Si el nick coincide con el usuario actual, usar los datos del contexto
      else if (nick.toLowerCase() === currentUser?.nick.toLowerCase()) {
        userData = currentUser;
      }
      // Si es diferente, cargar desde el backend
      else {
        try {
          userData = await authService.getProfileByNick(nick);
        } catch (error: any) {
          console.error("Error loading profile by nick:", error);
          // Bloqueo - mostrar "Usuario no encontrado" para privacidad
          if (
            error.response?.status === 403 ||
            error.response?.data?.bloqueado ||
            error.message.includes("403") ||
            error.message.includes("bloqueado")
          ) {
            // No mostrar alert, solo establecer como usuario no encontrado
            setProfileUser(null);
            setLoading(false);
            return;
          }
          // Perfil privado
          if (error.message.includes("privado")) {
            setProfileError({
              type: "private",
              message: "Este perfil es privado. Solo los amigos pueden verlo.",
            });
            setProfileUser(null);
            setLoading(false);
            return;
          }
          // Si no se encuentra el usuario, dejar userData como null
          setProfileUser(null);
          setLoading(false);
          return;
        }
      }

      console.log("👤 Profile user data:", userData);
      console.log("🆔 Profile user ID:", userData?._id);
      setProfileUser(userData);

      // Agregar al historial de recientes (solo si no es tu propio perfil)
      if (userData && userData._id !== currentUser?._id) {
        recentService.addRecentItem({
          id: userData.nick, // Usamos el nick para la navegación
          type: "perfil",
          titulo: userData.nombreArtistico || userData.nombre,
          subtitulo: `@${userData.nick}`,
          imagenUrl: userData.avatarUrl,
        });
      }

      // Cargar contenido del usuario (canciones, álbumes, playlists)
      if (userData) {
        await loadUserContent(userData);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      // Si el usuario no existe, mostrar null para que aparezca "Usuario no encontrado"
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };
  const loadUserContent = async (user: Usuario) => {
    try {
      setLoadingContent(true);

      // Solo cargar desde el backend si no es el perfil propio
      const isOwn = currentUser && user._id === currentUser._id;

      let userData = user;

      // Siempre obtener datos actualizados del backend para asegurar que tenemos toda la info
      // especialmente las canciones con sus datos completos (duracionSegundos, etc.)
      try {
        userData = await authService.getProfileByNick(user.nick);
      } catch (error: any) {
        // Si el perfil ahora es privado, bloqueado, o fue eliminado
        if (
          error.response?.status === 403 ||
          error.response?.data?.bloqueado ||
          error.response?.data?.perfilPrivado ||
          error.message.includes("403") ||
          error.message.includes("bloqueado") ||
          error.message.includes("privado")
        ) {
          console.log("🔒 Perfil cambió a privado/bloqueado - redirigiendo");
          setProfileError({
            type: "unavailable",
            message: "Este perfil ya no está disponible o es privado.",
          });
          setProfileUser(null);
          setLoadingContent(false);
          return;
        }
        throw error; // Re-lanzar otros errores
      }

      // Extraer las canciones, álbumes y playlists del usuario
      setCanciones(userData.misCanciones || []);
      setAlbumes(userData.misAlbumes || []);
      setPlaylists(userData.playlistsCreadas || []);

      // Cargar el estado de la relación de amistad si no es el perfil propio
      if (!isOwn && currentUser) {
        console.log("🔗 Cargando relación de amistad para usuario:", user._id);
        const status = await friendshipService.getRelationshipStatus(user._id);
        setRelationshipStatus(status.estado);
        setSolicitudId(status.solicitudId);
        setAceptaSolicitudes(status.aceptaSolicitudes ?? true);

        // Verificar si estamos siguiendo al usuario
        const following = await followerService.checkIfFollowing(user._id);
        setIsFollowing(following);
      } else {
        console.log("✅ Es perfil propio - no se carga relación de amistad");
      }
    } catch (error) {
      console.error("Error loading user content:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFollow = async () => {
    if (!profileUser) return;

    // Si ya lo sigue, mostrar modal de confirmación
    if (isFollowing) {
      setShowUnfollowModal(true);
      return;
    }

    // Si no lo sigue, seguir directamente
    try {
      setLoadingAction(true);
      await followerService.followUser(profileUser._id);
      setIsFollowing(true);

      // Actualizar contador de seguidores inmediatamente
      setProfileUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          estadisticas: {
            ...prev.estadisticas,
            totalSeguidores: (prev.estadisticas?.totalSeguidores || 0) + 1,
          },
        };
      });
    } catch (error: any) {
      console.error("Error following user:", error);
      alert(error.message || "Error al seguir usuario");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConfirmUnfollow = async () => {
    if (!profileUser) return;

    try {
      setLoadingAction(true);
      await followerService.unfollowUser(profileUser._id);
      setIsFollowing(false);
      setShowUnfollowModal(false);

      // Actualizar contador de seguidores inmediatamente
      setProfileUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          estadisticas: {
            ...prev.estadisticas,
            totalSeguidores: Math.max(
              (prev.estadisticas?.totalSeguidores || 0) - 1,
              0
            ),
          },
        };
      });
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      alert(error.message || "Error al dejar de seguir");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!profileUser) return;

    console.log("🚀 Enviando solicitud a usuario:", profileUser);
    console.log("🆔 ID del usuario destino:", profileUser._id);

    // Verificar si el usuario acepta solicitudes antes de enviar
    if (!aceptaSolicitudes) {
      alert("Este usuario no acepta solicitudes de amistad");
      return;
    }

    try {
      setLoadingAction(true);
      await friendshipService.sendFriendRequest(profileUser._id);
      setRelationshipStatus("pendiente_enviada");
    } catch (error: any) {
      console.error("Error sending friend request:", error);

      // Verificar si es error de que no acepta solicitudes
      if (error.message?.includes("no acepta solicitudes")) {
        setAceptaSolicitudes(false);
        alert("Este usuario no acepta solicitudes de amistad");
      } else {
        alert(error.message || "Error al enviar solicitud de amistad");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!solicitudId) return;

    try {
      setLoadingAction(true);
      await friendshipService.acceptFriendRequest(solicitudId);
      setRelationshipStatus("amigos");
      setSolicitudId(undefined);
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      alert(error.message || "Error al aceptar solicitud");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!solicitudId) return;

    try {
      setLoadingAction(true);
      await friendshipService.rejectFriendRequest(solicitudId);
      setRelationshipStatus("ninguno");
      setSolicitudId(undefined);
    } catch (error: any) {
      console.error("Error rejecting friend request:", error);
      alert(error.message || "Error al rechazar solicitud");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!profileUser) return;

    try {
      setLoadingAction(true);
      await friendshipService.cancelFriendRequest(profileUser._id);
      setRelationshipStatus("ninguno");
      setSolicitudId(undefined);
    } catch (error: any) {
      console.error("Error canceling friend request:", error);
      alert(error.message || "Error al cancelar solicitud");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!profileUser) return;

    try {
      setLoadingAction(true);
      await friendshipService.unblockUser(profileUser._id);

      // Recargar el estado de la relación después de desbloquear
      const status = await friendshipService.getRelationshipStatus(
        profileUser._id
      );
      setRelationshipStatus(status.estado);
      setSolicitudId(status.solicitudId);

      alert("Usuario desbloqueado correctamente");
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      alert(error.message || "Error al desbloquear usuario");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profileUser) return;

    try {
      setLoadingAction(true);
      console.log(
        "🗑️ Frontend Profile: Eliminando amigo con ID:",
        profileUser._id
      );
      await friendshipService.removeFriend(profileUser._id);
      setRelationshipStatus("ninguno");
      setShowRemoveFriendModal(false);
    } catch (error: any) {
      console.error("Error removing friend:", error);
      alert(error.message || "Error al eliminar amistad");
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePlaySong = (song: Cancion) => {
    if (currentSong?._id === song._id && isPlaying) {
      togglePlay();
    } else {
      // Filtrar canciones explícitas si el usuario es menor de edad
      let cancionesDisponibles = canciones;

      if (currentUser?.esMenorDeEdad) {
        cancionesDisponibles = canciones.filter((c) => !c.esExplicita);
        console.log(
          `🔞 Usuario menor de edad - Filtrando canciones explícitas`
        );
        console.log(
          `📊 Canciones originales: ${canciones.length}, Canciones disponibles: ${cancionesDisponibles.length}`
        );

        // Verificar si la canción seleccionada es explícita
        if (song.esExplicita) {
          alert(
            "No puedes reproducir contenido explícito siendo menor de edad."
          );
          return;
        }
      }

      // Encontrar el índice de la canción seleccionada en el array filtrado
      const songIndex = cancionesDisponibles.findIndex(
        (c) => c._id === song._id
      );
      if (songIndex !== -1) {
        playQueue(cancionesDisponibles, songIndex);
      }
    }
  };

  const handleDeleteSong = async () => {
    if (!songToDelete) return;

    try {
      setLoadingAction(true);
      const response = await fetch(
        `http://localhost:3900/api/canciones/${songToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar canción");
      }

      // Actualizar la lista de canciones eliminando la canción
      setCanciones(canciones.filter((c) => c._id !== songToDelete._id));
      setShowDeleteSongModal(false);
      setSongToDelete(null);

      // Recargar perfil para actualizar contadores
      if (profileUser) {
        await loadUserContent(profileUser);
      }
    } catch (error) {
      console.error("Error al eliminar canción:", error);
      alert("Error al eliminar la canción");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditSong = (cancion: Cancion) => {
    setSongToEdit(cancion);
    setShowEditSongModal(true);
  };

  const handleSaveEditedSong = async (data: {
    titulo: string;
    generos: string[];
    esPrivada: boolean;
    esExplicita: boolean;
  }) => {
    if (!songToEdit) return;

    await musicService.updateSong(songToEdit._id, data);
    setShowEditSongModal(false);
    setSongToEdit(null);
    loadProfile();
  };

  const isOwnProfile = profileUser?._id === currentUser?._id;

  // Debug: verificar IDs
  console.log("🔍 Profile comparison:");
  console.log("  - profileUser._id:", profileUser?._id);
  console.log("  - currentUser._id:", currentUser?._id);
  console.log("  - isOwnProfile:", isOwnProfile);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    const errorConfig = profileError
      ? {
          private: {
            icon: "🔒",
            title: "Perfil Privado",
            message: profileError.message,
            color: "text-yellow-400",
          },
          unavailable: {
            icon: "🚫",
            title: "Perfil No Disponible",
            message: profileError.message,
            color: "text-orange-400",
          },
          not_found: {
            icon: "❌",
            title: "Usuario No Encontrado",
            message: "Este usuario no existe o ha sido eliminado.",
            color: "text-red-400",
          },
        }[profileError.type]
      : {
          icon: "❌",
          title: "Usuario No Encontrado",
          message: "Este usuario no existe o ha sido eliminado.",
          color: "text-red-400",
        };

    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="max-w-md w-full mx-4">
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 text-center">
            <div className="text-6xl mb-4">{errorConfig.icon}</div>
            <h2 className={`text-2xl font-bold mb-3 ${errorConfig.color}`}>
              {errorConfig.title}
            </h2>
            <p className="text-neutral-400 mb-6">{errorConfig.message}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl font-semibold transition-all"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Banner */}
      <div className="relative h-80 bg-linear-to-b from-orange-600 via-orange-700 to-neutral-900 overflow-hidden">
        {profileUser.bannerUrl && (
          <img
            src={profileUser.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

        {/* Avatar y info básica */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-6">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-neutral-950 bg-neutral-800 overflow-hidden shrink-0 shadow-2xl">
              <img
                src={profileUser.avatarUrl || "/avatar.png"}
                alt={profileUser.nick}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-bold text-white">
                  {profileUser.role === "admin" ||
                  profileUser.role === "super_admin"
                    ? profileUser.nick
                    : profileUser.nombreArtistico ||
                      `${profileUser.nombre} ${profileUser.apellidos}`}
                </h1>
                {profileUser.verificado && (
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Username (solo para usuarios no admin con nombre artístico) */}
              {profileUser.role !== "admin" &&
                profileUser.role !== "super_admin" &&
                profileUser.nombreArtistico && (
                  <p className="text-neutral-400 text-sm mb-2">
                    @{profileUser.nick}
                  </p>
                )}

              {/* Biografía */}
              {profileUser.bio && (
                <p className="text-neutral-300 text-sm mb-3 max-w-2xl">
                  {profileUser.bio}
                </p>
              )}

              {/* Redes Sociales */}
              {profileUser.redes &&
                (profileUser.redes.instagram ||
                  profileUser.redes.tiktok ||
                  profileUser.redes.youtube ||
                  profileUser.redes.x) && (
                  <div className="flex items-center gap-3 mb-3">
                    {profileUser.redes.instagram && (
                      <a
                        href={`https://instagram.com/${profileUser.redes.instagram.replace(
                          "@",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-xs font-medium transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        Instagram
                      </a>
                    )}
                    {profileUser.redes.tiktok && (
                      <a
                        href={`https://tiktok.com/@${profileUser.redes.tiktok.replace(
                          "@",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-900 border border-neutral-700 rounded-full text-xs font-medium transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                        TikTok
                      </a>
                    )}
                    {profileUser.redes.youtube && (
                      <a
                        href={`https://youtube.com/@${profileUser.redes.youtube.replace(
                          "@",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-xs font-medium transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        YouTube
                      </a>
                    )}
                    {profileUser.redes.x && (
                      <a
                        href={`https://x.com/${profileUser.redes.x.replace(
                          "@",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-900 border border-neutral-700 rounded-full text-xs font-medium transition-all"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Twitter
                      </a>
                    )}
                  </div>
                )}

              {profileUser.role === "artista" && (
                <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full mb-2">
                  🎤 ARTISTA PROFESIONAL
                </span>
              )}

              <div className="flex items-center gap-4 text-sm text-neutral-300">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    Se unió en{" "}
                    {new Date(
                      profileUser.createdAt || Date.now()
                    ).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3 pb-2">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate("/configuracion")}
                  className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  Editar perfil
                </button>
              ) : (
                <>
                  {/* Botones de amistad - solo si acepta solicitudes o ya hay relación */}
                  {aceptaSolicitudes && relationshipStatus === "ninguno" && (
                    <button
                      onClick={handleSendFriendRequest}
                      disabled={loadingAction}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      {loadingAction ? "Enviando..." : "Agregar amigo"}
                    </button>
                  )}

                  {aceptaSolicitudes &&
                    relationshipStatus === "pendiente_enviada" && (
                      <button
                        onClick={handleCancelFriendRequest}
                        disabled={loadingAction}
                        className="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <UserCheck size={16} />
                        {loadingAction ? "Cancelando..." : "Solicitud enviada"}
                      </button>
                    )}

                  {relationshipStatus === "pendiente_recibida" && (
                    <>
                      <button
                        onClick={handleAcceptFriendRequest}
                        disabled={loadingAction}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <UserCheck size={16} />
                        {loadingAction ? "Aceptando..." : "Aceptar solicitud"}
                      </button>
                      <button
                        onClick={handleRejectFriendRequest}
                        disabled={loadingAction}
                        className="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <UserX size={16} />
                        Rechazar
                      </button>
                    </>
                  )}

                  {relationshipStatus === "amigos" && (
                    <button
                      onClick={() => setShowRemoveFriendModal(true)}
                      disabled={loadingAction}
                      className="px-6 py-2.5 bg-neutral-700 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <UserCheck size={16} />
                      Amigos
                    </button>
                  )}

                  {/* Botón de seguir (separado de amistad) */}
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isFollowing
                        ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-600"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>

                  {/* Botón de Reportar */}
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-neutral-700 text-orange-400"
                    title="Reportar usuario"
                  >
                    <Flag size={16} />
                    Reportar
                  </button>

                  {/* Botón de Bloquear */}
                  {profileUser._id && (
                    <BlockButton
                      usuarioId={profileUser._id}
                      onBlockChange={(bloqueado) => {
                        if (bloqueado) {
                          // Si bloqueó al usuario, redirigir al home
                          navigate("/");
                        }
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-8 max-w-4xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {formatNumber(profileUser.estadisticas?.totalSeguidores || 0)}
              </div>
              <div className="text-sm text-neutral-400">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {profileUser.estadisticas?.totalSeguidos || 0}
              </div>
              <div className="text-sm text-neutral-400">Siguiendo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {canciones.length}
              </div>
              <div className="text-sm text-neutral-400">Pistas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-1">
                {albumes.length}
              </div>
              <div className="text-sm text-neutral-400">Álbumes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-neutral-800 bg-neutral-900/30 sticky top-0 z-10 overflow-x-hidden">
        <div className="px-4 sm:px-8">
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "posts"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("canciones")}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "canciones"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Canciones
            </button>
            <button
              onClick={() => setActiveTab("albumes")}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "albumes"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Álbumes
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "playlists"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab("seguidores")}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "seguidores"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Seguidores
            </button>
            <button
              onClick={() => setActiveTab("siguiendo")}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "siguiendo"
                  ? "border-orange-500 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              Siguiendo
            </button>
          </div>
        </div>
      </div>

      {/* Contenido según tab activa */}
      <div className="px-8 py-8">
        {activeTab === "posts" && (
          <div>
            {profileUser && (
              <PostFeed key={profileUser._id} userId={profileUser._id} />
            )}
          </div>
        )}

        {activeTab === "canciones" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Todas las pistas</h2>

            {/* Mensaje informativo para menores de edad */}
            {currentUser?.esMenorDeEdad &&
              canciones.some((c) => c.esExplicita) && (
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <span className="text-yellow-400 font-bold">🔞</span>
                    </div>
                    <div>
                      <p className="text-yellow-400 font-semibold text-sm">
                        Algunas canciones están ocultas porque contienen
                        contenido explícito
                      </p>
                      <p className="text-yellow-500/70 text-xs mt-0.5">
                        Solo puedes ver y reproducir contenido apto para menores
                        de edad
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {loadingContent ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : canciones.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Music size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay canciones para mostrar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {canciones
                  .filter((cancion) => {
                    // Ocultar canciones explícitas si el usuario actual es menor de edad
                    if (currentUser?.esMenorDeEdad && cancion.esExplicita) {
                      return false;
                    }
                    return true;
                  })
                  .map((cancion, index) => {
                    const isCurrentSong = currentSong?._id === cancion._id;
                    const isCreator = isOwnProfile;
                    console.log(
                      "🎵 Canción:",
                      cancion.titulo,
                      "- isOwnProfile:",
                      isOwnProfile,
                      "- showCreatorActions:",
                      isCreator
                    );
                    return (
                      <SongRow
                        key={cancion._id}
                        cancion={cancion}
                        index={index}
                        isCurrentSong={isCurrentSong}
                        isPlaying={isPlaying}
                        onPlay={() => handlePlaySong(cancion)}
                        onOpenComments={() => setComentariosCancion(cancion)}
                        showCreatorActions={isCreator}
                        onEdit={() => handleEditSong(cancion)}
                        onDelete={() => {
                          setSongToDelete(cancion);
                          setShowDeleteSongModal(true);
                        }}
                        onLikeChange={(liked) => {
                          // Actualizar inmediatamente el estado local
                          setCanciones((prevCanciones) =>
                            prevCanciones.map((c) =>
                              c._id === cancion._id
                                ? {
                                    ...c,
                                    likes: liked
                                      ? [
                                          ...(c.likes || []),
                                          currentUser?._id || "",
                                        ]
                                      : (c.likes || []).filter(
                                          (id) => id !== currentUser?._id
                                        ),
                                  }
                                : c
                            )
                          );
                        }}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "albumes" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Álbumes</h2>
            {loadingContent ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : albumes.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Music size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay álbumes para mostrar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {albumes.map((album) => (
                  <div
                    key={album._id}
                    onClick={() => navigate(`/album/${album._id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800 mb-3">
                      <img
                        src={album.portadaUrl || "/cover.jpg"}
                        alt={album.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                          <Play
                            size={24}
                            fill="white"
                            className="text-white ml-1"
                          />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold truncate mb-1">
                      {album.titulo}
                    </h3>
                    <p className="text-sm text-neutral-400 truncate">
                      {formatTimeAgo(album.createdAt)} •{" "}
                      {Array.isArray(album.canciones)
                        ? album.canciones.length
                        : 0}{" "}
                      pistas
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "playlists" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Playlists públicas</h2>
            {loadingContent ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : playlists.filter((p) => p.esPublica).length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Music size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay playlists públicas para mostrar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {playlists
                  .filter((playlist) => playlist.esPublica)
                  .map((playlist) => (
                    <div
                      key={playlist._id}
                      onClick={() => navigate(`/playlist/${playlist._id}`)}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800 mb-3">
                        <img
                          src={playlist.portadaUrl || "/cover.jpg"}
                          alt={playlist.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Play
                              size={24}
                              fill="white"
                              className="text-white ml-1"
                            />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold truncate mb-1">
                        {playlist.titulo}
                      </h3>
                      <p className="text-sm text-neutral-400 truncate">
                        {formatTimeAgo(playlist.createdAt)} •{" "}
                        {Array.isArray(playlist.canciones)
                          ? playlist.canciones.length
                          : 0}{" "}
                        canciones
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "seguidores" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Seguidores</h2>
            {loadingContent ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-neutral-600 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : seguidores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seguidores
                  .filter((seguidor) => seguidor && seguidor._id)
                  .map((seguidor) => (
                    <div
                      key={seguidor._id}
                      onClick={() => navigate(`/perfil/${seguidor.nick}`)}
                      className="bg-neutral-800/50 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-neutral-700 rounded-full shrink-0 overflow-hidden">
                        <img
                          src={seguidor.avatarUrl || "/avatar.png"}
                          alt={seguidor.nick}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {seguidor.nombreArtistico || seguidor.nick}
                        </p>
                        <p className="text-sm text-neutral-400 truncate">
                          @{seguidor.nick}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay seguidores para mostrar</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "siguiendo" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Siguiendo</h2>
            {loadingContent ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-neutral-600 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : seguidos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seguidos
                  .filter((seguido) => seguido && seguido._id)
                  .map((seguido) => (
                    <div
                      key={seguido._id}
                      onClick={() => navigate(`/perfil/${seguido.nick}`)}
                      className="bg-neutral-800/50 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-neutral-700 rounded-full shrink-0 overflow-hidden">
                        <img
                          src={seguido.avatarUrl || "/avatar.png"}
                          alt={seguido.nick}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {seguido.nombreArtistico || seguido.nick}
                        </p>
                        <p className="text-sm text-neutral-400 truncate">
                          @{seguido.nick}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No sigue a nadie todavía</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar amigo */}
      {showRemoveFriendModal && profileUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Eliminar amigo</h3>
              <button
                onClick={() => setShowRemoveFriendModal(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-neutral-400 mb-6">
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="text-white font-semibold">
                @{profileUser.nick}
              </span>{" "}
              de tu lista de amigos?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveFriendModal(false)}
                disabled={loadingAction}
                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveFriend}
                disabled={loadingAction}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loadingAction ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para dejar de seguir */}
      {showUnfollowModal && profileUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Dejar de seguir</h3>
              <button
                onClick={() => setShowUnfollowModal(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-neutral-400 mb-6">
              ¿Estás seguro de que deseas dejar de seguir a{" "}
              <span className="text-white font-semibold">
                @{profileUser.nick}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUnfollowModal(false)}
                disabled={loadingAction}
                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUnfollow}
                disabled={loadingAction}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loadingAction ? "Dejando de seguir..." : "Dejar de seguir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de comentarios */}
      {comentariosCancion && (
        <SongCommentsModal
          song={comentariosCancion}
          onClose={() => setComentariosCancion(null)}
        />
      )}

      {/* Modal de Reportar Usuario */}
      {profileUser && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          tipoContenido="usuario"
          contenidoId={profileUser._id}
          nombreContenido={`@${profileUser.nick}`}
        />
      )}

      {/* Modal de cuenta suspendida */}
      {showDeleteSongModal && songToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Eliminar canción</h3>
              <button
                onClick={() => {
                  setShowDeleteSongModal(false);
                  setSongToDelete(null);
                }}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-neutral-400 mb-2">
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="text-white font-semibold">
                "{songToDelete.titulo}"
              </span>
              ?
            </p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 mt-4">
              <p className="text-red-400 text-sm font-medium mb-2">
                ⚠️ Esta acción es permanente y eliminará:
              </p>
              <ul className="text-red-300 text-sm space-y-1 ml-4 list-disc">
                <li>La canción de toda la aplicación</li>
                <li>De todas las playlists donde aparece</li>
                <li>De todos los álbumes donde aparece</li>
                <li>De las canciones guardadas de otros usuarios</li>
                <li>Los archivos de audio de nuestros servidores</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteSongModal(false);
                  setSongToDelete(null);
                }}
                disabled={loadingAction}
                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSong}
                disabled={loadingAction}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loadingAction ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cuenta suspendida */}
      {showSuspendedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-yellow-600/20 p-3 rounded-full">
                <Ban className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Tu cuenta está suspendida
                </h3>
                <p className="text-gray-300 mb-3">
                  No puedes ver perfiles de otros usuarios mientras tu cuenta
                  esté suspendida.
                </p>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">
                    Razón de la suspensión:
                  </p>
                  <p className="text-yellow-400 font-medium">
                    {(currentUser as any)?.razonSuspension ||
                      "Violación de normas comunitarias"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSuspendedModal(false);
                navigate("/", { replace: true });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Modal de editar canción */}
      {songToEdit && (
        <EditSongModal
          isOpen={showEditSongModal}
          onClose={() => {
            setShowEditSongModal(false);
            setSongToEdit(null);
          }}
          onSave={handleSaveEditedSong}
          song={songToEdit}
        />
      )}
    </div>
  );
}
