import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Heart,
  Send,
  MoreVertical,
  Trash2,
  Edit,
  Link as LinkIcon,
  MessageCircle,
  Ban,
} from "lucide-react";
import {
  commentService,
  type Comentario,
} from "../../services/comment.service";
import { useAuth } from "../../contexts";
import type { Cancion } from "../../types";
import { formatTimeAgo } from "../../utils/dateFormat";

// Función auxiliar para aplanar comentarios recursivos
function aplanarComentarios(
  comentarios: Comentario[],
  padreNick?: string
): Array<Comentario & { respondioA?: string }> {
  const resultado: Array<Comentario & { respondioA?: string }> = [];

  comentarios.forEach((comentario) => {
    resultado.push({
      ...comentario,
      respondioA: padreNick,
    });

    if (comentario.respuestas && comentario.respuestas.length > 0) {
      const nombreParaMostrar =
        comentario.autor.nombreArtistico || comentario.autor.nick;
      const respuestasAplanadas = aplanarComentarios(
        comentario.respuestas,
        nombreParaMostrar
      );
      resultado.push(...respuestasAplanadas);
    }
  });

  return resultado;
}

// Componente para mostrar un comentario principal con sus respuestas
interface CommentGroupProps {
  comentario: Comentario;
  user: any;
  enviando: boolean;
  artistasCancion: any[];
  onToggleLike: (id: string) => void;
  onResponder: (id: string, texto: string, nickAutor: string) => void;
  onEditar: (id: string, texto: string) => void;
  onEliminar: (id: string) => void;
}

