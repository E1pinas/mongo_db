import { useState, useEffect } from "react";
import { Users, UserPlus, Music, ListMusic, X, Heart } from "lucide-react";
import { friendshipService } from "../../services/friendship.service";
import { musicService } from "../../services/music.service";
import { usePlayer, useAuth } from "../../contexts";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Usuario, Cancion } from "../../types";

interface SidebarRightProps {
  isOpen: boolean;
}

export default function SidebarRight({ isOpen }: SidebarRightProps) {
  const {
    queue,
    currentSong,
    playSong,
    removeFromQueue,
    clearQueue,
    currentContext,
  } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"queue" | "friends">("queue");

  // Cargar amigos al montar y cada 30 segundos
  useEffect(() => {
    if (isOpen && activeTab === "friends") {
      loadFriends();
      const interval = setInterval(loadFriends, 30000); // Actualizar cada 30s
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTab]);

  const loadFriends = async () => {
    try {
      const data = await friendshipService.getFriends();
      console.log("🔍 Amigos cargados:", data);
      console.log(
        "🎵 Primer amigo online:",
        data.find((f: Usuario) => f.estaConectado)
      );
      setFriends(data);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (lastConnection?: string) => {
    if (!lastConnection) return "Hace mucho";

    try {
      const time = formatDistanceToNow(new Date(lastConnection), {
        addSuffix: false,
        locale: es,
      });
      return time;
    } catch {
      return "Hace mucho";
    }
  };

  // Separar amigos en línea y desconectados
  const onlineFriends = friends.filter((f) => f.estaConectado);
  const offlineFriends = friends.filter((f) => !f.estaConectado);

  // Si no está abierto, ancho 0 (colapsado)
  const widthClass = isOpen ? "w-[300px]" : "w-0";

  return (
    <aside
      className={`
        hidden lg:block
        ${widthClass}
        bg-neutral-950 border-l border-neutral-800
        transition-all duration-300
        overflow-hidden
        h-full
      `}
    >
      {isOpen && (
        <div className="p-4 w-[300px] flex flex-col h-full">
          {/* Tabs mejorados */}
          <div className="flex items-center gap-2 mb-6 bg-neutral-900/50 backdrop-blur-sm rounded-xl p-1.5 border border-neutral-800">
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                activeTab === "queue"
                  ? currentContext?.type === "playlist"
                    ? "bg-linear-to-r from-green-500 to-blue-600 text-white shadow-lg shadow-green-500/30"
                    : "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ListMusic size={18} />
                <span>Cola</span>
                {queue.length > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "queue"
                        ? "bg-white/20"
                        : currentContext?.type === "playlist"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                  >
                    {queue.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                activeTab === "friends"
                  ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={18} />
                <span>Amigos</span>
                {onlineFriends.length > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === "friends"
                        ? "bg-white/20"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {onlineFriends.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Cola de Reproducción */}
          {activeTab === "queue" && (
            <div className="flex-1 overflow-y-auto">
              {queue.length > 0 ? (
                <>
                  {/* Mostrar contexto si existe */}
                  {currentContext && (
                    <div
                      className={`mb-4 p-4 rounded-xl border backdrop-blur-sm ${
                        currentContext.type === "playlist"
                          ? "bg-linear-to-br from-green-500/10 to-blue-500/10 border-green-500/30"
                          : "bg-linear-to-br from-orange-500/10 to-pink-500/10 border-orange-500/30"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${
                          currentContext.type === "playlist"
                            ? "text-green-400"
                            : "text-orange-400"
                        }`}
                      >
                        {currentContext.type === "album"
                          ? "🎵 Álbum"
                          : "📋 Playlist"}
                      </p>
                      <p className="text-sm font-bold text-white truncate">
                        {currentContext.name}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-neutral-200">
                      Próximas • {queue.length - 1}
                    </h3>
                    {queue.length > 1 && (
                      <button
                        onClick={clearQueue}
                        className="px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/30"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {queue.map((song, index) => {
                      const isCurrentSong = currentSong?._id === song._id;
                      const getArtistName = (
                        artistas: string[] | Usuario[]
                      ) => {
                        if (!artistas || artistas.length === 0)
                          return "Artista";
                        if (typeof artistas[0] === "string") return "Artista";
                        const artistasPopulados = artistas as Usuario[];
                        return (
                          artistasPopulados
                            .map((a) => a.nombreArtistico || a.nick || a.nombre)
                            .join(", ") || "Artista"
                        );
                      };

                      const songIsLiked =
                        song.likes?.some((id: string) => id === user?._id) ||
                        false;

                      return (
                        <div
                          key={`${song._id}-${index}`}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
                            isCurrentSong
                              ? currentContext?.type === "playlist"
                                ? "bg-linear-to-r from-green-500/20 to-blue-500/20 border border-green-500/30"
                                : "bg-linear-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30"
                              : "hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700"
                          }`}
                          onClick={() => playSong(song)}
                        >
                          {/* Icono de música o número */}
                          <div className="w-5 flex items-center justify-center shrink-0">
                            {isCurrentSong ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={
                                  currentContext?.type === "playlist"
                                    ? "text-green-500"
                                    : "text-orange-500"
                                }
                              >
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                              </svg>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                {index + 1}
                              </span>
                            )}
                          </div>

                          <div className="w-10 h-10 bg-neutral-700 rounded shrink-0 overflow-hidden">
                            <img
                              src={song.portadaUrl || "/cover.jpg"}
                              alt={song.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                isCurrentSong
                                  ? currentContext?.type === "playlist"
                                    ? "text-green-500"
                                    : "text-orange-500"
                                  : ""
                              }`}
                            >
                              {song.titulo}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                              {getArtistName(song.artistas)}
                            </p>
                          </div>

                          {!isCurrentSong && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromQueue(index);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all shrink-0"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-linear-to-br from-orange-500/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListMusic size={32} className="text-neutral-500" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-400 mb-2">
                    Cola vacía
                  </p>
                  <p className="text-xs text-neutral-500">
                    Reproduce música para llenar la cola
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Amigos */}
          {activeTab === "friends" && (
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-blue-400" />
                  </div>
                  <h2 className="font-bold text-lg">Amigos</h2>
                </div>
                <button
                  onClick={() => navigate("/solicitudes")}
                  className="p-2.5 hover:bg-linear-to-br hover:from-blue-500/20 hover:to-cyan-500/20 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-500/30"
                  title="Ver todas las solicitudes"
                >
                  <UserPlus
                    size={18}
                    className="text-neutral-400 hover:text-blue-400 transition-colors"
                  />
                </button>
              </div>

              {isLoading ? (
                <div className="px-2 py-12 text-center">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-neutral-500 mt-3 font-medium">
                    Cargando amigos...
                  </p>
                </div>
              ) : friends.length === 0 ? (
                <div className="px-2 py-16 text-center">
                  <div className="w-20 h-20 bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-neutral-500" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-400 mb-2">
                    Sin amigos aún
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    Envía solicitudes de amistad
                  </p>
                  <button
                    onClick={() => navigate("/solicitudes")}
                    className="px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                  >
                    Ver solicitudes
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Actividad de amigos (lo que están escuchando) */}
                  {onlineFriends.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3 px-2 py-2 bg-linear-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                        <Music size={16} className="text-green-400" />
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider">
                          En línea
                        </h3>
                        <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                          {onlineFriends.length}
                        </span>
                      </div>
                      {onlineFriends.map((friend) => {
                        const cancionActual = friend.cancionActual?.cancion;
                        const tieneCancion = !!cancionActual;

                        const getArtistName = (
                          artistas: string[] | Usuario[] | undefined
                        ) => {
                          if (!artistas || artistas.length === 0)
                            return "Artista";
                          if (typeof artistas[0] === "string") return "Artista";
                          const artistasPopulados = artistas as Usuario[];
                          return (
                            artistasPopulados
                              .map(
                                (a) => a.nombreArtistico || a.nick || a.nombre
                              )
                              .join(", ") || "Artista"
                          );
                        };

                        return (
                          <div
                            key={friend._id}
                            className="p-3 rounded-xl hover:bg-neutral-800/50 transition-all duration-300 border border-transparent hover:border-neutral-700"
                          >
                            <div
                              onClick={() => navigate(`/perfil/${friend.nick}`)}
                              className="flex items-center gap-3 cursor-pointer mb-2"
                            >
                              <div className="relative">
                                <img
                                  src={
                                    friend.avatarUrl &&
                                    friend.avatarUrl.trim() !== ""
                                      ? friend.avatarUrl
                                      : "/avatar.png"
                                  }
                                  alt={friend.nick}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/avatar.png";
                                  }}
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-950" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">
                                  {friend.nombreArtistico || friend.nick}
                                </p>
                                <p className="text-xs text-green-400 truncate flex items-center gap-1">
                                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                  En línea
                                </p>
                              </div>
                            </div>
                            {/* Mostrar canción actual si está escuchando */}
                            {tieneCancion ? (
                              <div
                                onClick={() => playSong(cancionActual)}
                                className="ml-13 flex items-center gap-2 cursor-pointer group p-1.5 rounded hover:bg-neutral-700/50 transition-colors"
                              >
                                <img
                                  src={cancionActual.portadaUrl || "/cover.jpg"}
                                  alt={cancionActual.titulo}
                                  className="w-8 h-8 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/cover.jpg";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-white truncate">
                                    {cancionActual.titulo}
                                  </p>
                                  <p className="text-xs text-neutral-400 truncate">
                                    {getArtistName(cancionActual.artistas)}
                                  </p>
                                </div>
                                <Music
                                  size={12}
                                  className="text-orange-500 group-hover:scale-110 transition-transform shrink-0"
                                />
                              </div>
                            ) : (
                              <div className="ml-13 text-xs text-neutral-500 flex items-center gap-1.5">
                                <Music size={12} className="text-neutral-600" />
                                <span className="truncate">
                                  Activo en la app
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Amigos en línea */}
                  {onlineFriends.length > 0 && offlineFriends.length > 0 && (
                    <div className="border-t border-neutral-800 pt-4"></div>
                  )}

                  {/* Amigos desconectados */}
                  {offlineFriends.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                          Desconectado
                        </h3>
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full text-xs font-bold">
                          {offlineFriends.length}
                        </span>
                      </div>
                      {offlineFriends.map((friend) => (
                        <div
                          key={friend._id}
                          onClick={() => navigate(`/perfil/${friend.nick}`)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-neutral-700"
                        >
                          <div className="relative">
                            <img
                              src={
                                friend.avatarUrl &&
                                friend.avatarUrl.trim() !== ""
                                  ? friend.avatarUrl
                                  : "/avatar.png"
                              }
                              alt={friend.nick}
                              className="w-10 h-10 rounded-full object-cover grayscale"
                              onError={(e) => {
                                e.currentTarget.src = "/avatar.png";
                              }}
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-neutral-950" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-neutral-300">
                              {friend.nombreArtistico || friend.nick}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                              Desconectado hace{" "}
                              {getTimeAgo(friend.ultimaConexion)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
