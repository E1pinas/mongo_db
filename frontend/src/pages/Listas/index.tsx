import { useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CabeceraListas } from "./componentes/CabeceraListas";
import { ListaPlaylists } from "./componentes/ListaPlaylists";
import { ModalCrearPlaylist } from "./componentes/ModalCrearPlaylist";
import { useDatosListas } from "./hooks/useDatosListas";

const Listas = () => {
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);

  const {
    misPlaylists,
    playlistsPublicas,
    cargando,
    error,
    setError,
    recargarPlaylists,
  } = useDatosListas();

  const manejarPlaylistCreada = async () => {
    setMostrarModalCrear(false);
    await recargarPlaylists();
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner text="Cargando playlists..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={() => {
              setError("");
              recargarPlaylists();
            }}
            className="rounded-lg bg-green-500 px-6 py-2 font-semibold transition-colors hover:bg-green-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CabeceraListas onClickCrear={() => setMostrarModalCrear(true)} />

      <div className="space-y-12 px-6 pb-32 pt-8">
        <ListaPlaylists
          titulo="Tus Playlists"
          descripcion="Tus colecciones musicales personalizadas"
          playlists={misPlaylists}
          colorGradiente="from-green-400 to-blue-500"
          mensajeVacio="¡Crea tu primera playlist y empieza a organizar tu música!"
          accionVacia={() => setMostrarModalCrear(true)}
          labelAccionVacia="Crear Playlist"
        />

        <ListaPlaylists
          titulo="Descubre Playlists"
          descripcion="Playlists públicas de la comunidad"
          playlists={playlistsPublicas}
          colorGradiente="from-blue-400 to-purple-500"
        />
      </div>

      <ModalCrearPlaylist
        mostrar={mostrarModalCrear}
        onCerrar={() => setMostrarModalCrear(false)}
        onPlaylistCreada={manejarPlaylistCreada}
      />
    </div>
  );
};

export default Listas;
