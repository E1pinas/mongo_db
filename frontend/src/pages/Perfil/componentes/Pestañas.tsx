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
    <div className="border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto">
          {pestañas.map((pestaña) => (
            <button
              key={pestaña.id}
              onClick={() => alCambiarPestaña(pestaña.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap relative ${
                pestañaActiva === pestaña.id
                  ? "text-white border-b-2 border-green-500"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {pestaña.icono}
              {pestaña.nombre}
              {pestaña.badge !== undefined && pestaña.badge > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-neutral-800 rounded-full text-xs">
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
