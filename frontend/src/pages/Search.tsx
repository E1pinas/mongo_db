import { useState } from "react";
import { Heart, Music, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { musicService } from "../services/music.service";
import { authService } from "../services/auth.service";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts";
import SongRow from "../components/musica/SongRow";
import SongCommentsModal from "../components/musica/SongCommentsModal";
import type { Cancion, Usuario, Album, Playlist } from "../types";

export default function Search() {
  const { user } = useAuth();
  const { playSong, playQueue, currentSong, isPlaying } = usePlayer();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [albumes, setAlbumes] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim() || searchQuery.length < 2) {
      setCanciones([]);
      setAlbumes([]);
      setPlaylists([]);
      setUsuarios([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      // Buscar en paralelo canciones, álbumes, playlists y usuarios
      const [songs, albums, playlistResults, users] = await Promise.all([
        musicService.searchSongs(searchQuery),
        musicService.searchAlbums(searchQuery),
        musicService.getPublicPlaylists(), // Luego filtraremos por título
        authService.searchUsers(searchQuery),
      ]);

      // Filtrar playlists por el query
      const filteredPlaylists = playlistResults.filter((p) =>
        p.titulo?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setCanciones(songs);
      setAlbumes(albums);
      setPlaylists(filteredPlaylists);
      setUsuarios(users);
    } catch (err: any) {
      console.error("Error searching:", err);
      setCanciones([]);
      setAlbumes([]);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (index: number) => {
    playQueue(canciones, index);
  };

  const reloadSearchResults = async () => {
    if (query.trim() && query.length >= 2) {
      try {
        const songs = await musicService.searchSongs(query);
        setCanciones(songs);
      } catch (error) {
        console.error("Error reloading search:", error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getArtistName = (artistas: string[] | Usuario[]) => {
    if (!artistas || artistas.length === 0) return "Artista desconocido";

    if (typeof artistas[0] === "string") {
      return "Artista";
    }

    const artistasPopulados = artistas as Usuario[];
    return artistasPopulados
      .map((a) => a.nombreArtistico || a.nick || a.nombre)
      .join(", ");
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Buscar</h1>

        {/* Barra de búsqueda */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="¿Qué quieres escuchar?"
            className="w-full px-6 py-4 pl-14 bg-white text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-medium"
            autoFocus
          />
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 text-black"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-neutral-600 border-t-white rounded-full animate-spin"></div>
          <p className="text-neutral-400 mt-4">Buscando...</p>
        </div>
      )}

      {/* Resultados */}
      {!loading &&
        searched &&
        (canciones.length > 0 ||
          albumes.length > 0 ||
          playlists.length > 0 ||
          usuarios.length > 0) && (
          <div className="space-y-8">
            {/* Canciones */}
            {canciones.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Canciones ({canciones.length})
                  </h2>
                  <button
                    onClick={() => playQueue(canciones, 0)}
                    className="px-4 py-2 bg-green-500 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    Reproducir todo
                  </button>
                </div>

                <div className="space-y-2">
                  {canciones.map((cancion, index) => {
                    const isCurrentSong = currentSong?._id === cancion._id;
                    return (
                      <SongRow
                        key={cancion._id}
                        cancion={cancion}
                        index={index}
                        isCurrentSong={isCurrentSong}
                        isPlaying={isPlaying}
                        onPlay={() => handlePlaySong(index)}
                        onLikeChange={() => reloadSearchResults()}
                        hideComments={true}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Álbumes */}
            {albumes.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  Álbumes ({albumes.length})
                </h2>
                <div className="space-y-2">
                  {albumes.map((album) => (
                    <div
                      key={album._id}
                      onClick={() => navigate(`/album/${album._id}`)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-neutral-700 rounded shrink-0 overflow-hidden">
                        <img
                          src={album.portadaUrl || "/cover.jpg"}
                          alt={album.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {album.titulo}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                          {album.artistas && album.artistas.length > 0
                            ? typeof album.artistas[0] === "string"
                              ? "Artista"
                              : album.artistas
                                  .map(
                                    (a: any) =>
                                      a.nombreArtistico || a.nick || a.nombre
                                  )
                                  .join(", ")
                            : "Artista"}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                        Álbum
                      </span>
                      <span className="text-sm text-neutral-400">
                        {Array.isArray(album.canciones)
                          ? album.canciones.length
                          : 0}{" "}
                        canciones
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {playlists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  Playlists ({playlists.length})
                </h2>
                <div className="space-y-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist._id}
                      onClick={() => navigate(`/playlist/${playlist._id}`)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-neutral-700 rounded shrink-0 overflow-hidden">
                        <img
                          src={playlist.portadaUrl || "/cover.jpg"}
                          alt={playlist.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {playlist.titulo}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                          {typeof playlist.creador === "string"
                            ? "Usuario"
                            : playlist.creador?.nombreArtistico ||
                              playlist.creador?.nick ||
                              playlist.creador?.nombre ||
                              "Usuario"}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        Playlist
                      </span>
                      <span className="text-sm text-neutral-400">
                        {Array.isArray(playlist.canciones)
                          ? playlist.canciones.length
                          : 0}{" "}
                        canciones
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Usuarios */}
            {usuarios.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  Usuarios ({usuarios.length})
                </h2>

                <div className="space-y-2">
                  {usuarios.map((usuario) => (
                    <div
                      key={usuario._id}
                      onClick={() => navigate(`/profile/${usuario.nick}`)}
                      className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group items-center"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={usuario.avatarUrl || "/avatar.png"}
                          alt={usuario.nombreArtistico || usuario.nick}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {usuario.nombreArtistico || usuario.nick}
                          </h3>
                          {usuario.verificado && (
                            <span className="text-blue-400 text-sm">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-400 truncate">
                          @{usuario.nick}
                        </p>
                      </div>

                      {/* Badge de tipo */}
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Artista
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      {/* Sin resultados */}
      {!loading &&
        searched &&
        canciones.length === 0 &&
        albumes.length === 0 &&
        playlists.length === 0 &&
        usuarios.length === 0 &&
        query.trim() && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-4.35-4.35"
              ></path>
            </svg>
            <h3 className="text-xl font-semibold mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-neutral-400">
              No encontramos canciones con "{query}"
            </p>
          </div>
        )}

      {/* Estado inicial */}
      {!searched && (
        <div className="text-center py-12">
          <svg
            className="w-20 h-20 mx-auto mb-6 text-neutral-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-4.35-4.35"
            ></path>
          </svg>
          <h3 className="text-2xl font-bold mb-2">Busca tu música favorita</h3>
          <p className="text-neutral-400 mb-8">
            Encuentra canciones, artistas y álbumes
          </p>

          {/* Sugerencias de búsqueda */}
          <div className="max-w-md mx-auto">
            <p className="text-sm text-neutral-500 mb-4">Búsquedas populares</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Rock", "Pop", "Reggaeton", "Indie", "Electronic"].map(
                (genre) => (
                  <button
                    key={genre}
                    onClick={() => handleSearch(genre)}
                    className="px-4 py-2 bg-neutral-800 rounded-full text-sm hover:bg-neutral-700 transition-colors"
                  >
                    {genre}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de comentarios */}
      {selectedSongForComments && (
        <SongCommentsModal
          cancion={selectedSongForComments}
          onClose={() => setSelectedSongForComments(null)}
        />
      )}
    </div>
  );
}
