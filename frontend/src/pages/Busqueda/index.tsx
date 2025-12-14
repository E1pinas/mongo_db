import { useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import { useBusqueda } from "./hooks";
import {
  BarraBusqueda,
  SeccionCanciones,
  SeccionAlbumes,
  SeccionPlaylists,
  SeccionUsuarios,
  SinResultados,
  EstadoInicial,
} from "./componentes";
import { SongCommentsModal } from "../../components/musica";
import type { Cancion } from "../../types";

const Search = () => {
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const { resultados, estado, totalResults, handleSearch, reloadSongs } =
    useBusqueda();
  const [selectedSongForComments, setSelectedSongForComments] =
    useState<Cancion | null>(null);

  const handlePlaySong = (index: number) => {
    playQueue(resultados.canciones, index);
  };

  const handlePlayAll = () => {
    playQueue(resultados.canciones, 0);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      <BarraBusqueda
        query={estado.query}
        totalResults={totalResults}
        alBuscar={handleSearch}
      />

      <div className="px-6 pb-20">
        {/* Estado de carga */}
        {estado.cargando && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-neutral-400">
              Buscando en toda la biblioteca...
            </p>
          </div>
        )}

        {/* Resultados */}
        {!estado.cargando && estado.searched && totalResults > 0 && (
          <div className="space-y-12">
            <SeccionCanciones
              canciones={resultados.canciones}
              currentSong={currentSong}
              isPlaying={isPlaying}
              alReproducir={handlePlaySong}
              alReproducirTodo={handlePlayAll}
              alCambioLike={reloadSongs}
            />

            <SeccionAlbumes albumes={resultados.albumes} />

            <SeccionPlaylists playlists={resultados.playlists} />

            <SeccionUsuarios usuarios={resultados.usuarios} />
          </div>
        )}

        {/* Sin resultados */}
        {!estado.cargando &&
          estado.searched &&
          totalResults === 0 &&
          estado.query.trim() && <SinResultados query={estado.query} />}

        {/* Estado inicial */}
        {!estado.searched && (
          <EstadoInicial alSeleccionarGenero={handleSearch} />
        )}
      </div>

      {/* Modal de comentarios */}
      {selectedSongForComments && (
        <SongCommentsModal
          song={selectedSongForComments}
          onClose={() => setSelectedSongForComments(null)}
        />
      )}
    </div>
  );
};

export default Search;
