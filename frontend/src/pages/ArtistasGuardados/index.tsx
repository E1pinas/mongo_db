import { LoadingSpinner } from "../../components/common";
import { useArtistasGuardados } from "./hooks";
import { CabeceraArtistas, GridArtistas, EstadoVacio } from "./componentes";

export default function ArtistasGuardados() {
  const { artistas, cargando } = useArtistasGuardados();

  if (cargando) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      <CabeceraArtistas totalArtistas={artistas.length} />
      <div className="px-6 pb-20">
        {artistas.length === 0 ? (
          <EstadoVacio />
        ) : (
          <GridArtistas artistas={artistas} />
        )}
      </div>
    </div>
  );
}
