import { useState, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts";
import type { Post, PostComentario } from "../../types";
import { formatTimeAgo } from "../../utils/dateFormat";
import { postService } from "../../services/post.service";

interface PostCommentsModalProps {
  post: Post;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export default function PostCommentsModal({
  post,
  onClose,
  onCommentAdded,
}: PostCommentsModalProps) {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState<PostComentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComentarios();
  }, [post._id]);

  const loadComentarios = async () => {
    try {
      setLoading(true);
      const data = await postService.obtenerComentarios(post._id);
      setComentarios(data);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevoComentario.trim()) return;

    try {
      setSubmitting(true);
      const newComment = await postService.agregarComentario(
        post._id,
        nuevoComentario.trim()
      );

      setComentarios([...comentarios, newComment]);
      setNuevoComentario("");
      onCommentAdded?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al agregar comentario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl max-w-2xl w-full border-2 border-orange-500/30 shadow-2xl shadow-orange-500/10 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-neutral-800/50 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            Comentarios
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Post info */}
        <div className="px-6 py-4 border-b border-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                <img
                  src={post.usuario.avatarUrl || "/avatar.png"}
                  alt={post.usuario.nick}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-orange-400 truncate">
                {post.usuario.nombreArtistico || post.usuario.nombre}
              </p>
              <p className="text-sm text-neutral-400 truncate">
                @{post.usuario.nick}
              </p>
            </div>
          </div>
          {post.contenido && (
            <p className="mt-3 text-neutral-200 leading-relaxed">
              {post.contenido}
            </p>
          )}
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : comentarios.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-lg font-medium mb-2">
                No hay comentarios todavía
              </p>
              <p className="text-sm">Sé el primero en comentar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comentarios.map((comentario) => (
                <div
                  key={comentario._id}
                  className="flex gap-3 p-3 rounded-lg hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                      <img
                        src={
                          typeof comentario.usuario === "object"
                            ? comentario.usuario.avatarUrl || "/avatar.png"
                            : "/avatar.png"
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-orange-400">
                        {typeof comentario.usuario === "object"
                          ? comentario.usuario.nombreArtistico ||
                            comentario.usuario.nick
                          : "Usuario"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatTimeAgo(comentario.createdAt)}
                      </span>
                    </div>
                    <p className="text-neutral-200 text-sm leading-relaxed break-words">
                      {comentario.contenido}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        {user && (
          <form
            onSubmit={handleSubmit}
            className="border-t border-neutral-800/50 p-6 bg-neutral-900/50"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                  <img
                    src={user.avatarUrl || "/avatar.png"}
                    alt={user.nick}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 bg-neutral-800/50 border-2 border-neutral-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-neutral-500 transition-all"
                  maxLength={300}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!nuevoComentario.trim() || submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
