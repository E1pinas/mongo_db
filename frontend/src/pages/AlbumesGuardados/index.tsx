import { LoadingSpinner } from "../../components/common";
import { useAlbumesGuardados } from "./hooks";
import { CabeceraAlbumes, GridAlbumes, EstadoVacio } from "./componentes";

export default function AlbumesGuardados() {
  const { albumes, cargando } = useAlbumesGuardados();

  if (cargando) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      <CabeceraAlbumes totalAlbumes={albumes.length} />
      <div className="px-6 pb-20">
        {albumes.length === 0 ? (
          <EstadoVacio />
        ) : (
          <GridAlbumes albumes={albumes} />
        )}
      </div>
    </div>
  );
}
