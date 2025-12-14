import { Plus } from "lucide-react";

interface CabeceraAlbumesProps {
  onClickCrear: () => void;
}

export const CabeceraAlbumes = ({ onClickCrear }: CabeceraAlbumesProps) => {
  return (
    <div className="relative mb-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Mis Álbumes</h1>
          <p className="text-white/90">Crea y gestiona tus álbumes musicales</p>
        </div>
        <button
          onClick={onClickCrear}
          className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-orange-600 transition hover:bg-orange-50"
        >
          <Plus size={20} />
          Crear Álbum
        </button>
      </div>
    </div>
  );
};
