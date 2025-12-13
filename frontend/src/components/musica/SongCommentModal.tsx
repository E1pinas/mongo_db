import { useEffect, useState } from "react";
import { X, Play } from "lucide-react";
import type { Comentario as ComentarioType, Cancion } from "../../types";
import { musicService } from "../../services/music.service";
import { commentService } from "../../services/comment.service";
import { usePlayer } from "../../contexts/PlayerContext";

interface SongCommentModalProps {
  songId: string;
  comentarioId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SongCommentModal({
  songId,
  comentarioId,
  isOpen,
  onClose,
}: SongCommentModalProps) {
  const { playSong } = usePlayer();
  const [song, setSong] = useState<Cancion | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && songId) {
      loadData();
    }
  }, [isOpen, songId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar canción y comentarios en paralelo
      const [cancionData, comentariosData] = await Promise.all([
        musicService.getSongById(songId),
        commentService.obtenerComentariosCancion(songId),
      ]);

      setSong(cancionData);
      setComentarios(comentariosData.comentarios || []);
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      if (err.response?.status === 404) {
        setError("Esta canción ha sido eliminada");
      } else {
        setError("Error al cargar el comentario");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = () => {
    if (song) {
      playSong(song);
    }
  };

  if (!isOpen) return null;

  // Encontrar el comentario específico
  const comentario = comentarios.find((c) => c._id === comentarioId);

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

          {!isLoading && !error && song && comentario && (
            <div className="space-y-6">
              {/* Referencia a la canción */}
              <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                <p className="text-xs text-neutral-400 mb-2">
                  Comentario en tu canción:
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={song.portadaUrl || "/disco.png"}
                    alt={song.titulo}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/disco.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold truncate">
                      {song.titulo}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {Array.isArray(song.artistas)
                        ? song.artistas
                            .map((a) =>
                              typeof a === "object"
                                ? a.nombreArtistico || a.nick
                                : a
                            )
                            .join(", ")
                        : "Artista"}
                    </p>
                  </div>
                </div>
              </div>

              {/* El comentario específico con diseño destacado */}
              <div className="bg-linear-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 border-2 border-orange-500/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  {/* Avatar del usuario que comentó */}
                  <img
                    src={
                      typeof comentario.autor === "object" &&
                      comentario.autor?.avatarUrl
                        ? comentario.autor.avatarUrl
                        : "/avatar.png"
                    }
                    alt={
                      typeof comentario.autor === "object"
                        ? comentario.autor?.nombreArtistico ||
                          comentario.autor?.nick ||
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
                        {typeof comentario.autor === "object"
                          ? comentario.autor?.nombreArtistico ||
                            comentario.autor?.nick ||
                            "Usuario"
                          : "Usuario"}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-orange-500 rounded-full font-semibold">
                        Nuevo
                      </span>
                    </div>

                    {/* Nick si es diferente del nombre artístico */}
                    {typeof comentario.autor === "object" &&
                      comentario.autor?.nombreArtistico &&
                      comentario.autor?.nick &&
                      comentario.autor.nombreArtistico !==
                        comentario.autor.nick && (
                        <p className="text-sm text-neutral-400 mb-2">
                          @{comentario.autor.nick}
                        </p>
                      )}

                    {/* Contenido del comentario */}
                    <p className="text-neutral-100 text-base leading-relaxed wrap-break-word">
                      {comentario.texto || comentario.contenido || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón para reproducir la canción */}
              <button
                onClick={handlePlaySong}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-linear-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl transition-all font-semibold shadow-lg hover:shadow-orange-500/30"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Reproducir Canción
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
