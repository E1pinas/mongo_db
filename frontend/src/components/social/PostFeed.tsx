import { useState, useEffect } from "react";
import { Plus, Loader2, Music, Ban, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts";
import { postService } from "../../services/post.service";
import type { Post, Cancion, Album, Playlist } from "../../types";
import { Toast } from "../Toast";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import PostCommentsModal from "./PostCommentsModal";

interface PostFeedProps {
  userId?: string;
  selectedSong?: Cancion;
  selectedAlbum?: Album;
  selectedPlaylist?: Playlist;
}

export default function PostFeed({
  userId,
  selectedSong,
  selectedAlbum,
  selectedPlaylist,
}: PostFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] =
    useState<Post | null>(null);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    loadPosts();
  }, [userId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let data: Post[];

      if (userId) {
        data = await postService.obtenerPostsUsuario(userId);
      } else {
        data = await postService.obtenerFeed();
      }

      setPosts(data);
    } catch (error) {
      console.error("Error cargando posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (data: {
    tipo: "texto" | "repost_cancion" | "repost_album" | "repost_playlist";
    contenido?: string;
    recursoId?: string;
  }) => {
    try {
      await postService.crearPost(data);
      setShowCreateModal(false);
      // Recargar el feed completo para mostrar el nuevo post con todos los datos
      await loadPosts();
    } catch (error: any) {
      throw error;
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await postService.toggleLike(postId);

      setPosts(
        posts.map((post) => {
          // Si el post es el que se dio like
          if (post._id === postId) {
            return {
              ...post,
              usuario_dio_like: result.liked,
              totalLikes: result.liked
                ? post.totalLikes + 1
                : post.totalLikes - 1,
            };
          }
          // Si el post es un repost_post y el like fue al post original
          if (
            post.tipo === "repost_post" &&
            post.postOriginal &&
            post.postOriginal._id === postId
          ) {
            return {
              ...post,
              postOriginal: {
                ...post.postOriginal,
                usuario_dio_like: result.liked,
                totalLikes: result.liked
                  ? post.postOriginal.totalLikes + 1
                  : post.postOriginal.totalLikes - 1,
              },
            };
          }
          return post;
        })
      );
    } catch (error: any) {
      console.error("Error al dar like:", error);

      // Si el post fue eliminado, recargamos el feed
      if (error.response?.status === 410) {
        setMensajeError("Este post ha sido eliminado");
        loadPosts();
      }
    }
  };

  const handleDelete = async (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await postService.eliminarPost(postToDelete);
      setPosts(posts.filter((post) => post._id !== postToDelete));
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error: any) {
      console.error("Error al eliminar post:", error);
      const errorMessage =
        error.response?.data?.message || "Error al eliminar el post";
      setMensajeError(errorMessage);
      setShowDeleteModal(false);
      setPostToDelete(null);

      // Si el post ya fue eliminado, recargamos para actualizar la vista
      if (error.response?.status === 410) {
        loadPosts();
      }
    }
  };

  const handleRepost = async (postId: string) => {
    try {
      const response = await postService.crearRepost(postId);
      const newRepost = response.data;

      // Si estamos en el perfil del usuario actual, agregar el nuevo repost al feed
      if (!userId || userId === user?._id) {
        setPosts([newRepost, ...posts]);
      }

      // Actualizar el contador en todos los posts (incluyendo el original y sus reposts)
      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          // Si es el post original que se reposteó
          if (post._id === postId) {
            return {
              ...post,
              usuario_hizo_repost: true,
              totalReposts: post.totalReposts + 1,
            };
          }
          // Si es un repost_post cuyo postOriginal es el que se reposteó
          if (
            post.tipo === "repost_post" &&
            post.postOriginal &&
            post.postOriginal._id === postId
          ) {
            return {
              ...post,
              postOriginal: {
                ...post.postOriginal,
                usuario_hizo_repost: true,
                totalReposts: post.postOriginal.totalReposts + 1,
              },
            };
          }
          return post;
        })
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al hacer repost";
      setMensajeError(errorMessage);

      // Si el post fue eliminado, recargamos el feed
      if (error.response?.status === 410) {
        loadPosts();
      }
    }
  };

  const handleUndoRepost = async (postId: string) => {
    try {
      await postService.eliminarRepost(postId);

      // Actualizar el contador en todos los posts
      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          // Si es el post original
          if (post._id === postId) {
            return {
              ...post,
              usuario_hizo_repost: false,
              totalReposts: Math.max(0, post.totalReposts - 1),
            };
          }
          // Si es un repost_post cuyo postOriginal es el que se deshizo el repost
          if (
            post.tipo === "repost_post" &&
            post.postOriginal &&
            post.postOriginal._id === postId
          ) {
            return {
              ...post,
              postOriginal: {
                ...post.postOriginal,
                usuario_hizo_repost: false,
                totalReposts: Math.max(0, post.postOriginal.totalReposts - 1),
              },
            };
          }
          return post;
        })
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al eliminar repost";
      setMensajeError(errorMessage);

      // Si el post fue eliminado, recargamos el feed
      if (error.response?.status === 410) {
        loadPosts();
      }
    }
  };

  const handleComment = (postId: string) => {
    // Buscar el post, puede ser un post directo o un postOriginal dentro de un repost
    let foundPost = posts.find((p) => p._id === postId);

    // Si no lo encontramos, buscar en los postOriginal de los repost_post
    if (!foundPost) {
      for (const post of posts) {
        if (
          post.tipo === "repost_post" &&
          post.postOriginal &&
          post.postOriginal._id === postId
        ) {
          foundPost = post.postOriginal;
          break;
        }
      }
    }

    if (foundPost) {
      setSelectedPostForComments(foundPost);
    }
  };

  const handleCommentAdded = async () => {
    // Incrementar el contador de comentarios
    if (selectedPostForComments) {
      // Actualizar el selectedPostForComments también
      setSelectedPostForComments({
        ...selectedPostForComments,
        totalComentarios: selectedPostForComments.totalComentarios + 1,
      });

      setPosts(
        posts.map((post) => {
          if (post._id === selectedPostForComments._id) {
            return {
              ...post,
              totalComentarios: post.totalComentarios + 1,
            };
          }
          // Si es un repost_post cuyo postOriginal es el comentado
          if (
            post.tipo === "repost_post" &&
            post.postOriginal &&
            post.postOriginal._id === selectedPostForComments._id
          ) {
            return {
              ...post,
              postOriginal: {
                ...post.postOriginal,
                totalComentarios: post.postOriginal.totalComentarios + 1,
              },
            };
          }
          return post;
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {mensajeError && (
        <Toast
          message={mensajeError}
          type="error"
          onClose={() => setMensajeError("")}
        />
      )}
      <div className="max-w-3xl mx-auto">
        {user && (!userId || userId === user._id) && (
          <div className="mb-6">
            <button
              onClick={() => {
                if ((user as any)?.suspendido) {
                  setShowSuspendedModal(true);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="w-full p-5 bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 backdrop-blur-sm hover:from-neutral-800/80 hover:to-neutral-800/40 border border-neutral-800 hover:border-orange-500/50 rounded-xl transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                  <img
                    src={user.avatarUrl || "/avatar.png"}
                    alt={user.nick}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-neutral-400 text-left flex-1">
                Comparte tu música...
              </span>
              <Plus size={22} className="text-orange-500" />
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Music size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay posts todavía</p>
            <p className="text-sm">
              {userId
                ? "Este usuario no ha publicado nada aún"
                : "Sigue a más usuarios para ver su contenido"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts
              .filter(
                (post) => post && post._id && post.usuario && post.usuario._id
              )
              .map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onRepost={handleRepost}
                  onUndoRepost={handleUndoRepost}
                  onComment={handleComment}
                />
              ))}
          </div>
        )}

        {showCreateModal && user && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreatePost}
            selectedSong={selectedSong}
            selectedAlbum={selectedAlbum}
            selectedPlaylist={selectedPlaylist}
            userAvatar={user.avatarUrl}
            userName={user.nombreArtistico || user.nick}
          />
        )}

        {selectedPostForComments && (
          <PostCommentsModal
            post={selectedPostForComments}
            onClose={() => setSelectedPostForComments(null)}
            onCommentAdded={handleCommentAdded}
          />
        )}

        {/* Modal de confirmar eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-2xl p-7 max-w-md w-full border-2 border-red-600/50 shadow-2xl shadow-red-600/20">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Trash2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Eliminar Post
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="mb-5 p-4 bg-red-900/20 border border-red-700/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">
                    ¿Estás seguro de que quieres eliminar este post? Se
                    eliminará permanentemente y no podrás recuperarlo.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-5 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30"
                >
                  Eliminar
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
                    No puedes crear posts mientras tu cuenta esté suspendida.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">
                      Razón de la suspensión:
                    </p>
                    <p className="text-yellow-400 font-medium">
                      {(user as any)?.razonSuspension ||
                        "Violación de normas comunitarias"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSuspendedModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
