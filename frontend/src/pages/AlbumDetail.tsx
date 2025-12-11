import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Music,
  ArrowLeft,
  Play,
  Heart,
  MoreHorizontal,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Search,
  X,
} from "lucide-react";
import { albumService } from "../services/album.service";
import { musicService } from "../services/music.service";
import { recentService } from "../services/recent.service";
import { usePlayer, useAuth } from "../contexts";
import type { Album, Cancion, Usuario } from "../types";
import { LoadingSpinner, EmptyState, ConfirmModal } from "../components/common";
import SongRow from "../components/musica/SongRow";
import SongCommentsModal from "../components/musica/SongCommentsModal";
import { formatTimeAgo } from "../utils/dateFormat";

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const { user } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);
  const [removingSong, setRemovingSong] = useState<Cancion | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);

  // Estados para agregar canciones
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Cancion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingSongId, setAddingSongId] = useState<string | null>(null);
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(
    new Set()
  );
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);

  useEffect(() => {
    if (id) {
      loadAlbum();
    }
  }, [id]);

  const loadAlbum = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await albumService.getAlbumById(id);

      if (!data) {
        console.error("No se recibió datos del álbum");
        setAlbum(null);
        return;
      }

      setAlbum(data);

      // Sincronizar estado de like
      if (user && data.likes) {
        setIsLiked(data.likes.includes(user._id));
      }

      // Agregar al historial de recientes solo si tenemos artistas
      if (data.artistas && data.artistas.length > 0) {
        const artistaNombre =
          typeof data.artistas[0] === "object"
            ? (data.artistas[0] as Usuario).nombreArtistico ||
              (data.artistas[0] as Usuario).nombre
            : "";

        recentService.addRecentItem({
          id: data._id,
          type: "album",
          titulo: data.titulo,
          subtitulo: artistaNombre,
          imagenUrl: data.portadaUrl,
        });
      }
    } catch (error) {
      console.error("Error loading album:", error);
      setAlbum(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!album || !album.canciones || album.canciones.length === 0) return;
    const songs = album.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], 0, {
        type: "album",
        id: album._id,
        name: album.titulo,
      });
    }
  };

  const handlePlaySong = (index: number) => {
    if (!album || !album.canciones) return;
    const songs = album.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], index, {
        type: "album",
        id: album._id,
        name: album.titulo,
      });
    }
  };

  const getArtistNames = (artistas: any[]) => {
    if (!artistas || artistas.length === 0) return "Artista";
    if (typeof artistas[0] === "string") return "Artista";
    return artistas
      .map((a: Usuario) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  const canEditAlbum = () => {
    if (!user || !album) return false;
    return album.artistas?.some((a) =>
      typeof a === "string" ? a === user._id : a._id === user._id
    );
  };

  const handleConfirmRemove = async () => {
    if (!removingSong || !album) return;

    try {
      setIsRemoving(true);
      await musicService.removeSongFromAlbum(album._id, removingSong._id);
      setRemovingSong(null);
      loadAlbum();
    } catch (error: any) {
      console.error("Error removing song:", error);
      alert(error.message || "Error al quitar la canción");
    } finally {
      setIsRemoving(false);
    }
  };

  const getTotalDuration = () => {
    if (!album || !album.canciones) return "0:00";
    const songs = album.canciones.filter(
      (c) => typeof c !== "string"
    ) as Cancion[];
    const total = songs.reduce(
      (acc, song) => acc + (song.duracionSegundos || 0),
      0
    );
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    return hours > 0 ? `${hours} h ${mins} min` : `${mins} min`;
  };

  const handleToggleLike = async () => {
    if (!album || !user) return;
    try {
      const { liked } = await musicService.toggleLikeAlbum(album._id);
      setIsLiked(liked);
      // Actualizar el álbum para reflejar el cambio
      loadAlbum();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);

    try {
      const success = await albumService.deleteAlbum(album._id);
      if (success) {
        navigate("/albumes");
      } else {
        alert("Error al eliminar el álbum");
        setIsDeleting(false);
      }
    } catch (error: any) {
      console.error("Error deleting album:", error);
      alert(error.response?.data?.message || "Error al eliminar el álbum");
      setIsDeleting(false);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!album) return;

    setIsTogglingPrivacy(true);

    try {
      const response = await albumService.updateAlbum(album._id, {
        esPrivado: !album.esPrivado,
      });

      if (response) {
        setAlbum({
          ...album,
          esPrivado: !album.esPrivado,
        });
        setShowPrivacyConfirm(false);
      }
    } catch (error: any) {
      console.error("Error updating album privacy:", error);
      alert(
        error.response?.data?.message ||
          "Error al cambiar la privacidad del álbum"
      );
    } finally {
      setIsTogglingPrivacy(false);
    }
  };

  // Buscar canciones propias
  const handleSearchSongs = async () => {
    if (!searchQuery.trim() || !user) return;

    setIsSearching(true);
    try {
      const results = await musicService.searchSongs(searchQuery);
      // Obtener IDs de canciones ya en el álbum
      const existingSongIds = new Set(
        (album?.canciones || [])
          .filter((c) => typeof c !== "string")
          .map((c) => (c as Cancion)._id)
      );
      // Filtrar solo las canciones del usuario actual que no estén ya en el álbum
      const mySongs = results.filter((song) => {
        const artistas = song.artistas as Usuario[];
        const isMyArtist = artistas.some((artista) => artista._id === user._id);
        const notInAlbum = !existingSongIds.has(song._id);
        return isMyArtist && notInAlbum;
      });
      setSearchResults(mySongs);
    } catch (error) {
      console.error("Error searching songs:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Agregar canción al álbum
  const handleAddSong = async (songId: string) => {
    if (!album) return;

    setAddingSongId(songId);
    try {
      await musicService.addSongToAlbum(album._id, songId);
      // Recargar el álbum
      await loadAlbum();
      // Remover la canción de los resultados
      setSearchResults((prev) => prev.filter((s) => s._id !== songId));
    } catch (error: any) {
      console.error("Error adding song to album:", error);
      alert(error.response?.data?.mensaje || "Error al agregar la canción");
    } finally {
      setAddingSongId(null);
    }
  };

  // Toggle selección de canción
  const toggleSongSelection = (songId: string) => {
    setSelectedSongIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  // Agregar todas las canciones seleccionadas
  const handleAddSelectedSongs = async () => {
    if (!album || selectedSongIds.size === 0) return;

    setIsAddingMultiple(true);
    try {
      const songIdsArray = Array.from(selectedSongIds);
      // Agregar canciones en paralelo
      await Promise.all(
        songIdsArray.map((songId) =>
          musicService.addSongToAlbum(album._id, songId)
        )
      );
      // Recargar el álbum
      await loadAlbum();
      // Remover las canciones agregadas de los resultados
      setSearchResults((prev) =>
        prev.filter((s) => !selectedSongIds.has(s._id))
      );
      // Limpiar selección
      setSelectedSongIds(new Set());
    } catch (error: any) {
      console.error("Error adding songs to album:", error);
      alert(error.response?.data?.mensaje || "Error al agregar las canciones");
    } finally {
      setIsAddingMultiple(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!album) {
    return (
      <EmptyState
        icon={Music}
        title="Álbum no encontrado"
        description="Este álbum no existe o fue eliminado."
      />
    );
  }

  const songs = (album.canciones?.filter((c) => typeof c !== "string") ||
    []) as Cancion[];

  return (
    <div className="min-h-screen bg-black">
      {/* Header con diseño único */}
      <div className="relative overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-linear-to-br from-orange-600/20 via-red-600/20 to-purple-900/20 blur-3xl" />

        {/* Botón volver */}
        <button
          onClick={() => navigate("/albumes")}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all text-white"
        >
          <ArrowLeft size={18} />
          <span className="font-semibold">Volver</span>
        </button>

        <div className="relative px-8 pt-20 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
              {/* Portada con efecto */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <img
                  src={album.portadaUrl || "/cover.jpg"}
                  alt={album.titulo}
                  className="relative w-64 h-64 rounded-2xl shadow-2xl object-cover border-4 border-white/10 group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full border border-orange-500/30">
                  <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                    Álbum
                  </span>
                </div>

                <h1 className="text-6xl md:text-7xl font-black bg-linear-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                  {album.titulo}
                </h1>

                {album.descripcion && (
                  <p className="text-lg text-neutral-300 max-w-2xl font-light">
                    {album.descripcion}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <Music size={14} className="text-orange-400" />
                    <span className="font-bold text-white">
                      {getArtistNames(album.artistas)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <span className="text-neutral-400">
                      {formatTimeAgo(album.createdAt)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <span className="text-neutral-400">
                      {songs.length} canciones
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <span className="text-neutral-400">
                      {getTotalDuration()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-black px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="px-8 py-4 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-full flex items-center gap-3 font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
          >
            <Play size={20} fill="currentColor" />
            Reproducir todo
          </button>
          <button
            onClick={handleToggleLike}
            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full transition-all hover:scale-110"
            title={isLiked ? "Quitar me gusta" : "Me gusta"}
          >
            <Heart
              size={22}
              className={
                isLiked ? "fill-orange-500 text-orange-500" : "text-neutral-400"
              }
            />
          </button>

          {canEditAlbum() && (
            <>
              <button
                onClick={() => setShowAddSongsModal(true)}
                className="w-12 h-12 flex items-center justify-center hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-full transition-all hover:scale-110"
                title="Agregar canciones"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={() => setShowPrivacyConfirm(true)}
                disabled={isTogglingPrivacy}
                className="w-12 h-12 flex items-center justify-center hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full transition-all hover:scale-110 disabled:opacity-50"
                title={album?.esPrivado ? "Hacer público" : "Hacer privado"}
              >
                {album?.esPrivado ? <Lock size={20} /> : <Unlock size={20} />}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-12 h-12 flex items-center justify-center hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full transition-all hover:scale-110"
                title="Eliminar álbum"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}

          <button className="w-12 h-12 flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full transition-all">
            <MoreHorizontal size={22} className="text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Lista de canciones */}
      <div className="px-8 py-6 bg-black">
        <div className="max-w-7xl mx-auto">
          {songs.length === 0 ? (
            <EmptyState
              icon={Music}
              title="Este álbum no tiene canciones"
              description="Aún no se han agregado canciones a este álbum."
            />
          ) : (
            <div className="space-y-2">
              {songs.map((song, index) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <SongRow
                    key={song._id}
                    cancion={song}
                    index={index}
                    isCurrentSong={isCurrentSong}
                    isPlaying={isPlaying}
                    onPlay={() => handlePlaySong(index)}
                    onOpenComments={() => setSelectedSongForComments(song)}
                    onLikeChange={(liked) => {
                      // Actualizar el estado local de las canciones
                      setAlbum((prevAlbum) => {
                        if (!prevAlbum) return prevAlbum;
                        const updatedSongs = (prevAlbum.canciones || []).map(
                          (c) => {
                            if (typeof c === "string" || c._id !== song._id)
                              return c;
                            return {
                              ...c,
                              likes: liked
                                ? [...(c.likes || []), user?._id || ""]
                                : (c.likes || []).filter(
                                    (id) => id !== user?._id
                                  ),
                            };
                          }
                        );
                        return { ...prevAlbum, canciones: updatedSongs };
                      });
                    }}
                    showRemoveFromCollection={canEditAlbum()}
                    onRemoveFromCollection={() => setRemovingSong(song)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de comentarios */}
      {selectedSongForComments && (
        <SongCommentsModal
          song={selectedSongForComments}
          onClose={() => setSelectedSongForComments(null)}
        />
      )}

      {/* Modal de confirmar quitar canción */}
      <ConfirmModal
        isOpen={!!removingSong}
        onClose={() => setRemovingSong(null)}
        onConfirm={handleConfirmRemove}
        title="¿Quitar canción del álbum?"
        message={`"${removingSong?.titulo}" se quitará de este álbum, pero seguirá disponible en la plataforma.`}
        confirmText="Quitar"
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={isRemoving}
      />

      {/* Modal de confirmar eliminar álbum */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAlbum}
        title="Eliminar álbum"
        message={`¿Estás seguro de eliminar el álbum "${album?.titulo}"? Esta acción no se puede deshacer y eliminará todas las canciones asociadas.

Tip: Si no quieres que otros vean este álbum, considera hacerlo privado en lugar de eliminarlo.`}
        confirmText={isDeleting ? "Eliminando..." : "Eliminar"}
        cancelText="Cancelar"
        isDangerous
        isLoading={isDeleting}
      />

      {/* Modal de confirmar cambio de privacidad */}
      <ConfirmModal
        isOpen={showPrivacyConfirm}
        onClose={() => setShowPrivacyConfirm(false)}
        onConfirm={handleTogglePrivacy}
        title={album?.esPrivado ? "Hacer álbum público" : "Hacer álbum privado"}
        message={
          album?.esPrivado
            ? `El álbum "${album?.titulo}" será visible para todos los usuarios.`
            : `El álbum "${album?.titulo}" solo será visible para ti.`
        }
        confirmText={album?.esPrivado ? "Hacer público" : "Hacer privado"}
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={isTogglingPrivacy}
      />

      {/* Modal de agregar canciones */}
      {showAddSongsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Agregar canciones a "{album?.titulo}"
              </h3>
              <button
                onClick={() => {
                  setShowAddSongsModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedSongIds(new Set());
                }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchSongs()}
                placeholder="Buscar tus canciones..."
                className="flex-1 px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-green-500/50"
              />
              <button
                onClick={handleSearchSongs}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={18} />
                {isSearching ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-neutral-400">
                    {searchResults.length} canción
                    {searchResults.length !== 1 ? "es" : ""} encontrada
                    {searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {selectedSongIds.size > 0 && (
                    <button
                      onClick={handleAddSelectedSongs}
                      disabled={isAddingMultiple}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                      <Plus size={18} />
                      {isAddingMultiple
                        ? "Agregando..."
                        : `Agregar ${selectedSongIds.size} seleccionada${
                            selectedSongIds.size !== 1 ? "s" : ""
                          }`}
                    </button>
                  )}
                </div>
                {searchResults.map((song) => (
                  <div
                    key={song._id}
                    className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSongIds.has(song._id)}
                      onChange={() => toggleSongSelection(song._id)}
                      className="w-5 h-5 rounded border-2 border-neutral-600 bg-neutral-800 checked:bg-green-500 checked:border-green-500 cursor-pointer"
                    />
                    {song.portadaUrl ? (
                      <img
                        src={song.portadaUrl}
                        alt={song.titulo}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-linear-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                        <span className="text-2xl">🎵</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {song.titulo}
                      </p>
                      <p className="text-sm text-neutral-400 truncate">
                        {song.artistas
                          ?.map((a) => a.nick || a.nombre)
                          .join(", ") || "Artista desconocido"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddSong(song._id)}
                      disabled={addingSongId === song._id}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      {addingSongId === song._id ? "Agregando..." : "Agregar"}
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-12">
                <p className="text-neutral-400">
                  No se encontraron canciones tuyas con "{searchQuery}"
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Solo puedes agregar tus propias canciones a tus álbumes
                </p>
              </div>
            ) : !searchQuery ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-neutral-600 mb-4" />
                <p className="text-neutral-400">
                  Busca tus canciones para agregarlas al álbum
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Solo puedes agregar canciones donde seas artista
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
