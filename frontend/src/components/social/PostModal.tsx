import { useEffect, useState } from "react";
import { X } from "lucide-react";
import PostCard from "./PostCard";
import PostComment from "./PostComment";
import type { Post } from "../../types";
import { postService } from "../../services/post.service";

interface PostModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  highlightCommentId?: string; // ID del comentario a destacar
  autoOpenComments?: boolean; // Abrir automáticamente la sección de comentarios
}

export default function PostModal({
  postId,
  isOpen,
  onClose,
  highlightCommentId,
  autoOpenComments = false,
}: PostModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(autoOpenComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(!highlightCommentId); // Si hay comentario específico, no mostrar todos

  useEffect(() => {
    if (isOpen && postId) {
      loadPost();
      // Auto-abrir comentarios si se especifica
      if (autoOpenComments) {
        setShowComments(true);
      }
    }
  }, [isOpen, postId, autoOpenComments]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postService.obtenerPostPorId(postId);

      // El servicio devuelve { success, post }
      const fetched = response.post;

      console.log("📌 Post cargado en modal:", fetched);
      console.log("📌 usuario_dio_like:", fetched?.usuario_dio_like);
      console.log("📌 totalLikes:", fetched?.totalLikes);

      // Validar que el post tenga los campos mínimos necesarios
      if (
        !fetched ||
        !fetched._id ||
        !fetched.usuario ||
        !fetched.usuario._id
      ) {
        throw new Error(
          "Post inválido: faltan campos requeridos (usuario o usuario._id)"
        );
      }

      const postData: Post = {
        ...fetched,
        usuario_dio_like: fetched?.usuario_dio_like === true,
        usuario_hizo_repost: fetched?.usuario_hizo_repost === true,
        totalLikes: fetched?.totalLikes ?? 0,
        totalComentarios: fetched?.totalComentarios ?? 0,
        totalReposts: fetched?.totalReposts ?? 0,
      } as Post;

      console.log("📌 Post procesado:", postData);
      setPost(postData);
    } catch (err: any) {
      console.error("Error cargando post:", err);

      // Si el post fue eliminado o no existe (404 o 410)
      if (err.response?.status === 404 || err.response?.status === 410) {
        setError("Este post ha sido eliminado");
      } else {
        setError(err.message || "Error al cargar el post");
      }
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
    } catch (err: any) {
      console.error("❌ Error al dar like:", err);
      // Revertir en caso de error
      setPost({
        ...post,
        ...previousState,
      });

      // Si el post fue eliminado, cerrar modal
      if (err.response?.status === 410) {
        alert("Este post ha sido eliminado");
        onClose();
      }
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
    } catch (err: any) {
      console.error("❌ Error al manejar repost:", err);
      setPost({
        ...post,
        ...previousState,
      });

      // Si el post fue eliminado, cerrar modal
      if (err.response?.status === 410) {
        alert("Este post ha sido eliminado");
        onClose();
      }
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

  const handleLikeComment = async (comentarioId: string) => {
    if (!post) return;
    try {
      await postService.toggleLikeComentario(post._id, comentarioId);
      loadPost(); // Recargar para actualizar likes
    } catch (error) {
      console.error("Error al dar like al comentario:", error);
    }
  };

  const handleReplyComment = async (
    comentarioId: string,
    contenido: string
  ) => {
    if (!post) return;
    try {
      await postService.responderComentario(post._id, comentarioId, contenido);
      loadPost(); // Recargar para actualizar respuestas
    } catch (error) {
      console.error("Error al responder comentario:", error);
    }
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
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-400 text-lg font-semibold mb-2">
                  {error}
                </p>
                {error.includes("eliminado") && (
                  <p className="text-neutral-400 text-sm">
                    Este contenido ya no está disponible
                  </p>
                )}
              </div>
              {!error.includes("eliminado") ? (
                <button
                  onClick={loadPost}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors font-semibold"
                >
                  Reintentar
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-colors font-semibold"
                >
                  Cerrar
                </button>
              )}
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
                  <h3 className="text-lg font-semibold mb-4">
                    Comentarios ({post.comentarios?.length || 0})
                  </h3>

                  {/* Mostrar comentarios existentes */}
                  {post.comentarios && post.comentarios.length > 0 && (
                    <>
                      <div className="mb-6 space-y-4">
                        {post.comentarios
                          .filter((comentario) => {
                            // Si hay comentario destacado y no se muestran todos, solo mostrar ese
                            if (highlightCommentId && !showAllComments) {
                              return comentario._id === highlightCommentId;
                            }
                            // Sino, mostrar todos
                            return true;
                          })
                          .map((comentario) => {
                            const isHighlighted =
                              highlightCommentId &&
                              comentario._id === highlightCommentId;
                            return (
                              <PostComment
                                key={comentario._id}
                                comentario={comentario}
                                postId={post._id}
                                isHighlighted={isHighlighted}
                                onLike={handleLikeComment}
                                onReply={handleReplyComment}
                              />
                            );
                          })}
                      </div>

                      {/* Botón para ver todos los comentarios si solo se muestra uno específico */}
                      {highlightCommentId &&
                        !showAllComments &&
                        post.comentarios.length > 1 && (
                          <button
                            onClick={() => setShowAllComments(true)}
                            className="w-full mb-6 px-4 py-3 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 rounded-xl transition-all text-sm font-semibold text-neutral-300 hover:text-white"
                          >
                            Ver todos los comentarios (
                            {post.comentarios.length - 1} más)
                          </button>
                        )}
                    </>
                  )}

                  {/* Input para nuevo comentario */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-neutral-400">
                      Escribe tu comentario
                    </h4>
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
