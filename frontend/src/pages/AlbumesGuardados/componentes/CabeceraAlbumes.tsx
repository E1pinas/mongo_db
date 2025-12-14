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
              TU COLECCIÓN
            </p>
            <h1 className="text-5xl font-black bg-linear-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Álbumes
            </h1>
          </div>
        </div>

        <div className="px-4 py-2 bg-neutral-800/50 backdrop-blur-sm rounded-full text-sm inline-block">
          <span className="text-neutral-400">Total:</span>
          <span className="ml-2 font-bold text-white">
            {totalAlbumes} {totalAlbumes === 1 ? "álbum" : "álbumes"}
          </span>
        </div>
      </div>
    </div>
  );
}
