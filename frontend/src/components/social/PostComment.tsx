import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import type { PostComentario } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PostCommentProps {
  comentario: PostComentario;
  postId: string;
  isHighlighted?: boolean;
  onLike?: (comentarioId: string) => void;
  onReply?: (comentarioId: string, contenido: string) => void;
}

export default function PostComment({
  comentario,
  postId,
  isHighlighted = false,
  onLike,
  onReply,
}: PostCommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const handleReplySubmit = () => {
    if (replyText.trim() && onReply && comentario._id) {
      onReply(comentario._id, replyText.trim());
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  const usuario =
    typeof comentario.usuario === "object" ? comentario.usuario : null;

  return (
    <div
      className={`rounded-xl transition-all ${
        isHighlighted
          ? "bg-linear-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 border-2 border-orange-500/50 shadow-lg p-4"
          : "bg-neutral-800/50 hover:bg-neutral-800 p-4"
      }`}
    >
      {/* Comentario principal */}
      <div className="flex items-start gap-3">
        <img
          src={usuario?.avatarUrl || "/avatar.png"}
          alt={usuario?.nick || "Usuario"}
          className="w-10 h-10 rounded-full object-cover shrink-0"
          onError={(e) => {
            e.currentTarget.src = "/avatar.png";
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white text-sm">
              {usuario?.nombreArtistico || usuario?.nick || "Usuario"}
            </span>
            {isHighlighted && (
              <span className="text-xs px-2 py-0.5 bg-orange-500 rounded-full font-semibold">
                Nuevo
              </span>
            )}
            <span className="text-xs text-neutral-500">
              {formatDistanceToNow(new Date(comentario.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>

          <p className="text-neutral-300 text-sm wrap-break-word mb-2">
            {comentario.contenido}
          </p>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike && comentario._id && onLike(comentario._id)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{comentario.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Responder</span>
            </button>

            {comentario.respuestas && comentario.respuestas.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                {showReplies ? "Ocultar" : "Ver"} {comentario.respuestas.length}{" "}
                {comentario.respuestas.length === 1
                  ? "respuesta"
                  : "respuestas"}
              </button>
            )}
          </div>

          {/* Input para responder */}
          {showReplyInput && (
            <div className="mt-3 flex items-start gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={2}
                maxLength={300}
              />
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim()}
                className="p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Respuestas anidadas */}
          {showReplies &&
            comentario.respuestas &&
            comentario.respuestas.length > 0 && (
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-neutral-700">
                {comentario.respuestas.map((respuesta, idx) => {
                  const respuestaUsuario =
                    typeof respuesta.usuario === "object"
                      ? respuesta.usuario
                      : null;
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <img
                        src={respuestaUsuario?.avatarUrl || "/avatar.png"}
                        alt={respuestaUsuario?.nick || "Usuario"}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "/avatar.png";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-xs">
                            {respuestaUsuario?.nombreArtistico ||
                              respuestaUsuario?.nick ||
                              "Usuario"}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatDistanceToNow(
                              new Date(respuesta.createdAt),
                              {
                                addSuffix: true,
                                locale: es,
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-neutral-300 text-xs wrap-break-word">
                          {respuesta.contenido}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
