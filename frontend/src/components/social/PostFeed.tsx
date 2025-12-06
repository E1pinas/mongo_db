import { useState, useEffect } from "react";
import { Plus, Loader2, Music } from "lucide-react";
import { useAuth } from "../../contexts";
import { postService } from "../../services/post.service";
import type { Post, Cancion, Album, Playlist } from "../../types";
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
      const newPost = await postService.crearPost(data);
      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
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
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este post?")) {
      return;
    }

    try {
      await postService.eliminarPost(postId);
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error al eliminar post:", error);
      alert("Error al eliminar el post");
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
      alert(error.response?.data?.message || "Error al hacer repost");
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
      alert(error.response?.data?.message || "Error al eliminar repost");
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

  const handleCommentAdded = () => {
    // Incrementar el contador de comentarios
    if (selectedPostForComments) {
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
    <div className="max-w-3xl mx-auto">
      {user && (!userId || userId === user._id) && (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
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
          {posts.map((post) => (
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
    </div>
  );
}
