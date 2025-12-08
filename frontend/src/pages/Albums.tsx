import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Upload, Search } from "lucide-react";
import { musicService } from "../services/music.service";
import { usePlayer, useAuth } from "../contexts";
import type { Album, Cancion } from "../types";
import { formatTimeAgo } from "../utils/dateFormat";
import {
  Button,
  LoadingSpinner,
  EmptyState,
  SectionHeader,
  MediaGrid,
} from "../components/common";
import { AlbumCard } from "../components/musica";

/**
 * Albums - Página de álbumes
 *
 * Muestra la colección de álbumes del usuario y públicos con modal de creación
 */

export default function Albums() {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const { user } = useAuth();
  const [misAlbumes, setMisAlbumes] = useState<Album[]>([]);
  const [albumesPublicos, setAlbumesPublicos] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("Todo");

  // Modal de creación
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [generos, setGeneros] = useState<string[]>([]);
  const [fechaLanzamiento, setFechaLanzamiento] = useState("");
  const [esPrivado, setEsPrivado] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string>("");

  // Para agregar canciones
  const [cancionesBuscadas, setCancionesBuscadas] = useState<Cancion[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const genres = [
    "Todo",
    "rock",
    "pop",
    "jazz",
    "electronic",
    "hiphop",
    "classical",
    "reggaeton",
    "indie",
    "latino",
    "urbano",
  ];

  const generosDisponibles = genres.filter((g) => g !== "Todo");

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setIsLoading(true);
      const [misAlbums, publicAlbums] = await Promise.all([
        musicService.getMyAlbums(),
        musicService.getPublicAlbums(),
      ]);
      console.log("Mis álbumes:", misAlbums);
      console.log("Álbumes públicos:", publicAlbums);
      setMisAlbumes(misAlbums);
      setAlbumesPublicos(publicAlbums);
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMyAlbums =
    selectedGenre === "Todo"
      ? misAlbumes
      : misAlbumes.filter((album) => album.generos?.includes(selectedGenre));

  // Filtrar álbumes públicos excluyendo los del usuario actual
  const albumesDeOtros = albumesPublicos.filter((album) => {
    // Verificar si algún artista del álbum es el usuario actual
    const esDelUsuario = album.artistas?.some((artista: any) =>
      typeof artista === "string"
        ? artista === user?._id
        : artista._id === user?._id
    );
    return !esDelUsuario;
  });

  const filteredPublicAlbums =
    selectedGenre === "Todo"
      ? albumesDeOtros
      : albumesDeOtros.filter((album) =>
          album.generos?.includes(selectedGenre)
        );

  const handlePlayAlbum = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    if (Array.isArray(album.canciones) && album.canciones.length > 0) {
      const songs = album.canciones.filter(
        (c) => typeof c !== "string" && c.titulo
      );
      if (songs.length > 0) {
        playQueue(songs as any[], 0);
      }
    }
  };

  const getArtistNames = (artistas: any[]) => {
    if (!artistas || artistas.length === 0) return "Artista";
    if (typeof artistas[0] === "string") return "Artista";
    return artistas
      .map((a) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  const getAlbumYear = (fecha?: string) => {
    if (!fecha) return new Date().getFullYear();
    return new Date(fecha).getFullYear();
  };

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      return;
    }

    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
    setError("");
  };

  const toggleGenero = (genero: string) => {
    setGeneros((prev) =>
      prev.includes(genero)
        ? prev.filter((g) => g !== genero)
        : [...prev, genero]
    );
  };

  const toggleSong = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSearchSongs = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setCancionesBuscadas([]);
      return;
    }

    try {
      setSearching(true);
      const results = await musicService.searchMySongs(query);
      setCancionesBuscadas(results);
    } catch (err) {
      console.error("Error searching songs:", err);
    } finally {
      setSearching(false);
    }
  };

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setGeneros([]);
    setFechaLanzamiento("");
    setEsPrivado(false);
    setPortadaFile(null);
    setPortadaPreview("");
    setSelectedSongs([]);
    setCancionesBuscadas([]);
    setSearchQuery("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }

    try {
      setCreating(true);

      // 1. Subir portada si existe
      let portadaUrl = "";
      if (portadaFile) {
        try {
          const imageData = await musicService.subirImagen(portadaFile);
          portadaUrl = imageData.imagenUrl;
        } catch (uploadError: any) {
          setError(`Error al subir la imagen: ${uploadError.message}`);
          setCreating(false);
          return;
        }
      }

      // 2. Crear álbum
      const albumData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        portadaUrl: portadaUrl,
        generos: generos,
        fechaLanzamiento: fechaLanzamiento || undefined,
        esPrivado: esPrivado,
      };

      const response = await fetch("http://localhost:3900/api/albumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(albumData),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message || "Error al crear el álbum");
        setCreating(false);
        return;
      }

      const nuevoAlbum = data.album;

      // 3. Agregar canciones seleccionadas
      for (const songId of selectedSongs) {
        try {
          await musicService.addSongToAlbum(nuevoAlbum._id, songId);
        } catch (err) {
          console.error("Error adding song to album:", err);
        }
      }

      // Recargar álbumes y cerrar modal
      await loadAlbums();
      setShowCreateModal(false);
      resetForm();

      // Navegar al álbum creado
      navigate(`/album/${nuevoAlbum._id}`);
    } catch (err: any) {
      console.error("Error creating album:", err);
      setError(err.message || "Error al crear el álbum");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Álbumes</h1>
            <p className="text-neutral-400">Descubre álbumes de la comunidad</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} variant="secondary">
            <Plus size={20} className="mr-2" />
            Crear álbum
          </Button>
        </div>
      </div>

      {/* Filtros por género */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              selectedGenre === genre
                ? "bg-white text-black scale-105"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && <LoadingSpinner />}

      {/* Mis álbumes */}
      {!isLoading && filteredMyAlbums.length > 0 && (
        <section className="mb-12">
          <SectionHeader
            title={
              selectedGenre === "Todo"
                ? "Tus álbumes"
                : `Tus álbumes de ${selectedGenre}`
            }
          />
          <MediaGrid>
            {filteredMyAlbums.map((album) => (
              <AlbumCard
                key={album._id}
                album={album}
                onClick={() => navigate(`/album/${album._id}`)}
                onPlay={(e) => handlePlayAlbum(album, e)}
              />
            ))}
          </MediaGrid>
        </section>
      )}

      {/* Álbumes públicos */}
      {!isLoading && filteredPublicAlbums.length > 0 && (
        <section className="mb-12">
          <SectionHeader
            title={
              selectedGenre === "Todo"
                ? "Descubre álbumes"
                : `Álbumes de ${selectedGenre}`
            }
          />
          <MediaGrid>
            {filteredPublicAlbums.map((album) => (
              <AlbumCard
                key={album._id}
                album={album}
                onClick={() => navigate(`/album/${album._id}`)}
                onPlay={(e) => handlePlayAlbum(album, e)}
              />
            ))}
          </MediaGrid>
        </section>
      )}

      {/* Modal de crear álbum */}
      {!isLoading &&
        filteredMyAlbums.length === 0 &&
        filteredPublicAlbums.length === 0 && (
          <div className="text-center py-20">
            <Music size={64} className="text-neutral-600 mx-auto mb-4" />
            <p className="text-xl text-neutral-400 mb-2">
              {selectedGenre === "Todo"
                ? "No hay álbumes disponibles"
                : `No hay álbumes de ${selectedGenre}`}
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              {selectedGenre === "Todo"
                ? "Sé el primero en crear un álbum"
                : "Intenta con otro género"}
            </p>
          </div>
        )}

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Crear álbum</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                disabled={creating}
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Título del álbum *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Mi nuevo álbum"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={creating}
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
                  placeholder="Describe tu álbum..."
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  disabled={creating}
                />
              </div>

              {/* Fecha de lanzamiento */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Fecha de lanzamiento
                </label>
                <input
                  type="date"
                  value={fechaLanzamiento}
                  onChange={(e) => setFechaLanzamiento(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={creating}
                />
              </div>

              {/* Géneros */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Géneros
                </label>
                <div className="flex flex-wrap gap-2">
                  {generosDisponibles.map((genero) => (
                    <button
                      key={genero}
                      type="button"
                      onClick={() => toggleGenero(genero)}
                      disabled={creating}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        generos.includes(genero)
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {genero.charAt(0).toUpperCase() + genero.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portada */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Imagen de portada
                </label>
                <div className="flex items-start gap-4">
                  {portadaPreview ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <img
                        src={portadaPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPortadaFile(null);
                          setPortadaPreview("");
                        }}
                        disabled={creating}
                        className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload size={24} className="text-neutral-500 mb-2" />
                      <span className="text-xs text-neutral-500">
                        Subir imagen
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePortadaChange}
                        disabled={creating}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="flex-1 text-sm text-neutral-400">
                    <p>Recomendado: imagen cuadrada de al menos 500x500px</p>
                    <p className="text-xs mt-1">Máximo 5MB</p>
                  </div>
                </div>
              </div>

              {/* Agregar canciones */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Canciones del álbum
                </label>
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchSongs(e.target.value)}
                    placeholder="Busca tus canciones para agregar..."
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={creating}
                  />
                </div>

                {searching && (
                  <p className="text-sm text-neutral-400 mt-2">Buscando...</p>
                )}

                {cancionesBuscadas.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    <div className="space-y-1">
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
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="esPrivado"
                  checked={esPrivado}
                  onChange={(e) => setEsPrivado(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="esPrivado" className="text-sm cursor-pointer">
                  Álbum privado (solo tú podrás verlo)
                </label>
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
                  disabled={creating || !titulo.trim()}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creando..." : "Crear álbum"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
