import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  Music,
  Disc,
  ListMusic,
  Trash2,
  Play,
  X,
} from "lucide-react";
import type { Post } from "../../types";
import { formatTimeAgo } from "../../utils/dateFormat";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onUndoRepost?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export default function PostCard({
  post,
  onLike,
  onDelete,
  onRepost,
  onUndoRepost,
  onComment,
}: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const isOwnPost = user?._id === post.usuario._id;

  // Para repost_post, verificar si el post ORIGINAL es propio
  const isOwnOriginalPost =
    post.tipo === "repost_post" && post.postOriginal
      ? user?._id === post.postOriginal.usuario._id
      : false;

  const handleResourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (post.tipo === "repost_cancion" && post.recursoId) {
      console.log("Reproducir canción:", post.recursoId);
    } else if (
      post.tipo === "repost_album" &&
      post.recursoId &&
      typeof post.recursoId === "object" &&
      "_id" in post.recursoId
    ) {
      navigate(`/album/${post.recursoId._id}`);
    } else if (
      post.tipo === "repost_playlist" &&
      post.recursoId &&
      typeof post.recursoId === "object" &&
      "_id" in post.recursoId
    ) {
      navigate(`/playlist/${post.recursoId._id}`);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.usuario.nick}`);
  };

  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl border border-neutral-800 hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 p-6 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
              <img
                src={post.usuario.avatarUrl || "/avatar.png"}
                alt={post.usuario.nick}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <div
              onClick={handleProfileClick}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="font-semibold group-hover:text-orange-500 transition-colors">
                {post.usuario.nombreArtistico || post.usuario.nombre}
              </span>
              {post.usuario.verificado && (
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
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
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>@{post.usuario.nick}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {isOwnPost && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <MoreHorizontal size={18} className="text-neutral-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl z-20 min-w-[180px] overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(post._id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-700 flex items-center gap-3 text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm">Eliminar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Indicador de Repost */}
      {post.tipo === "repost_post" && (
        <div className="flex items-center gap-2 text-xs text-orange-400 mb-3 ml-1">
          <Repeat2 size={14} />
          <span className="font-medium">Reposteó</span>
        </div>
      )}

      {/* Post Original (si es un repost) */}
      {post.tipo === "repost_post" && post.postOriginal && (
        <div className="mb-4">
          {/* Comentario del repost */}
          {post.contenido && (
            <p className="text-neutral-200 mb-3 leading-relaxed">
              {post.contenido}
            </p>
          )}

          {/* Post original como card */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              // Navegar al perfil del usuario original y ver el post
              navigate(`/profile/${post.postOriginal.usuario.nick}`);
            }}
            className="border border-neutral-700 rounded-xl p-4 bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors cursor-pointer"
          >
            {/* Header del post original */}
            <div className="flex items-center gap-3 mb-3">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${post.postOriginal.usuario.nick}`);
                }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5 hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                  <img
                    src={post.postOriginal.usuario.avatarUrl || "/avatar.png"}
                    alt={post.postOriginal.usuario.nick}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${post.postOriginal.usuario.nick}`);
                  }}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span className="font-semibold text-sm text-orange-400 group-hover:text-orange-300">
                    {post.postOriginal.usuario.nombreArtistico ||
                      post.postOriginal.usuario.nombre}
                  </span>
                  {post.postOriginal.usuario.verificado && (
                    <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2 h-2 text-white"
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
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span>@{post.postOriginal.usuario.nick}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(post.postOriginal.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contenido del post original */}
            {post.postOriginal.contenido && (
              <p className="text-neutral-300 text-sm leading-relaxed">
                {post.postOriginal.contenido}
              </p>
            )}

            {/* Recurso del post original (si tiene) */}
            {post.postOriginal.recursoId &&
              typeof post.postOriginal.recursoId === "object" && (
                <div className="mt-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg overflow-hidden shrink-0">
                      {"portadaUrl" in post.postOriginal.recursoId &&
                      post.postOriginal.recursoId.portadaUrl ? (
                        <img
                          src={post.postOriginal.recursoId.portadaUrl}
                          alt="Portada"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-full h-full p-3 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {"titulo" in post.postOriginal.recursoId &&
                          post.postOriginal.recursoId.titulo}
                      </p>
                      <p className="text-xs text-orange-500 uppercase tracking-wide">
                        {post.postOriginal.tipo === "repost_cancion" &&
                          "Canción"}
                        {post.postOriginal.tipo === "repost_album" && "Álbum"}
                        {post.postOriginal.tipo === "repost_playlist" &&
                          "Playlist"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Content (solo si NO es repost_post) */}
      {post.tipo !== "repost_post" && post.contenido && (
        <p className="text-neutral-200 mb-4 leading-relaxed">
          {post.contenido}
        </p>
      )}

      {/* Resource Card (solo si NO es repost_post) */}
      {post.tipo !== "repost_post" &&
        post.tipo !== "texto" &&
        post.recursoId &&
        typeof post.recursoId === "object" && (
          <div
            onClick={handleResourceClick}
            className="mb-4 p-4 rounded-lg bg-gradient-to-br from-neutral-800/80 to-neutral-800/40 border border-neutral-700/50 hover:border-orange-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-neutral-700/50 rounded-lg overflow-hidden shrink-0 relative">
                {"portadaUrl" in post.recursoId && post.recursoId.portadaUrl ? (
                  <>
                    <img
                      src={post.recursoId.portadaUrl}
                      alt="Portada"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {post.tipo === "repost_cancion" && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Play
                            size={18}
                            fill="white"
                            className="text-white ml-0.5"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
                    {post.tipo === "repost_cancion" && (
                      <Music size={28} className="text-neutral-500" />
                    )}
                    {post.tipo === "repost_album" && (
                      <Disc size={28} className="text-neutral-500" />
                    )}
                    {post.tipo === "repost_playlist" && (
                      <ListMusic size={28} className="text-neutral-500" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.tipo === "repost_cancion" && (
                    <Music size={14} className="text-orange-500" />
                  )}
                  {post.tipo === "repost_album" && (
                    <Disc size={14} className="text-orange-500" />
                  )}
                  {post.tipo === "repost_playlist" && (
                    <ListMusic size={14} className="text-orange-500" />
                  )}
                  <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                    {post.tipo === "repost_cancion" && "Canción"}
                    {post.tipo === "repost_album" && "Álbum"}
                    {post.tipo === "repost_playlist" && "Playlist"}
                  </span>
                </div>
                <p className="font-semibold text-white truncate mb-0.5">
                  {"titulo" in post.recursoId && post.recursoId.titulo}
                </p>
                <p className="text-xs text-neutral-400">
                  {"artistas" in post.recursoId &&
                  Array.isArray(post.recursoId.artistas)
                    ? post.recursoId.artistas
                        .map((a: any) =>
                          typeof a === "string"
                            ? a
                            : a.nombreArtistico || a.nick
                        )
                        .join(", ")
                    : "creador" in post.recursoId &&
                      typeof post.recursoId.creador === "object"
                    ? post.recursoId.creador.nombreArtistico ||
                      post.recursoId.creador.nick
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-neutral-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("💬 Click en botón de comentarios en PostCard");
            console.log("💬 onComment function:", onComment);
            // Para repost_post, comentar el post original
            const targetPostId =
              post.tipo === "repost_post" && post.postOriginal
                ? post.postOriginal._id
                : post._id;
            console.log("💬 Llamando onComment con postId:", targetPostId);
            onComment?.(targetPostId);
          }}
          className="flex items-center gap-2 text-neutral-400 hover:text-blue-400 transition-colors group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
            <MessageCircle size={18} />
          </div>
          <span className="text-sm font-medium">
            {post.tipo === "repost_post" && post.postOriginal
              ? post.postOriginal.totalComentarios || 0
              : post.totalComentarios || 0}
          </span>
        </button>

        {/* Botón de repost: NO mostrar si el post original es propio */}
        {!isOwnPost && !isOwnOriginalPost && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Para repost_post, usar el ID del post original
              const targetPostId =
                post.tipo === "repost_post" && post.postOriginal
                  ? post.postOriginal._id
                  : post._id;
              const hasReposted =
                post.tipo === "repost_post" && post.postOriginal
                  ? post.postOriginal.usuario_hizo_repost
                  : post.usuario_hizo_repost;

              if (hasReposted && onUndoRepost) {
                onUndoRepost(targetPostId);
              } else {
                onRepost?.(targetPostId);
              }
            }}
            className={`flex items-center gap-2 transition-colors group ${
              (
                post.tipo === "repost_post" && post.postOriginal
                  ? post.postOriginal.usuario_hizo_repost
                  : post.usuario_hizo_repost
              )
                ? "text-green-500"
                : "text-neutral-400 hover:text-green-400"
            }`}
          >
            <div className="p-1.5 rounded-lg group-hover:bg-green-500/10 transition-colors">
              <Repeat2 size={18} />
            </div>
            <span className="text-sm font-medium">
              {post.tipo === "repost_post" && post.postOriginal
                ? post.postOriginal.totalReposts || 0
                : post.totalReposts || 0}
            </span>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("💗 Click en botón de like en PostCard");
            console.log("💗 Post:", post._id);
            console.log("💗 onLike function:", onLike);
            // Para repost_post, dar like al post original
            const targetPostId =
              post.tipo === "repost_post" && post.postOriginal
                ? post.postOriginal._id
                : post._id;
            console.log("💗 Llamando onLike con postId:", targetPostId);
            onLike(targetPostId);
          }}
          className={`flex items-center gap-2 transition-colors group ${
            post.tipo === "repost_post" && post.postOriginal
              ? post.postOriginal.usuario_dio_like
                ? "text-red-500"
                : "text-neutral-400 hover:text-red-400"
              : post.usuario_dio_like
              ? "text-red-500"
              : "text-neutral-400 hover:text-red-400"
          }`}
        >
          <div className="p-1.5 rounded-lg group-hover:bg-red-500/10 transition-colors">
            <Heart
              size={18}
              fill={
                post.tipo === "repost_post" && post.postOriginal
                  ? post.postOriginal.usuario_dio_like
                    ? "currentColor"
                    : "none"
                  : post.usuario_dio_like
                  ? "currentColor"
                  : "none"
              }
            />
          </div>
          <span className="text-sm font-medium">
            {post.tipo === "repost_post" && post.postOriginal
              ? post.postOriginal.totalLikes || 0
              : post.totalLikes || 0}
          </span>
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-neutral-400 hover:text-purple-400 transition-colors group ml-auto"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-purple-500/10 transition-colors">
            <Share size={18} />
          </div>
        </button>
      </div>
    </div>
  );
}
