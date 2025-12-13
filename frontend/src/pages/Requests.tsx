import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  friendshipService,
  type SolicitudAmistad,
} from "../services/friendship.service";
import { bloqueoService } from "../services/bloqueo.service";
import { UserPlus, UserCheck, UserX, Users, Clock, X, Ban } from "lucide-react";
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
  const [bloqueados, setBloqueados] = useState<any[]>([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<{
    id: string;
    nick: string;
  } | null>(null);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedBlocked, setSelectedBlocked] = useState<any>(null);

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
        bloqueoService.obtenerBloqueados(),
      ]);

      setSolicitudesRecibidas(solicitudes);
      setAmigos(amigosData);
      setBloqueados(bloqueadosData.bloqueados || []);
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
        const data = await bloqueoService.obtenerBloqueados();
        setBloqueados(data.bloqueados || []);
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

  const handleUnblock = (bloqueado: any) => {
    setSelectedBlocked(bloqueado);
    setShowUnblockModal(true);
  };

  const confirmUnblock = async () => {
    if (!selectedBlocked) return;
    const usuario = selectedBlocked.usuario;

    try {
      setActionLoading(usuario._id);
      await bloqueoService.desbloquearUsuario(usuario._id);
      setBloqueados(bloqueados.filter((b) => b.usuario._id !== usuario._id));
      setShowUnblockModal(false);
      setSelectedBlocked(null);
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
    <div className="min-h-screen bg-linear-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-5xl font-black mb-3 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Conexiones
            </h1>
            <p className="text-neutral-400 text-lg">
              Gestiona tus amigos y solicitudes
            </p>
          </div>
        </div>

        {/* Tabs mejorados */}
        <div className="mb-8 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("recibidas")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                activeTab === "recibidas"
                  ? "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus size={20} />
                <span>Solicitudes</span>
                {solicitudesRecibidas.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "recibidas"
                        ? "bg-white/20"
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                  >
                    {solicitudesRecibidas.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("amigos")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                activeTab === "amigos"
                  ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={20} />
                <span>Amigos</span>
                {amigos.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "amigos"
                        ? "bg-white/20"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {amigos.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("bloqueados")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                activeTab === "bloqueados"
                  ? "bg-linear-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Ban size={20} />
                <span>Bloqueados</span>
                {bloqueados.length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "bloqueados"
                        ? "bg-white/20"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {bloqueados.length}
                  </span>
                )}
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
                  solicitudesRecibidas.map((solicitud, index) => {
                    const solicitante = solicitud.solicitante as Usuario;
                    return (
                      <div
                        key={solicitud._id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="bg-linear-to-r from-neutral-900/80 to-neutral-800/60 backdrop-blur-sm border border-neutral-700/50 p-5 rounded-2xl hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 animate-fade-in"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar mejorado */}
                          <div
                            onClick={() =>
                              navigate(`/perfil/${solicitante.nick}`)
                            }
                            className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-800 shrink-0 cursor-pointer hover:ring-4 hover:ring-orange-500/50 transition-all duration-300 hover:scale-110"
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
                                navigate(`/perfil/${solicitante.nick}`)
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

                          {/* Botones de acción mejorados */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleAccept(solicitud._id)}
                              disabled={actionLoading === solicitud._id}
                              className="px-5 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-500/30 hover:scale-105"
                            >
                              <UserCheck size={16} />
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleReject(solicitud._id)}
                              disabled={actionLoading === solicitud._id}
                              className="px-5 py-2.5 bg-neutral-700/80 backdrop-blur-sm hover:bg-neutral-600 text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover:scale-105"
                            >
                              <UserX size={16} />
                              Rechazar
                            </button>
                            <button
                              onClick={() => handleBlock(solicitud._id)}
                              disabled={actionLoading === solicitud._id}
                              className="p-2.5 bg-red-500/20 hover:bg-linear-to-r hover:from-red-500 hover:to-pink-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 border border-red-500/30 hover:border-transparent hover:scale-105"
                              title="Bloquear usuario"
                            >
                              <Ban size={18} />
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
                  amigos.map((amigo, index) => (
                    <div
                      key={amigo._id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="bg-linear-to-r from-neutral-900/80 to-neutral-800/60 backdrop-blur-sm border border-neutral-700/50 p-5 rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 animate-fade-in"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          onClick={() => navigate(`/perfil/${amigo.nick}`)}
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
                            onClick={() => navigate(`/perfil/${amigo.nick}`)}
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
                      No hay usuarios bloqueados
                    </p>
                    <p className="text-neutral-400">
                      Cuando bloquees a alguien, aparecerá aquí
                    </p>
                  </div>
                ) : (
                  bloqueados.map((bloqueado, index) => {
                    const usuario = bloqueado.usuario;
                    return (
                      <div
                        key={usuario._id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="bg-linear-to-r from-neutral-900/80 to-neutral-800/60 backdrop-blur-sm border border-neutral-700/50 p-5 rounded-2xl hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 animate-fade-in"
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 shrink-0 opacity-60">
                            {usuario.avatarUrl ? (
                              <img
                                src={usuario.avatarUrl}
                                alt={usuario.nick}
                                className="w-full h-full object-cover grayscale"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-red-500 to-orange-600">
                                <span className="text-lg font-bold text-white">
                                  {usuario.nick.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-neutral-300">
                              {usuario.nombreArtistico || usuario.nick}
                            </p>
                            <p className="text-sm text-neutral-400 truncate">
                              @{usuario.nick}
                            </p>
                            {bloqueado.razon && (
                              <p className="text-sm text-orange-400 mt-1 line-clamp-2">
                                Razón: {bloqueado.razon}
                              </p>
                            )}
                            {bloqueado.fechaBloqueo && (
                              <p className="text-xs text-neutral-500 mt-1">
                                Bloqueado el{" "}
                                {new Date(
                                  bloqueado.fechaBloqueo
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          {/* Botón desbloquear */}
                          <button
                            onClick={() => handleUnblock(bloqueado)}
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
                    );
                  })
                )}
              </div>
            )}
          </>
        )}

        {/* Modal de confirmación para desbloquear */}
        {showUnblockModal && selectedBlocked && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Desbloquear usuario</h3>
                <button
                  onClick={() => {
                    setShowUnblockModal(false);
                    setSelectedBlocked(null);
                  }}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-neutral-400 mb-4">
                ¿Estás seguro de que deseas desbloquear a{" "}
                <span className="text-white font-semibold">
                  @{selectedBlocked.usuario.nick}
                </span>
                ?
              </p>

              {selectedBlocked.razon && (
                <div className="bg-neutral-800/50 border border-orange-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-neutral-400 mb-2">
                    Lo bloqueaste por:
                  </p>
                  <p className="text-orange-400 font-medium">
                    {selectedBlocked.razon}
                  </p>
                </div>
              )}

              <p className="text-sm text-neutral-500 mb-6">
                Una vez desbloqueado, podrá volver a ver tu perfil y enviarte
                solicitudes de amistad.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnblockModal(false);
                    setSelectedBlocked(null);
                  }}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmUnblock}
                  disabled={actionLoading !== null}
                  className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {actionLoading === selectedBlocked.usuario._id
                    ? "Desbloqueando..."
                    : "Desbloquear"}
                </button>
              </div>
            </div>
          </div>
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
    </div>
  );
}