function CommentGroup({
  comentario,
  user,
  enviando,
  artistasCancion,
  onToggleLike,
  onResponder,
  onEditar,
  onEliminar,
}: CommentGroupProps) {
  const [mostrarTodasRespuestas, setMostrarTodasRespuestas] = useState(false);
  const LIMITE_RESPUESTAS = 2;

  const respuestas = comentario.respuestas || [];
  const totalRespuestas = respuestas.length;
  const respuestasAMostrar = mostrarTodasRespuestas
    ? respuestas
    : respuestas.slice(0, LIMITE_RESPUESTAS);
  const respuestasOcultas = totalRespuestas - LIMITE_RESPUESTAS;

  return (
    <div className="space-y-3">
      {/* Comentario principal */}
      <CommentItem
        comentario={comentario}
        user={user}
        enviando={enviando}
        artistasCancion={artistasCancion}
        onToggleLike={onToggleLike}
        onResponder={onResponder}
        onEditar={onEditar}
        onEliminar={onEliminar}
      />

      {/* Respuestas */}
      {respuestasAMostrar.map((respuesta) => (
        <CommentItem
          key={respuesta._id}
          comentario={{
            ...respuesta,
            respondioA: respuesta.comentarioPadre?.autor
              ? typeof respuesta.comentarioPadre.autor === "string"
                ? respuesta.comentarioPadre.autor
                : respuesta.comentarioPadre.autor.nombreArtistico ||
                  respuesta.comentarioPadre.autor.nick
              : undefined,
          }}
          user={user}
          enviando={enviando}
          artistasCancion={artistasCancion}
          onToggleLike={onToggleLike}
          onResponder={onResponder}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}

      {/* Botón "Mostrar más respuestas" - Solo si hay MÁS de 4 */}
      {totalRespuestas > LIMITE_RESPUESTAS && !mostrarTodasRespuestas && (
        <button
          onClick={() => setMostrarTodasRespuestas(true)}
          className="ml-14 text-sm text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/20"
        >
          <div className="h-px bg-blue-500/40 w-6"></div>
          <span className="font-medium">
            Ver {respuestasOcultas} respuesta{respuestasOcultas > 1 ? "s" : ""}{" "}
            más
          </span>
        </button>
      )}

      {/* Botón "Mostrar menos" */}
      {mostrarTodasRespuestas && totalRespuestas > LIMITE_RESPUESTAS && (
        <button
          onClick={() => setMostrarTodasRespuestas(false)}
          className="ml-14 text-sm text-purple-400 hover:text-purple-300 transition-all flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-500/20"
        >
          <div className="h-px bg-purple-500/40 w-6"></div>
          <span className="font-medium">Mostrar menos</span>
        </button>
      )}
    </div>
  );
}

// Componente para mostrar un solo comentario
interface CommentItemProps {
  comentario: Comentario & { respondioA?: string };
  user: any;
  enviando: boolean;
  artistasCancion: any[];
  onToggleLike: (id: string) => void;
  onResponder: (id: string, texto: string, nickAutor: string) => void;
  onEditar: (id: string, texto: string) => void;
  onEliminar: (id: string) => void;
}

function CommentItem({
  comentario,
  user,
  enviando,
  artistasCancion,
  onToggleLike,
  onResponder,
  onEditar,
  onEliminar,
}: CommentItemProps) {
  const [respuestaA, setRespuestaA] = useState(false);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [editandoId, setEditandoId] = useState(false);
  const [textoEdicion, setTextoEdicion] = useState(comentario.texto);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleResponder = () => {
    if (!textoRespuesta.trim()) return;
    const nombreParaMostrar =
      comentario.autor.nombreArtistico || comentario.autor.nick;
    onResponder(comentario._id, textoRespuesta, nombreParaMostrar);
    setTextoRespuesta("");
    setRespuestaA(false);
  };

  const handleEditar = () => {
    if (!textoEdicion.trim()) return;
    onEditar(comentario._id, textoEdicion);
    setEditandoId(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        {/* Espacio invisible si es una respuesta */}
        {comentario.respondioA && <div className="w-10 shrink-0"></div>}

        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/50 to-blue-500/50 rounded-full blur-sm opacity-30"></div>
          <img
            src={comentario.autor.avatarUrl || "/avatar.png"}
            alt={comentario.autor.nick}
            className="relative w-10 h-10 rounded-full object-cover shrink-0 border-2 border-purple-500/20"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-xl p-3 border border-neutral-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">
                    {comentario.autor.nombreArtistico || comentario.autor.nick}
                  </p>
                  {artistasCancion.some((a: any) => {
                    const artistaId = typeof a === "string" ? a : a._id;
                    return artistaId === comentario.autor._id;
                  }) && (
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-0.5 rounded-full font-semibold shadow-lg">
                      ♫ Artista
                    </span>
                  )}
                  {comentario.respondioA && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <span>→</span>
                      <span className="font-medium">
                        {comentario.respondioA}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              {user?._id === comentario.autor._id && (
                <div className="relative">
                  <button
                    onClick={() => setMenuAbierto(!menuAbierto)}
                    className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} className="text-purple-400" />
                  </button>
                  {menuAbierto && (
                    <div className="absolute right-0 mt-1 bg-neutral-800 border border-purple-500/20 rounded-xl shadow-xl py-1 z-10 min-w-[120px] backdrop-blur-sm">
                      <button
                        onClick={() => {
                          setEditandoId(true);
                          setMenuAbierto(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-blue-500/10 flex items-center gap-2 text-blue-300 transition-colors"
                      >
                        <Edit size={14} className="text-blue-400" />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          onEliminar(comentario._id);
                          setMenuAbierto(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 flex items-center gap-2 text-red-300 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {editandoId ? (
              <div className="space-y-2">
                <textarea
                  value={textoEdicion}
                  onChange={(e) => setTextoEdicion(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-purple-500/20 rounded-xl p-3 text-sm resize-none focus:border-purple-500/40 focus:outline-none transition-colors"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditar}
                    className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-sm font-medium shadow-lg transition-all"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditandoId(false);
                      setTextoEdicion(comentario.texto);
                    }}
                    className="px-4 py-1.5 bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600 rounded-lg text-sm transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-100">
                {comentario.texto}
                {comentario.estaEditado && (
                  <span className="text-xs text-purple-400/60 ml-2 italic">
                    • editado
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <button
              onClick={() => onToggleLike(comentario._id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                comentario.likes.includes(user?._id || "")
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                  : "bg-neutral-700/30 text-neutral-400 hover:bg-pink-500/10 hover:text-pink-400 border border-neutral-600/30"
              }`}
            >
              <Heart
                size={14}
                fill={
                  comentario.likes.includes(user?._id || "")
                    ? "currentColor"
                    : "none"
                }
              />
              <span className="font-medium">{comentario.likes.length}</span>
            </button>
            <button
              onClick={() => setRespuestaA(!respuestaA)}
              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-all border border-blue-500/20 hover:border-blue-500/30 font-medium"
            >
              Responder
            </button>
            <span className="text-neutral-500 ml-auto">
              {formatTimeAgo(comentario.createdAt)}
            </span>
          </div>

          {/* Indicador de like del artista */}
          {(() => {
            const artistaQueDioLike = artistasCancion.find((a: any) => {
              const artistaId = typeof a === "string" ? a : a._id;
              return comentario.likes.includes(artistaId);
            });

            if (!artistaQueDioLike || typeof artistaQueDioLike === "string")
              return null;

            return (
              <div className="mt-2 flex items-center gap-2 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full px-3 py-1.5 w-fit">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-sm"></div>
                  <img
                    src={artistaQueDioLike.avatarUrl || "/avatar.png"}
                    alt=""
                    className="relative w-4 h-4 rounded-full object-cover"
                  />
                </div>
                <span className="text-purple-300 font-medium">
                  ♥ Le gustó al creador
                </span>
              </div>
            );
          })()}

          {/* Form responder */}
          {respuestaA && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleResponder()}
                placeholder={`Responder a @${
                  comentario.autor.nombreArtistico || comentario.autor.nick
                }...`}
                className="flex-1 bg-neutral-900/50 border border-blue-500/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/40 transition-colors placeholder:text-neutral-500"
              />
              <button
                onClick={handleResponder}
                disabled={!textoRespuesta.trim() || enviando}
                className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg disabled:shadow-none"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SongCommentsModalProps {
  song: Cancion;
  onClose: () => void;
}

export default function SongCommentsModal({
  song,
  onClose,
}: SongCommentsModalProps) {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [tieneMas, setTieneMas] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComentarios();
  }, [song._id]);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  useEffect(() => {
    if (mensajeError) {
      const timer = setTimeout(() => setMensajeError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensajeError]);

  const loadComentarios = async (paginaActual = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const response = await commentService.getCancionComments(
        song._id,
        paginaActual,
        10
      );

      if (append) {
        setComentarios((prev) => [...prev, ...response.comentarios]);
      } else {
        setComentarios(response.comentarios);
      }

      setTieneMas(
        response.paginacion.pagina < response.paginacion.totalPaginas
      );
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
      setCargandoMas(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || cargandoMas || !tieneMas) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    if (scrollHeight - scrollTop - clientHeight < 200) {
      setCargandoMas(true);
      const nuevaPagina = pagina + 1;
      setPagina(nuevaPagina);
      loadComentarios(nuevaPagina, true);
    }
  }, [cargandoMas, tieneMas, pagina]);

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() || enviando) return;

    // Verificar si el usuario está suspendido
    if (user && (user as any).suspendido) {
      setShowSuspendedModal(true);
      return;
    }

    try {
      setEnviando(true);
      const comentario = await commentService.createCancionComment(
        song._id,
        nuevoComentario
      );
      setComentarios([comentario, ...comentarios]);
      setNuevoComentario("");
    } catch (error: any) {
      console.error("Error creating comment:", error);
      setMensajeError(
        `Error al crear comentario: ${
          error.response?.data?.mensaje || error.message
        }`
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleResponder = async (
    comentarioId: string,
    texto: string,
    nickAutor: string
  ) => {
    try {
      setEnviando(true);
      await commentService.replyToComment(comentarioId, texto);
      // Recargar comentarios desde el principio para ver la nueva respuesta
      setPagina(1);
      await loadComentarios(1, false);
    } catch (error) {
      console.error("Error replying:", error);
    } finally {
      setEnviando(false);
    }
  };

  const handleToggleLike = async (comentarioId: string) => {
    try {
      await commentService.toggleLike(comentarioId);
      // Recargar comentarios manteniendo la página actual
      await loadComentarios(1, false);
      setPagina(1);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleEditar = async (comentarioId: string, nuevoTexto: string) => {
    try {
      await commentService.editComment(comentarioId, nuevoTexto);
      // Recargar comentarios para ver el texto actualizado
      loadComentarios(pagina, false);
    } catch (error) {
      console.error("Error editing:", error);
    }
  };

  const handleEliminar = async (comentarioId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?"))
      return;

    try {
      await commentService.deleteComment(comentarioId);
      // Recargar comentarios
      loadComentarios(pagina, false);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const contarTotalLikes = () => {
    const contarLikes = (comentario: Comentario): number => {
      let total = comentario.likes?.length || 0;
      comentario.respuestas?.forEach((resp) => {
        total += resp.likes?.length || 0;
      });
      return total;
    };
    return comentarios.reduce((total, c) => total + contarLikes(c), 0);
  };

  const contarTotalComentarios = () => {
    const contar = (comentario: Comentario): number => {
      let total = 1;
      if (comentario.respuestas) {
        comentario.respuestas.forEach((resp) => {
          total += contar(resp);
        });
      }
      return total;
    };
    return comentarios.reduce((total, c) => total + contar(c), 0);
  };

  const copiarURL = () => {
    const url = `${window.location.origin}/cancion/${song._id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setMensajeExito("URL copiada al portapapeles");
      })
      .catch((err) => {
        console.error("Error al copiar URL:", err);
        setMensajeError("Error al copiar la URL");
      });
  };

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-black/95 via-purple-950/20 to-black/95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-purple-500/20 shadow-2xl shadow-purple-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition"></div>
              <img
                src={song.portadaUrl || "/cover.jpg"}
                alt={song.titulo}
                className="relative w-32 h-32 rounded-xl object-cover shadow-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {song.titulo}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copiarURL}
                    className="p-2 hover:bg-purple-500/20 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-purple-500/30"
                    title="Copiar URL"
                  >
                    <LinkIcon size={20} className="text-purple-400" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-red-500/30"
                  >
                    <X size={20} className="text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-lg text-neutral-400 mb-3">
                {Array.isArray(song.artistas)
                  ? song.artistas
                      .map((a: any) =>
                        typeof a === "string"
                          ? a
                          : a.nombreArtistico || a.nick || a.nombre
                      )
                      .join(", ")
                  : "Artista desconocido"}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <MessageCircle size={16} className="text-blue-400" />
                  <span className="text-blue-300">
                    {contarTotalComentarios()}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 rounded-full border border-pink-500/20">
                  <Heart size={16} className="text-pink-400" />
                  <span className="text-pink-300">
                    {song.likes?.length || 0}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent"
        >
          {loading ? (
            <div className="text-center text-neutral-400 py-8">Cargando...</div>
          ) : comentarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 mb-4">
                <MessageCircle size={48} className="text-purple-400" />
              </div>
              <p className="text-neutral-300 text-lg">
                Sé el primero en comentar
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                Comparte tu opinión sobre esta canción
              </p>
            </div>
          ) : (
            comentarios.map((comentario) => (
              <CommentGroup
                key={comentario._id}
                comentario={comentario}
                user={user}
                enviando={enviando}
                artistasCancion={song.artistas}
                onToggleLike={handleToggleLike}
                onResponder={handleResponder}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
              />
            ))
          )}

          {/* Indicador de carga al hacer scroll */}
          {cargandoMas && (
            <div className="text-center py-4">
              <div className="inline-block w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Input nuevo comentario */}
        <div className="p-4 border-t border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5">
          <div className="flex gap-3">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/50 to-blue-500/50 rounded-full blur-sm opacity-40"></div>
              <img
                src={user?.avatarUrl || "/avatar.png"}
                alt={user?.nick || "User"}
                className="relative w-10 h-10 rounded-full object-cover shrink-0 border-2 border-purple-500/20"
              />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleEnviarComentario()
                }
                placeholder="Escribe un comentario..."
                className="flex-1 bg-neutral-900/50 border border-purple-500/20 rounded-xl px-5 py-2.5 outline-none focus:border-purple-500/40 transition-colors placeholder:text-neutral-500"
              />
              <button
                onClick={handleEnviarComentario}
                disabled={!nuevoComentario.trim() || enviando}
                className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-neutral-700 disabled:to-neutral-700 rounded-xl transition-all shadow-lg"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  No puedes comentar en canciones mientras tu cuenta esté
                  suspendida.
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

      {/* Toast de éxito */}
      {mensajeExito && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {mensajeExito}
        </div>
      )}

      {/* Toast de error */}
      {mensajeError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {mensajeError}
        </div>
      )}
    </div>
  );
}
