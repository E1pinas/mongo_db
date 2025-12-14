import { LoadingSpinner } from "../../components/common";
import { usePlaylistsGuardadas } from "./hooks";
import { CabeceraGuardadas, GridPlaylists, EstadoVacio } from "./componentes";

export default function PlaylistsGuardadas() {
  const { playlists, cargando } = usePlaylistsGuardadas();

  if (cargando) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      <CabeceraGuardadas totalPlaylists={playlists.length} />
      <div className="px-6 pb-20">
        {playlists.length === 0 ? (
          <EstadoVacio />
        ) : (
          <GridPlaylists playlists={playlists} />
        )}
      </div>
    </div>
  );
}
