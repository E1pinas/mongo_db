import type { TipoPestaña } from "../tipos";
import { Music, Users, FileText, Disc, ListMusic } from "lucide-react";

interface PropsPestañas {
  pestañaActiva: TipoPestaña;
  alCambiarPestaña: (pestaña: TipoPestaña) => void;
  totalCanciones: number;
  totalAlbumes: number;
  totalPlaylists: number;
  totalSeguidores: number;
  totalSiguiendo: number;
}

export const Pestañas: React.FC<PropsPestañas> = ({
  pestañaActiva,
  alCambiarPestaña,
  totalCanciones,
  totalAlbumes,
  totalPlaylists,
  totalSeguidores,
  totalSiguiendo,
}) => {
  const pestañas = [
    {
      id: "posts" as TipoPestaña,
      nombre: "Posts",
      icono: <FileText className="w-5 h-5" />,
    },
    {
      id: "canciones" as TipoPestaña,
      nombre: "Canciones",
      icono: <Music className="w-5 h-5" />,
      badge: totalCanciones,
    },
    {
      id: "albumes" as TipoPestaña,
      nombre: "Álbumes",
      icono: <Disc className="w-5 h-5" />,
      badge: totalAlbumes,
    },
    {
      id: "playlists" as TipoPestaña,
      nombre: "Playlists",
      icono: <ListMusic className="w-5 h-5" />,
      badge: totalPlaylists,
    },
    {
      id: "seguidores" as TipoPestaña,
      nombre: "Seguidores",
      icono: <Users className="w-5 h-5" />,
      badge: totalSeguidores,
    },
    {
      id: "siguiendo" as TipoPestaña,
      nombre: "Siguiendo",
      icono: <Users className="w-5 h-5" />,
      badge: totalSiguiendo,
    },
  ];

  return (
    <div className="bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {pestañas.map((pestaña) => (
            <button
              key={pestaña.id}
              onClick={() => alCambiarPestaña(pestaña.id)}
              className={`flex items-center gap-2 px-5 py-3.5 font-medium transition-all whitespace-nowrap relative ${
                pestañaActiva === pestaña.id
                  ? "text-white border-b-2 border-orange-500"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {pestaña.nombre}
              {pestaña.badge !== undefined && pestaña.badge > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    pestañaActiva === pestaña.id
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {pestaña.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
