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
          className="ml-14 text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <div className="h-px bg-neutral-700 w-8"></div>
          Mostrar {respuestasOcultas} respuesta
          {respuestasOcultas > 1 ? "s" : ""} más
        </button>
      )}

      {/* Botón "Mostrar menos" */}
      {mostrarTodasRespuestas && totalRespuestas > LIMITE_RESPUESTAS && (
        <button
          onClick={() => setMostrarTodasRespuestas(false)}
          className="ml-14 text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <div className="h-px bg-neutral-700 w-8"></div>
          Mostrar menos respuestas
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

        <img
          src={comentario.autor.avatarUrl || "/avatar.png"}
          alt={comentario.autor.nick}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-neutral-800 rounded-lg p-3">
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
                    <span className="text-xs bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded">
                      Artista
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
                    className="p-1 hover:bg-neutral-700 rounded"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuAbierto && (
                    <div className="absolute right-0 mt-1 bg-neutral-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setEditandoId(true);
                          setMenuAbierto(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-600 flex items-center gap-2"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          onEliminar(comentario._id);
                          setMenuAbierto(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-600 flex items-center gap-2 text-red-400"
                      >
                        <Trash2 size={14} />
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
                  className="w-full bg-neutral-700 rounded p-2 text-sm resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditar}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditandoId(false);
                      setTextoEdicion(comentario.texto);
                    }}
                    className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm">
                {comentario.texto}
                {comentario.estaEditado && (
                  <span className="text-xs text-neutral-500 ml-2">
                    (editado)
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
            <button
              onClick={() => onToggleLike(comentario._id)}
              className={`flex items-center gap-1 hover:text-red-400 transition-colors ${
                comentario.likes.includes(user?._id || "") ? "text-red-400" : ""
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
              {comentario.likes.length}
            </button>
            <button
              onClick={() => setRespuestaA(!respuestaA)}
              className="hover:text-white transition-colors"
            >
              Responder
            </button>
            <span>{formatTimeAgo(comentario.createdAt)}</span>
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
              <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400">
                <img
                  src={artistaQueDioLike.avatarUrl || "/avatar.png"}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>Le gustó al creador</span>
              </div>
            );
          })()}

          {/* Form responder */}
          {respuestaA && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={textoRespuesta}
                onChange={(e) => setTextoRespuesta(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleResponder()}
                placeholder={`Responder a @${
                  comentario.autor.nombreArtistico || comentario.autor.nick
                }...`}
                className="flex-1 bg-neutral-800 rounded-full px-4 py-2 text-sm outline-none"
              />
              <button
                onClick={handleResponder}
                disabled={!textoRespuesta.trim() || enviando}
                className="p-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComentarios();
  }, [song._id]);

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
      // Recargar comentarios para obtener la nueva respuesta
      loadComentarios(1, false);
      setPagina(1);
    } catch (error) {
      console.error("Error replying:", error);
    } finally {
      setEnviando(false);
    }
  };

  const handleToggleLike = async (comentarioId: string) => {
    try {
      await commentService.toggleLike(comentarioId);
      // Recargar comentarios para actualizar likes
      loadComentarios(pagina, false);
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
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={song.portadaUrl || "/cover.jpg"}
              alt={song.titulo}
              className="w-32 h-32 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold">{song.titulo}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copiarURL}
                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                    title="Copiar URL"
                  >
                    <LinkIcon size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    <X size={20} />
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
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  {contarTotalComentarios()} comentarios
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={16} />
                  {song.likes?.length || 0} me gusta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {loading ? (
            <div className="text-center text-neutral-400 py-8">Cargando...</div>
          ) : comentarios.length === 0 ? (
            <div className="text-center text-neutral-400 py-8">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>Sé el primero en comentar</p>
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
              <div className="inline-block w-6 h-6 border-2 border-neutral-600 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Input nuevo comentario */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex gap-3">
            <img
              src={user?.avatarUrl || "/avatar.png"}
              alt={user?.nick || "User"}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleEnviarComentario()
                }
                placeholder="Escribe un comentario..."
                className="flex-1 bg-neutral-800 rounded-full px-4 py-2 outline-none"
              />
              <button
                onClick={handleEnviarComentario}
                disabled={!nuevoComentario.trim() || enviando}
                className="p-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
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
    </div>
  );
}
