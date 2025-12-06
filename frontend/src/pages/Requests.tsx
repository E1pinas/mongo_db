import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  friendshipService,
  type SolicitudAmistad,
} from "../services/friendship.service";
import { UserPlus, UserCheck, UserX, Users, Ban, Clock, X } from "lucide-react";
import type { Usuario } from "../types";
import ConnectionStatus from "../components/common/ConnectionStatus";

/**
 * Requests - Página de solicitudes
 *
 * Muestra solicitudes de amistad pendientes, enviadas y amigos
 */

export default function Requests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "recibidas" | "amigos" | "bloqueados"
  >("recibidas");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState<
    SolicitudAmistad[]
  >([]);
  const [amigos, setAmigos] = useState<Usuario[]>([]);
  const [bloqueados, setBloqueados] = useState<Usuario[]>([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<{
    id: string;
    nick: string;
  } | null>(null);

  // Cargar contadores al inicio
  useEffect(() => {
    loadAllCounts();
  }, []);

  // Cargar datos completos cuando cambia la pestaña
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadAllCounts = async () => {
    try {
      // Cargar todas las listas en paralelo para tener los contadores
      const [solicitudes, amigosData, bloqueadosData] = await Promise.all([
        friendshipService.getPendingRequests(),
        friendshipService.getFriends(),
        friendshipService.getBlockedUsers(),
      ]);

      setSolicitudesRecibidas(solicitudes);
      setAmigos(amigosData);
      setBloqueados(bloqueadosData);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === "recibidas") {
        const data = await friendshipService.getPendingRequests();
        setSolicitudesRecibidas(data);
      } else if (activeTab === "amigos") {
        const data = await friendshipService.getFriends();
        setAmigos(data);
      } else if (activeTab === "bloqueados") {
        const data = await friendshipService.getBlockedUsers();
        setBloqueados(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (solicitudId: string) => {
    try {
      setActionLoading(solicitudId);
      await friendshipService.acceptFriendRequest(solicitudId);
      setSolicitudesRecibidas(
        solicitudesRecibidas.filter((s) => s._id !== solicitudId)
      );
    } catch (error: any) {
      console.error("Error accepting request:", error);
      alert(error.message || "Error al aceptar solicitud");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (solicitudId: string) => {
    try {
      setActionLoading(solicitudId);
      await friendshipService.rejectFriendRequest(solicitudId);
      setSolicitudesRecibidas(
        solicitudesRecibidas.filter((s) => s._id !== solicitudId)
      );
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      alert(error.message || "Error al rechazar solicitud");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (solicitudId: string) => {
    const solicitud = solicitudesRecibidas.find((s) => s._id === solicitudId);
    if (!solicitud) return;

    const solicitante = solicitud.solicitante as Usuario;

    if (
      !confirm(
        `¿Bloquear a @${solicitante.nick}? No podrá ver tu perfil ni enviarte solicitudes.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(solicitudId);
      await friendshipService.blockFromRequest(solicitudId);
      setSolicitudesRecibidas(
        solicitudesRecibidas.filter((s) => s._id !== solicitudId)
      );
    } catch (error: any) {
      console.error("Error blocking user:", error);
      alert(error.message || "Error al bloquear usuario");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;

    try {
      setActionLoading(friendToRemove.id);
      console.log("🗑️ Frontend: Eliminando amigo con ID:", friendToRemove.id);
      await friendshipService.removeFriend(friendToRemove.id);
      setAmigos(amigos.filter((a) => a._id !== friendToRemove.id));
      setShowRemoveModal(false);
      setFriendToRemove(null);
    } catch (error: any) {
      console.error("Error removing friend:", error);
      alert(error.message || "Error al eliminar amistad");
    } finally {
      setActionLoading(null);
    }
  };

  const openRemoveModal = (amigoId: string, nick: string) => {
    setFriendToRemove({ id: amigoId, nick });
    setShowRemoveModal(true);
  };

  const handleUnblock = async (usuarioId: string, nick: string) => {
    if (!confirm(`¿Desbloquear a @${nick}?`)) {
      return;
    }

    try {
      setActionLoading(usuarioId);
      await friendshipService.unblockUser(usuarioId);
      setBloqueados(bloqueados.filter((u) => u._id !== usuarioId));
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      alert(error.message || "Error al desbloquear usuario");
    } finally {
      setActionLoading(null);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return then.toLocaleDateString();
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Solicitudes y Amigos</h1>
        <p className="text-neutral-400">Gestiona tus conexiones sociales</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 mb-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab("recibidas")}
            className={`pb-4 border-b-2 font-semibold transition-colors ${
              activeTab === "recibidas"
                ? "border-orange-500 text-white"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus size={18} />
              Solicitudes ({solicitudesRecibidas.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("amigos")}
            className={`pb-4 border-b-2 font-semibold transition-colors ${
              activeTab === "amigos"
                ? "border-orange-500 text-white"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              Amigos ({amigos.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("bloqueados")}
            className={`pb-4 border-b-2 font-semibold transition-colors ${
              activeTab === "bloqueados"
                ? "border-orange-500 text-white"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Ban size={18} />
              Bloqueados ({bloqueados.length})
            </div>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Tab: Solicitudes Recibidas */}
          {activeTab === "recibidas" && (
            <div className="space-y-4">
              {solicitudesRecibidas.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus size={32} className="text-neutral-400" />
                  </div>
                  <p className="text-xl font-semibold mb-2">
                    No tienes solicitudes pendientes
                  </p>
                  <p className="text-neutral-400">
                    Las nuevas solicitudes de amistad aparecerán aquí
                  </p>
                </div>
              ) : (
                solicitudesRecibidas.map((solicitud) => {
                  const solicitante = solicitud.solicitante as Usuario;
                  return (
                    <div
                      key={solicitud._id}
                      className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          onClick={() =>
                            navigate(`/profile/${solicitante.nick}`)
                          }
                          className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800 shrink-0 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                        >
                          {solicitante.avatarUrl ? (
                            <img
                              src={solicitante.avatarUrl}
                              alt={solicitante.nick}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
                              <span className="text-xl font-bold text-white">
                                {solicitante.nick.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            onClick={() =>
                              navigate(`/profile/${solicitante.nick}`)
                            }
                            className="font-semibold text-lg mb-1 cursor-pointer hover:text-orange-500 transition-colors truncate"
                          >
                            {solicitante.nombreArtistico || solicitante.nick}
                          </p>
                          <p className="text-sm text-neutral-400 mb-1 truncate">
                            @{solicitante.nick}
                          </p>
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimeAgo(solicitud.createdAt)}
                          </span>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAccept(solicitud._id)}
                            disabled={actionLoading === solicitud._id}
                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            <UserCheck size={16} />
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleReject(solicitud._id)}
                            disabled={actionLoading === solicitud._id}
                            className="px-5 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            <UserX size={16} />
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleBlock(solicitud._id)}
                            disabled={actionLoading === solicitud._id}
                            className="p-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Bloquear usuario"
                          >
                            <Ban size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab: Amigos */}
          {activeTab === "amigos" && (
            <div className="space-y-4">
              {amigos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-neutral-400" />
                  </div>
                  <p className="text-xl font-semibold mb-2">
                    Aún no tienes amigos
                  </p>
                  <p className="text-neutral-400">
                    Busca usuarios y envíales solicitudes de amistad
                  </p>
                </div>
              ) : (
                amigos.map((amigo) => (
                  <div
                    key={amigo._id}
                    className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        onClick={() => navigate(`/profile/${amigo.nick}`)}
                        className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 shrink-0 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                      >
                        {amigo.avatarUrl ? (
                          <img
                            src={amigo.avatarUrl}
                            alt={amigo.nick}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
                            <span className="text-lg font-bold text-white">
                              {amigo.nick.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          onClick={() => navigate(`/profile/${amigo.nick}`)}
                          className="font-semibold cursor-pointer hover:text-orange-500 transition-colors truncate"
                        >
                          {amigo.nombreArtistico || amigo.nick}
                        </p>
                        <p className="text-sm text-neutral-400 truncate">
                          @{amigo.nick}
                        </p>
                        <ConnectionStatus
                          isOnline={amigo.estaConectado}
                          lastConnection={amigo.ultimaConexion}
                        />
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => openRemoveModal(amigo._id, amigo.nick)}
                        disabled={actionLoading === amigo._id}
                        className="px-4 py-2 bg-neutral-800 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionLoading === amigo._id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Bloqueados */}
          {activeTab === "bloqueados" && (
            <div className="space-y-4">
              {bloqueados.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ban size={32} className="text-neutral-400" />
                  </div>
                  <p className="text-xl font-semibold mb-2">
                    No has bloqueado a nadie
                  </p>
                  <p className="text-neutral-400">
                    Los usuarios bloqueados aparecerán aquí
                  </p>
                </div>
              ) : (
                bloqueados.map((usuario) => (
                  <div
                    key={usuario._id}
                    className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 shrink-0 opacity-60">
                        {usuario.avatarUrl ? (
                          <img
                            src={usuario.avatarUrl}
                            alt={usuario.nick}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-neutral-600 to-neutral-700">
                            <span className="text-lg font-bold text-white">
                              {usuario.nick.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate opacity-60">
                          {usuario.nombreArtistico || usuario.nick}
                        </p>
                        <p className="text-sm text-neutral-400 truncate">
                          @{usuario.nick}
                        </p>
                      </div>

                      {/* Botón desbloquear */}
                      <button
                        onClick={() => handleUnblock(usuario._id, usuario.nick)}
                        disabled={actionLoading === usuario._id}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === usuario._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Desbloqueando...
                          </>
                        ) : (
                          <>
                            <UserX size={16} />
                            Desbloquear
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar amigo */}
      {showRemoveModal && friendToRemove && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Eliminar amigo</h3>
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setFriendToRemove(null);
                }}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-neutral-400 mb-6">
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="text-white font-semibold">
                @{friendToRemove.nick}
              </span>{" "}
              de tu lista de amigos?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setFriendToRemove(null);
                }}
                disabled={actionLoading !== null}
                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemoveFriend}
                disabled={actionLoading !== null}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading === friendToRemove.id
                  ? "Eliminando..."
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
