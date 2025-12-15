import { useState } from "react";
import { X, Music } from "lucide-react";
import type { Cancion, Album, Playlist } from "../../types";
import { Toast } from "../Toast";

interface CreatePostModalProps {
  onClose: () => void;
  onCreate: (data: {
    tipo: "texto" | "repost_cancion" | "repost_album" | "repost_playlist";
    contenido?: string;
    recursoId?: string;
  }) => Promise<void>;
  selectedSong?: Cancion;
  selectedAlbum?: Album;
  selectedPlaylist?: Playlist;
  userAvatar?: string;
  userName: string;
}

export default function CreatePostModal({
  onClose,
  onCreate,
  selectedSong,
  selectedAlbum,
  selectedPlaylist,
  userAvatar,
  userName,
}: CreatePostModalProps) {
  const [contenido, setContenido] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const maxChars = 250;
  const charsLeft = maxChars - contenido.length;

  const getInitialTipo = () => {
    if (selectedSong) return "repost_cancion";
    if (selectedAlbum) return "repost_album";
    if (selectedPlaylist) return "repost_playlist";
    return "texto";
  };

  const getRecursoId = () => {
    if (selectedSong) return selectedSong._id;
    if (selectedAlbum) return selectedAlbum._id;
    if (selectedPlaylist) return selectedPlaylist._id;
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tipo = getInitialTipo();

    if (tipo === "texto" && !contenido.trim()) {
      setMensajeError("El contenido no puede estar vacío");
      return;
    }

    try {
      setLoading(true);
      await onCreate({
        tipo,
        contenido: contenido.trim() || undefined,
        recursoId: getRecursoId(),
      });
      onClose();
    } catch (error: any) {
      setMensajeError(error.message || "Error al crear el post");
    } finally {
      setLoading(false);
    }
  };

  const selectedResource = selectedSong || selectedAlbum || selectedPlaylist;

  return (
    <>
      {mensajeError && (
        <Toast
          message={mensajeError}
          type="error"
          onClose={() => setMensajeError("")}
        />
      )}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl max-w-2xl w-full border-2 border-orange-500/30 shadow-2xl shadow-orange-500/10 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-neutral-800/50 px-6 py-5 flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              ¿ Cuál es tu nueva noticia ?
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                    <img
                      src={userAvatar || "/avatar.png"}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-orange-400 mb-3">
                    {userName}
                  </p>

                  <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder={
                      selectedResource
                        ? "Comparte tus pensamientos sobre esta música..."
                        : "¿Cuál es tu nueva noticia?"
                    }
                    className="w-full bg-neutral-800/50 border-2 border-neutral-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl p-5 text-base resize-none outline-none placeholder:text-neutral-500 transition-all"
                    rows={5}
                    maxLength={maxChars}
                    autoFocus={!selectedResource}
                  />

                  {selectedResource && (
                    <div className="mt-4 p-4 border border-neutral-700 rounded-xl bg-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-700 rounded-lg overflow-hidden shrink-0">
                          {selectedSong?.portadaUrl ||
                          selectedAlbum?.portadaUrl ||
                          selectedPlaylist?.portadaUrl ? (
                            <img
                              src={
                                selectedSong?.portadaUrl ||
                                selectedAlbum?.portadaUrl ||
                                selectedPlaylist?.portadaUrl
                              }
                              alt="Portada"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-full h-full p-3 text-neutral-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {selectedSong?.titulo ||
                              selectedAlbum?.titulo ||
                              selectedPlaylist?.titulo}
                          </p>
                          <p className="text-xs text-neutral-400 truncate">
                            {selectedSong && "Canción"}
                            {selectedAlbum && "Álbum"}
                            {selectedPlaylist && "Playlist"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800/50 bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-orange-400 uppercase tracking-wider">
                  OTO MUSIC
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-base font-medium ${
                    charsLeft < 50
                      ? charsLeft < 0
                        ? "text-red-500"
                        : "text-yellow-500"
                      : "text-neutral-400"
                  }`}
                >
                  {charsLeft} caracteres restantes
                </span>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    charsLeft < 0 ||
                    (getInitialTipo() === "texto" && !contenido.trim())
                  }
                  className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
                >
                  {loading ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
