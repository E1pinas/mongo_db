import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { musicService } from "../services/music.service";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts/AuthContext";
import { Upload, X, Plus, Search, Play } from "lucide-react";
import type { Playlist, Usuario, Cancion } from "../types";
import { formatTimeAgo } from "../utils/dateFormat";

/**
 * Playlists - Página de playlists
 *
 * Muestra las playlists del usuario y playlists recomendadas
 */

export default function Playlists() {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const { user } = useAuth();
  const [misPlaylists, setMisPlaylists] = useState<Playlist[]>([]);
  const [playlistsPublicas, setPlaylistsPublicas] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esPublica, setEsPublica] = useState(true);
  const [esColaborativa, setEsColaborativa] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string>("");

  // Para agregar canciones
  const [cancionesBuscadas, setCancionesBuscadas] = useState<Cancion[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(""); // Limpiar error anterior

      // Cargar solo playlists creadas por el usuario
      const [createdPlaylists, publicPlaylists] = await Promise.all([
        musicService.getMyPlaylists(),
        musicService.getPublicPlaylists(),
      ]);

      console.log("Mis playlists creadas:", createdPlaylists);
      console.log("Playlists públicas:", publicPlaylists);

      // Filtrar playlists públicas excluyendo las del usuario actual
      const playlistsDeOtros = publicPlaylists.filter((playlist) => {
        const creadorId =
          typeof playlist.creador === "string"
            ? playlist.creador
            : playlist.creador?._id;
        return creadorId !== user?._id;
      });

      setMisPlaylists(createdPlaylists);
      setPlaylistsPublicas(playlistsDeOtros);
    } catch (err: any) {
      console.error("Error loading playlists:", err);
      // No mostrar error si simplemente no hay playlists
      if (!err.message?.includes("404")) {
        setError(err.message || "Error al cargar playlists");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      return;
    }

    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
    setError("");
  };

  const searchSongs = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    try {
      setSearching(true);
      console.log("Buscando canciones:", searchQuery);
      const results = await musicService.searchSongs(searchQuery);
      console.log("Resultados encontrados:", results);
      setCancionesBuscadas(results);
    } catch (err: any) {
      console.error("Error searching songs:", err);
      setError(err.message || "Error al buscar canciones");
    } finally {
      setSearching(false);
    }
  };

  const toggleSong = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setEsPublica(true);
    setEsColaborativa(false);
    setPortadaFile(null);
    setPortadaPreview("");
    setSelectedSongs([]);
    setCancionesBuscadas([]);
    setSearchQuery("");
    setError("");
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El título de la playlist es obligatorio");
      return;
    }

    try {
      setCreating(true);
      setError("");

      // 1. Si hay portada, subirla primero
      let portadaUrl = "";
      if (portadaFile) {
        const formData = new FormData();
        formData.append("imagen", portadaFile);

        const response = await fetch(
          "http://localhost:3900/api/upload/imagen",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.ok) {
          setError(data.message || "Error al subir la imagen de portada");
          setCreating(false);
          return;
        }

        if (data.imagenUrl) {
          portadaUrl = data.imagenUrl;
        }
      }

      // 2. Crear la playlist
      const nuevaPlaylist = await musicService.createPlaylist({
        titulo: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        esPublica,
        esColaborativa,
        portadaUrl: portadaUrl || undefined,
      });

      // 3. Agregar canciones seleccionadas
      if (selectedSongs.length > 0 && nuevaPlaylist._id) {
        for (const songId of selectedSongs) {
          await musicService.addSongToPlaylist(nuevaPlaylist._id, songId);
        }
      }

      // Resetear y cerrar
      resetForm();
      setShowCreateModal(false);
      loadPlaylists(); // Recargar playlists
    } catch (err: any) {
      console.error("Error creating playlist:", err);
      setError(err.message || "Error al crear playlist");
    } finally {
      setCreating(false);
    }
  };

  const getCreatorName = (creador: string | Usuario | undefined) => {
    if (!creador) return "Tú";
    if (typeof creador === "string") return "Tú";
    return (
      creador.nombreArtistico || creador.nick || creador.nombre || "Usuario"
    );
  };

  const getSongCount = (canciones: string[] | Cancion[] | undefined) => {
    return canciones?.length || 0;
  };

  const handlePlayPlaylist = async (
    playlist: Playlist,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    // Solo reproducir si la playlist tiene canciones
    if (Array.isArray(playlist.canciones) && playlist.canciones.length > 0) {
      // Si las canciones son solo IDs, necesitamos cargar la playlist completa
      if (typeof playlist.canciones[0] === "string") {
        try {
          const fullPlaylist = await musicService.getPlaylistById(playlist._id);
          const songs = fullPlaylist.canciones.filter(
            (c) => typeof c !== "string" && c.titulo
          );
          if (songs.length > 0) {
            playQueue(songs as any[], 0);
          }
        } catch (error) {
          console.error("Error loading playlist:", error);
        }
      } else {
        // Las canciones ya están pobladas
        const songs = playlist.canciones.filter(
          (c) => typeof c !== "string" && c.titulo
        );
        if (songs.length > 0) {
          playQueue(songs as any[], 0);
        }
      }
    }
  };

  const handleClickPlaylist = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mis Playlists</h1>
        <p className="text-neutral-400">Playlists que has creado</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Botón crear playlist */}
      <div className="mb-8">
        <button
          onClick={() => {
            setError(""); // Limpiar errores anteriores
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus size={20} />
          Crear playlist
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-neutral-600 border-t-white rounded-full animate-spin"></div>
          <p className="text-neutral-400 mt-4">Cargando playlists...</p>
        </div>
      )}

      {/* Tus playlists */}
      {!loading && misPlaylists.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Tus playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {misPlaylists
              .filter((playlist) => playlist && playlist._id && playlist.titulo)
              .map((playlist) => (
                <div
                  key={playlist._id}
                  onClick={() => handleClickPlaylist(playlist._id)}
                  className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
                >
                  <div className="relative mb-4">
                    <div className="aspect-square bg-neutral-700 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={playlist.portadaUrl || "/cover.jpg"}
                        alt={playlist.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={(e) => handlePlayPlaylist(playlist, e)}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-105"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                  <p className="font-semibold text-sm mb-2 truncate">
                    {playlist.titulo}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {getCreatorName(playlist.creador)} •{" "}
                    {formatTimeAgo(playlist.createdAt)} •{" "}
                    {getSongCount(playlist.canciones)} canciones
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Playlists públicas de la comunidad */}
      {!loading && playlistsPublicas.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Descubre playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlistsPublicas
              .filter((playlist) => playlist && playlist._id && playlist.titulo)
              .map((playlist) => (
                <div
                  key={playlist._id}
                  onClick={() => handleClickPlaylist(playlist._id)}
                  className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
                >
                  <div className="relative mb-4">
                    <div className="aspect-square bg-neutral-700 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={playlist.portadaUrl || "/cover.jpg"}
                        alt={playlist.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={(e) => handlePlayPlaylist(playlist, e)}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-105"
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                  <p className="font-semibold text-sm mb-2 truncate">
                    {playlist.titulo}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {getCreatorName(playlist.creador)} •{" "}
                    {getSongCount(playlist.canciones)} canciones
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {!loading && misPlaylists.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-neutral-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">
            Aún no tienes playlists
          </h3>
          <p className="text-neutral-400 mb-6">
            Crea tu primera playlist para organizar tu música
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-block px-6 py-3 bg-blue-500 rounded-full font-semibold hover:bg-blue-600 transition-colors"
          >
            Crear Playlist
          </button>
        </div>
      )}

      {/* Modal crear playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nueva Playlist</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreatePlaylist} className="space-y-6">
              {/* Portada */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Portada de la playlist
                </label>
                <div className="flex items-start gap-4">
                  {portadaPreview ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden group">
                      <img
                        src={portadaPreview}
                        alt="Portada"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPortadaFile(null);
                          setPortadaPreview("");
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-40 h-40 border-2 border-dashed border-neutral-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
                      <Upload size={28} className="text-neutral-500 mb-2" />
                      <span className="text-xs text-neutral-400 text-center px-2">
                        Subir portada
                      </span>
                      <span className="text-xs text-neutral-500 mt-1">
                        JPG, PNG
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handlePortadaChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nombre de la playlist *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Mi playlist increíble"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  maxLength={100}
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe tu playlist..."
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  maxLength={500}
                />
              </div>

              {/* Buscar y agregar canciones */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Agregar canciones
                </label>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          searchSongs();
                        }
                      }}
                      placeholder="Buscar canciones..."
                      className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={searchSongs}
                    disabled={searching || searchQuery.trim().length < 2}
                    className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? "..." : "Buscar"}
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {searchQuery.trim().length >= 2 &&
                  cancionesBuscadas.length === 0 &&
                  !searching && (
                    <div className="mt-3 p-4 bg-neutral-800/50 rounded-lg text-center">
                      <p className="text-neutral-400 text-sm">
                        No se encontraron canciones. Intenta con otro término de
                        búsqueda.
                      </p>
                    </div>
                  )}

                {cancionesBuscadas.length > 0 && (
                  <div className="mt-3 p-4 bg-neutral-800/50 rounded-lg max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {cancionesBuscadas.map((song) => (
                        <label
                          key={song._id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-neutral-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSongs.includes(song._id)}
                            onChange={() => toggleSong(song._id)}
                            className="w-4 h-4"
                          />
                          <div className="w-10 h-10 bg-neutral-700 rounded shrink-0 overflow-hidden">
                            <img
                              src={song.portadaUrl || "/cover.jpg"}
                              alt={song.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {song.titulo}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                              {Array.isArray(song.artistas)
                                ? song.artistas
                                    .map((a: any) =>
                                      typeof a === "string"
                                        ? a
                                        : a.nombreArtistico ||
                                          a.nick ||
                                          a.nombre
                                    )
                                    .join(", ")
                                : "Artista"}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSongs.length > 0 && (
                  <p className="text-xs text-neutral-400 mt-2">
                    {selectedSongs.length} canción
                    {selectedSongs.length !== 1 ? "es" : ""} seleccionada
                    {selectedSongs.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Opciones de privacidad */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="esPublica"
                    checked={esPublica}
                    onChange={(e) => setEsPublica(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label htmlFor="esPublica" className="text-sm cursor-pointer">
                    Playlist pública (otros usuarios podrán verla)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="esColaborativa"
                    checked={esColaborativa}
                    onChange={(e) => setEsColaborativa(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="esColaborativa"
                    className="text-sm cursor-pointer"
                  >
                    Playlist colaborativa (otros pueden agregar canciones)
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={creating}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !nombre.trim()}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creando..." : "Crear Playlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
