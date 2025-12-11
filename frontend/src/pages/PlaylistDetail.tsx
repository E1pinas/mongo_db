import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Music,
  Play,
  Heart,
  MoreHorizontal,
  ArrowLeft,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Search,
  X,
} from "lucide-react";
import { musicService } from "../services/music.service";
import { recentService } from "../services/recent.service";
import { usePlayer, useAuth } from "../contexts";
import type { Playlist, Cancion, Usuario } from "../types";
import {
  LoadingSpinner,
  EmptyState,
  Button,
  ConfirmModal,
} from "../components/common";
import SongRow from "../components/musica/SongRow";
import SongCommentsModal from "../components/musica/SongCommentsModal";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);
  const [removingSong, setRemovingSong] = useState<Cancion | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
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
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await musicService.getPlaylistById(id);
      setPlaylist(data);

      // Sincronizar estado de seguimiento
      if (user && data.seguidores) {
        setIsFollowing(data.seguidores.includes(user._id));
      }

      // Agregar al historial de recientes
      const creadorNombre =
        typeof data.creador === "object"
          ? (data.creador as Usuario).nombreArtistico ||
            (data.creador as Usuario).nombre
          : "";

      recentService.addRecentItem({
        id: data._id,
        type: "playlist",
        titulo: data.titulo,
        subtitulo: creadorNombre,
        imagenUrl: data.portadaUrl || "/cover.jpg",
      });
    } catch (error) {
      console.error("Error loading playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!playlist || !playlist.canciones || playlist.canciones.length === 0)
      return;
    const songs = playlist.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], 0, {
        type: "playlist",
        id: playlist._id,
        name: playlist.titulo,
      });
    }
  };

  const handlePlaySong = (index: number) => {
    if (!playlist || !playlist.canciones) return;
    const songs = playlist.canciones.filter((c) => typeof c !== "string");
    if (songs.length > 0) {
      playQueue(songs as Cancion[], index, {
        type: "playlist",
        id: playlist._id,
        name: playlist.titulo,
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

  const canEditPlaylist = () => {
    if (!user || !playlist) return false;
    const isCreator =
      typeof playlist.creador === "string"
        ? playlist.creador === user._id
        : playlist.creador._id === user._id;
    const isCollaborator =
      playlist.esColaborativa &&
      playlist.colaboradores?.some((c) =>
        typeof c === "string" ? c === user._id : c._id === user._id
      );
    return isCreator || isCollaborator;
  };

  const handleConfirmRemove = async () => {
    if (!removingSong || !playlist) return;

    try {
      setIsRemoving(true);
      await musicService.removeSongFromPlaylist(playlist._id, removingSong._id);
      setRemovingSong(null);
      loadPlaylist();
    } catch (error: any) {
      console.error("Error removing song:", error);
      alert(error.message || "Error al quitar la canción");
    } finally {
      setIsRemoving(false);
    }
  };

  const getTotalDuration = () => {
    if (!playlist || !playlist.canciones) return "0:00";
    const songs = playlist.canciones.filter(
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

  const getCreatorName = () => {
    if (!playlist || !playlist.creador) return "Usuario";
    if (typeof playlist.creador === "string") return "Usuario";
    return (
      playlist.creador.nombreArtistico ||
      playlist.creador.nick ||
      playlist.creador.nombre ||
      "Usuario"
    );
  };

  const handleToggleSeguir = async () => {
    if (!playlist || !user) return;
    try {
      const { following } = await musicService.toggleSeguirPlaylist(
        playlist._id
      );
      setIsFollowing(following);
      // Actualizar la playlist para reflejar el cambio
      loadPlaylist();
    } catch (error) {
      console.error("Error toggling seguir:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);

    try {
      await musicService.deletePlaylist(playlist._id);
      navigate("/playlists");
    } catch (error: any) {
      console.error("Error deleting playlist:", error);
      alert(error.message || "Error al eliminar la playlist");
      setIsDeleting(false);
    }
  };

  const isCreator = () => {
    if (!user || !playlist) return false;
    return typeof playlist.creador === "string"
      ? playlist.creador === user._id
      : playlist.creador._id === user._id;
  };

  const handleSearchSongs = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await musicService.searchSongs(searchQuery);
      // Obtener IDs de canciones ya en la playlist
      const existingSongIds = new Set(
        (playlist?.canciones || [])
          .filter((c) => typeof c !== "string")
          .map((c) => (c as Cancion)._id)
      );
      // Filtrar canciones que no estén ya en la playlist
      const availableSongs = results.filter(
        (song) => !existingSongIds.has(song._id)
      );
      setSearchResults(availableSongs);
    } catch (error) {
      console.error("Error searching songs:", error);
      alert("Error al buscar canciones");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSong = async (songId: string) => {
    if (!playlist) return;

    setAddingSongId(songId);
    try {
      await musicService.addSongToPlaylist(playlist._id, songId);
      // Recargar playlist
      await loadPlaylist();
      // Remover de resultados
      setSearchResults((prev) => prev.filter((s) => s._id !== songId));
    } catch (error: any) {
      console.error("Error adding song to playlist:", error);
      alert(
        error.response?.data?.message ||
          "Error al agregar canción a la playlist"
      );
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
    if (!playlist || selectedSongIds.size === 0) return;

    setIsAddingMultiple(true);
    try {
      const songIdsArray = Array.from(selectedSongIds);
      // Agregar canciones en paralelo
      await Promise.all(
        songIdsArray.map((songId) =>
          musicService.addSongToPlaylist(playlist._id, songId)
        )
      );
      // Recargar playlist
      await loadPlaylist();
      // Remover las canciones agregadas de los resultados
      setSearchResults((prev) =>
        prev.filter((s) => !selectedSongIds.has(s._id))
      );
      // Limpiar selección
      setSelectedSongIds(new Set());
    } catch (error: any) {
      console.error("Error adding songs to playlist:", error);
      alert(
        error.response?.data?.message ||
          "Error al agregar las canciones a la playlist"
      );
    } finally {
      setIsAddingMultiple(false);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!playlist) return;

    setIsTogglingPrivacy(true);

    try {
      const response = await musicService.updatePlaylist(playlist._id, {
        esPublica: !playlist.esPublica,
      });

      if (response) {
        setPlaylist({
          ...playlist,
          esPublica: !playlist.esPublica,
        });
        setShowPrivacyConfirm(false);
      }
    } catch (error: any) {
      console.error("Error updating playlist privacy:", error);
      alert(
        error.response?.data?.message ||
          "Error al cambiar la privacidad de la playlist"
      );
    } finally {
      setIsTogglingPrivacy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Music size={64} className="text-neutral-600 mb-4" />
        <p className="text-xl text-neutral-400 mb-4">Playlist no encontrada</p>
        <button
          onClick={() => navigate("/playlists")}
          className="px-6 py-3 bg-neutral-800 rounded-full font-semibold hover:bg-neutral-700 transition-colors"
        >
          Volver a Playlists
        </button>
      </div>
    );
  }

  const songs =
    (playlist.canciones?.filter((c) => typeof c !== "string") as Cancion[]) ||
    [];

  return (
    <div className="min-h-screen bg-black">
      {/* Header con diseño único */}
      <div className="relative overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-linear-to-br from-green-600/20 via-blue-600/20 to-purple-900/20 blur-3xl" />

        {/* Botón volver */}
        <button
          onClick={() => navigate("/playlists")}
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
                <div className="absolute inset-0 bg-linear-to-br from-green-500 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <img
                  src={playlist.portadaUrl || "/cover.jpg"}
                  alt={playlist.titulo}
                  className="relative w-64 h-64 rounded-2xl shadow-2xl object-cover border-4 border-white/10 group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
                  <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
                    Playlist
                  </span>
                </div>

                <h1 className="text-6xl md:text-7xl font-black bg-linear-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                  {playlist.titulo}
                </h1>

                {playlist.descripcion && (
                  <p className="text-lg text-neutral-300 max-w-2xl font-light">
                    {playlist.descripcion}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <Music size={14} className="text-green-400" />
                    <span className="font-bold text-white">
                      {getCreatorName()}
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
                  {playlist.esColaborativa && (
                    <div className="px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                      <span className="text-blue-400 font-semibold">
                        Colaborativa
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-black px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="px-8 py-4 bg-linear-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-full flex items-center gap-3 font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
          >
            <Play size={20} fill="currentColor" />
            Reproducir todo
          </button>
          <button
            onClick={handleToggleSeguir}
            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full transition-all hover:scale-110"
            title={isFollowing ? "Dejar de seguir" : "Seguir"}
          >
            <Heart
              size={22}
              className={
                isFollowing
                  ? "fill-orange-500 text-orange-500"
                  : "text-neutral-400"
              }
            />
          </button>

          {isCreator() && (
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
                title={playlist?.esPublica ? "Hacer privada" : "Hacer pública"}
              >
                {playlist?.esPublica ? (
                  <Unlock size={20} />
                ) : (
                  <Lock size={20} />
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-12 h-12 flex items-center justify-center hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full transition-all hover:scale-110"
                title="Eliminar playlist"
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

      {/* Canciones */}
      <div className="px-8 py-6 bg-black">
        <div className="max-w-7xl mx-auto">
          {songs.length === 0 ? (
            <EmptyState
              icon={Music}
              title="Esta playlist aún no tiene canciones"
              description="Agrega canciones para empezar a escuchar."
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
                      // Recargar la playlist para obtener los datos actualizados
                      loadPlaylist();
                    }}
                    showRemoveFromCollection={canEditPlaylist()}
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
        title="¿Quitar canción de la playlist?"
        message={`"${removingSong?.titulo}" se quitará de esta playlist, pero seguirá disponible en la plataforma.`}
        confirmText="Quitar"
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={isRemoving}
      />

      {/* Modal de confirmar eliminar playlist */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePlaylist}
        title="Eliminar playlist"
        message={`¿Estás seguro de eliminar la playlist "${playlist?.titulo}"? Esta acción no se puede deshacer. 

Tip: Si no quieres que otros vean esta playlist, considera hacerla privada en lugar de eliminarla.`}
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
        title={
          playlist?.esPublica
            ? "Hacer playlist privada"
            : "Hacer playlist pública"
        }
        message={
          playlist?.esPublica
            ? `La playlist "${playlist?.titulo}" solo será visible para ti.`
            : `La playlist "${playlist?.titulo}" será visible para todos los usuarios.`
        }
        confirmText={playlist?.esPublica ? "Hacer privada" : "Hacer pública"}
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
                Agregar canciones a "{playlist?.titulo}"
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
                placeholder="Buscar canciones..."
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
                  No se encontraron canciones con "{searchQuery}"
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Puedes agregar canciones de cualquier artista a tu playlist
                </p>
              </div>
            ) : !searchQuery ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-neutral-600 mb-4" />
                <p className="text-neutral-400">
                  Busca canciones para agregarlas a la playlist
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Puedes agregar canciones de cualquier artista
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
