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
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4 bg-neutral-900 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("queue")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "queue"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ListMusic size={16} />
                <span>Cola ({queue.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === "friends"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={16} />
                <span>Amigos</span>
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
                    <div className="mb-4 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                      <p className="text-xs text-neutral-400 mb-1">
                        {currentContext.type === "album"
                          ? "Estás en el álbum"
                          : "Estás en la playlist"}
                      </p>
                      <p className="text-sm font-semibold truncate">
                        {currentContext.name}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">
                      Próximas {queue.length - 1}
                    </h3>
                    {queue.length > 1 && (
                      <button
                        onClick={clearQueue}
                        className="text-xs text-neutral-400 hover:text-white transition-colors"
                      >
                        Limpiar cola
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
                          className={`group flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
                            isCurrentSong
                              ? "bg-neutral-800"
                              : "hover:bg-neutral-800"
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
                                className="text-orange-500"
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
                                isCurrentSong ? "text-orange-500" : ""
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
                <div className="text-center py-12">
                  <ListMusic
                    size={48}
                    className="text-neutral-600 mx-auto mb-4"
                  />
                  <p className="text-sm text-neutral-400 mb-1">
                    La cola está vacía
                  </p>
                  <p className="text-xs text-neutral-500">
                    Reproduce una canción para comenzar
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
                  <Users size={24} className="text-neutral-400" />
                  <h2 className="font-semibold text-lg">Amigos</h2>
                </div>
                <button
                  onClick={() => navigate("/solicitudes")}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                  title="Ver todas las solicitudes"
                >
                  <UserPlus size={18} className="text-neutral-400" />
                </button>
              </div>

              {isLoading ? (
                <div className="px-2 py-4 text-center">
                  <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-neutral-500 mt-2">
                    Cargando amigos...
                  </p>
                </div>
              ) : friends.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <Users size={32} className="text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400 mb-1">
                    Aún no tienes amigos
                  </p>
                  <p className="text-xs text-neutral-500">
                    Busca usuarios y envía solicitudes de amistad
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Amigos en línea */}
                  {onlineFriends.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-neutral-400 uppercase mb-3 px-2">
                        En línea — {onlineFriends.length}
                      </h3>
                      {onlineFriends.map((friend) => (
                        <div
                          key={friend._id}
                          onClick={() => navigate(`/profile/${friend.nick}`)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
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
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-950 animate-pulse" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">
                              {friend.nombreArtistico || friend.nick}
                            </p>
                            <p className="text-xs text-green-400 truncate">
                              En línea
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Amigos desconectados */}
                  {offlineFriends.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-neutral-400 uppercase mb-3 px-2">
                        Desconectado — {offlineFriends.length}
                      </h3>
                      {offlineFriends.map((friend) => (
                        <div
                          key={friend._id}
                          onClick={() => navigate(`/profile/${friend.nick}`)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
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
