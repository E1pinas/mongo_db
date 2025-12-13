import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Post } from "../../types";
import { postService } from "../../services/post.service";

interface CommentModalProps {
  postId: string;
  comentarioId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentModal({
  postId,
  comentarioId,
  isOpen,
  onClose,
}: CommentModalProps) {
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setPost(response.post);
    } catch (err: any) {
      console.error("Error cargando post:", err);
      if (err.response?.status === 404 || err.response?.status === 410) {
        setError("Este post ha sido eliminado");
      } else {
        setError("Error al cargar el comentario");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerPostCompleto = () => {
    onClose();
    // Aquí podrías navegar al perfil del autor del post o abrir el PostModal completo
    if (post?.usuario && typeof post.usuario === "object") {
      navigate(`/perfil/${post.usuario.nick}`);
    }
  };

  if (!isOpen) return null;

  // Encontrar el comentario específico
  const comentario = post?.comentarios?.find((c) => c._id === comentarioId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold">Nuevo Comentario</h2>
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
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 text-lg font-semibold mb-2">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          )}

          {!isLoading && !error && post && comentario && (
            <div className="space-y-6">
              {/* Referencia al post */}
              <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                <p className="text-xs text-neutral-400 mb-1">
                  Comentario en tu post:
                </p>
                <p className="text-sm text-neutral-200 font-medium line-clamp-2">
                  "{post.contenido || "Post"}"
                </p>
              </div>

              {/* El comentario específico con diseño destacado */}
              <div className="bg-linear-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 border-2 border-orange-500/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  {/* Avatar del usuario que comentó */}
                  <img
                    src={
                      typeof comentario.usuario === "object" &&
                      comentario.usuario?.avatarUrl
                        ? comentario.usuario.avatarUrl
                        : "/avatar.png"
                    }
                    alt={
                      typeof comentario.usuario === "object"
                        ? comentario.usuario?.nombreArtistico ||
                          comentario.usuario?.nick ||
                          "Usuario"
                        : "Usuario"
                    }
                    className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-orange-500/50"
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.png";
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Nombre del artista */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-lg">
                        {typeof comentario.usuario === "object"
                          ? comentario.usuario?.nombreArtistico ||
                            comentario.usuario?.nick ||
                            "Usuario"
                          : "Usuario"}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-orange-500 rounded-full font-semibold">
                        Nuevo
                      </span>
                    </div>

                    {/* Nick si es diferente del nombre artístico */}
                    {typeof comentario.usuario === "object" &&
                      comentario.usuario?.nombreArtistico &&
                      comentario.usuario?.nick &&
                      comentario.usuario.nombreArtistico !==
                        comentario.usuario.nick && (
                        <p className="text-sm text-neutral-400 mb-2">
                          @{comentario.usuario.nick}
                        </p>
                      )}

                    {/* Contenido del comentario */}
                    <p className="text-neutral-100 text-base leading-relaxed wrap-break-word">
                      {comentario.contenido}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón para ver el post completo */}
              <button
                onClick={handleVerPostCompleto}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl transition-all font-semibold shadow-lg hover:shadow-orange-500/30"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Post Completo
              </button>

              {/* Botón cerrar secundario */}
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-all font-semibold"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
