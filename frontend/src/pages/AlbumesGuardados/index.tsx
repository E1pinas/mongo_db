import { LoadingSpinner } from "../../components/common";
import { useAlbumesGuardados } from "./hooks";
import { CabeceraAlbumes, GridAlbumes, EstadoVacio } from "./componentes";

export default function AlbumesGuardados() {
  const { albumes, cargando } = useAlbumesGuardados();

  if (cargando) {
    return <LoadingSpinner />;
  }

  // Separar álbumes por recientes y todos
  const albumesRecientes = albumes.slice(0, 6);
  const todosLosAlbumes = albumes;

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      <CabeceraAlbumes totalAlbumes={albumes.length} />

      <div className="px-6 pb-20">
        {albumes.length === 0 ? (
          <EstadoVacio />
        ) : (
          <div className="space-y-12">
            {/* Sección de álbumes recientes */}
            {albumesRecientes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Agregados recientemente
                </h2>
                <GridAlbumes albumes={albumesRecientes} />
              </div>
            )}

            {/* Sección de todos los álbumes */}
            {todosLosAlbumes.length > 6 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Todos los álbumes
                </h2>
                <GridAlbumes albumes={todosLosAlbumes} />
              </div>
            )}

            {/* Si solo hay 6 o menos, mostrar todo */}
            {todosLosAlbumes.length <= 6 && albumesRecientes.length === 0 && (
              <GridAlbumes albumes={todosLosAlbumes} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
