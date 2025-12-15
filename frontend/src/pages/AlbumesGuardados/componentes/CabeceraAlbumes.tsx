import { Disc } from "lucide-react";

interface CabeceraAlbumesProps {
  totalAlbumes: number;
}

export function CabeceraAlbumes({ totalAlbumes }: CabeceraAlbumesProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 blur-3xl" />
      <div className="relative px-6 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
            <Disc size={32} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-orange-400 font-semibold mb-1">
              TU BIBLIOTECA
            </p>
            <h1 className="text-5xl font-black bg-linear-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Álbumes
            </h1>
          </div>
        </div>

        <p className="text-neutral-400 text-sm">
          {totalAlbumes === 0
            ? "Aún no has guardado ningún álbum"
            : `${totalAlbumes} ${
                totalAlbumes === 1 ? "álbum guardado" : "álbumes guardados"
              }`}
        </p>
      </div>
    </div>
  );
}
