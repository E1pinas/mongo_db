import { useEffect, useState } from "react";
import { X } from "lucide-react";
import PostCard from "./PostCard";
import type { Post } from "../../types";
import { postService } from "../../services/post.service";

interface PostModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ postId, isOpen, onClose }: PostModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadPost();
    }
  }, [isOpen, postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postService.obtenerPostPorId(postId);
      console.log("📌 Post cargado en modal:", response.data);
      console.log("📌 usuario_dio_like:", response.data.usuario_dio_like);
      console.log("📌 totalLikes:", response.data.totalLikes);

      // Asegurar que usuario_dio_like siempre tenga un valor booleano
      const postData = {
        ...response.data,
        usuario_dio_like: response.data.usuario_dio_like === true,
        usuario_hizo_repost: response.data.usuario_hizo_repost === true,
      };

      console.log("📌 Post procesado:", postData);
      setPost(postData);
    } catch (err: any) {
      console.error("Error cargando post:", err);
      setError(err.message || "Error al cargar el post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!post) return;

    console.log("🔥 handleLike llamado en PostModal con postId:", postId);
    console.log("🔥 Estado actual usuario_dio_like:", post.usuario_dio_like);
    console.log("🔥 Tipo de usuario_dio_like:", typeof post.usuario_dio_like);
    console.log("🔥 Post completo:", post);

    // Guardar estado anterior para revertir si falla
    const currentLikeState = post.usuario_dio_like === true;
    const previousState = {
      usuario_dio_like: currentLikeState,
      totalLikes: post.totalLikes,
    };

    try {
      // Actualización optimista
      const newLikeState = !currentLikeState;
      console.log("🔥 Cambio de estado:", currentLikeState, "→", newLikeState);

      const newPost = {
        ...post,
        usuario_dio_like: newLikeState,
        totalLikes: newLikeState
          ? post.totalLikes + 1
          : Math.max(post.totalLikes - 1, 0),
      };

      console.log("🔥 Nuevo post:", {
        usuario_dio_like: newPost.usuario_dio_like,
        totalLikes: newPost.totalLikes,
      });

      setPost(newPost);

      console.log("🔥 Llamando a postService.toggleLike con:", postId);
      // Llamada al backend
      const response = await postService.toggleLike(postId);
      console.log("✅ Respuesta del backend:", response);
    } catch (err) {
      console.error("❌ Error al dar like:", err);
      // Revertir en caso de error
      setPost({
        ...post,
        ...previousState,
      });
    }
  };

  const handleRepost = async (postId: string) => {
    if (!post) return;

    console.log("🔄 handleRepost llamado con postId:", postId);
    console.log(
      "🔄 Estado actual usuario_hizo_repost:",
      post.usuario_hizo_repost
    );

    const currentRepostState = post.usuario_hizo_repost === true;
    const previousState = {
      usuario_hizo_repost: currentRepostState,
      totalReposts: post.totalReposts,
    };

    try {
      // Actualización optimista
      const newRepostState = !currentRepostState;
      console.log(
        "🔄 Cambio de estado repost:",
        currentRepostState,
        "→",
        newRepostState
      );

      setPost({
        ...post,
        usuario_hizo_repost: newRepostState,
        totalReposts: newRepostState
          ? post.totalReposts + 1
          : Math.max(post.totalReposts - 1, 0),
      });

      // Si ya hizo repost, deshacer. Si no, crear repost
      if (currentRepostState) {
        console.log("🔄 Deshaciendo repost...");
        await postService.eliminarRepost(postId);
        console.log("✅ Repost eliminado");
      } else {
        console.log("🔄 Creando repost...");
        await postService.crearRepost(postId);
        console.log("✅ Repost creado");
      }
    } catch (err) {
      console.error("❌ Error al manejar repost:", err);
      setPost({
        ...post,
        ...previousState,
      });
    }
  };

  const handleUndoRepost = async (postId: string) => {
    // Ahora usamos handleRepost para ambos casos
    await handleRepost(postId);
  };

  const handleComment = (postId: string) => {
    console.log("💬 Abrir sección de comentarios para post:", postId);
    setShowComments(true);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post) return;

    try {
      setIsSubmittingComment(true);
      await postService.agregarComentario(post._id, newComment);

      // Actualizar el contador de comentarios
      setPost({
        ...post,
        totalComentarios: post.totalComentarios + 1,
      });

      // Limpiar el input
      setNewComment("");

      console.log("✅ Comentario creado exitosamente");
    } catch (err) {
      console.error("❌ Error al crear comentario:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={loadPost}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !error && post && (
            <>
              <PostCard
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
                onUndoRepost={handleUndoRepost}
                onComment={handleComment}
              />

              {/* Sección de comentarios */}
              {showComments && (
                <div className="mt-6 border-t border-neutral-800 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Comentarios</h3>

                  {/* Input para nuevo comentario */}
                  <div className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      rows={3}
                      disabled={isSubmittingComment}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
                      >
                        {isSubmittingComment ? "Enviando..." : "Comentar"}
                      </button>
                    </div>
                  </div>

                  {/* Aquí se mostrarían los comentarios existentes */}
                  <div className="text-neutral-500 text-sm text-center py-4">
                    Los comentarios aparecerán aquí
                  </div>
                </div>
              )}
            </>
          )}

          {!isLoading && !error && !post && (
            <div className="text-center py-12 text-neutral-500">
              Post no encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
