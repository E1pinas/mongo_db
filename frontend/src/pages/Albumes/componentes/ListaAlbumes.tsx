import type { Album } from "../../../types";
import { MediaGrid } from "../../../components/common";
import { AlbumCard } from "../../../components/musica";
import { usePlayer } from "../../../contexts";

interface ListaAlbumesProps {
  titulo: string;
  albumes: Album[];
  cargando: boolean;
  mensajeSinAlbumes?: string;
}

export const ListaAlbumes = ({
  titulo,
  albumes,
  cargando,
  mensajeSinAlbumes = "No hay álbumes disponibles",
}: ListaAlbumesProps) => {
  const { playQueue } = usePlayer();

  const manejarReproducirAlbum = async (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Reproduciendo álbum:", album);
    if (album.canciones && album.canciones.length > 0) {
      const canciones = album.canciones.map((cancion: any) =>
        typeof cancion === "string" ? { _id: cancion } : cancion
      );
      await playQueue(canciones as any, 0, {
        type: "album",
        id: album._id,
        name: album.titulo,
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        {titulo}
      </h2>
      {cargando ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : albumes.length === 0 ? (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          {mensajeSinAlbumes}
        </p>
      ) : (
        <MediaGrid>
          {albumes.map((album) => (
            <AlbumCard
              key={album._id}
              album={album}
              onPlay={(e) => manejarReproducirAlbum(album, e)}
            />
          ))}
        </MediaGrid>
      )}
    </div>
  );
};
