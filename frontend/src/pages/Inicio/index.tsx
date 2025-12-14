import { usePlayer } from "../../contexts/PlayerContext";
import { useDatosInicio, useAccionesInicio } from "./hooks";
import {
  SeccionHero,
  SeccionMisCanciones,
  SeccionAlbumes,
  SeccionPlaylists,
  SeccionUsuariosSugeridos,
} from "./componentes";
import SongCommentsModal from "../../components/musica/SongCommentsModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Home = () => {
  const { playQueue } = usePlayer();
  const {
    misCanciones,
    albumesRecientes,
    playlistsPopulares,
    usuariosSugeridos,
    cargando,
    error,
    setMisCanciones,
    setUsuariosSugeridos,
  } = useDatosInicio();

  const {
    comentariosCancion,
    setComentariosCancion,
    handleToggleLike,
    handleFollowUser,
  } = useAccionesInicio({
    misCanciones,
    setMisCanciones,
    setUsuariosSugeridos,
  });

  const handlePlaySong = (_cancion: any, index: number) => {
    playQueue(misCanciones, index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-black to-black">
      <SeccionHero />

      {error && (
        <div className="mx-6 mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="px-6 pb-20">
        <SeccionMisCanciones
          canciones={misCanciones}
          alReproducir={handlePlaySong}
          alToggleLike={handleToggleLike}
          alAbrirComentarios={setComentariosCancion}
        />

        {cargando && <LoadingSpinner text="Cargando contenido..." />}

        <SeccionAlbumes albumes={albumesRecientes} />

        <SeccionPlaylists playlists={playlistsPopulares} />

        <SeccionUsuariosSugeridos
          usuarios={usuariosSugeridos}
          alSeguir={handleFollowUser}
        />
      </div>

      {comentariosCancion && (
        <SongCommentsModal
          song={comentariosCancion}
          onClose={() => setComentariosCancion(null)}
        />
      )}
    </div>
  );
};

export default Home;
