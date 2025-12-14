import { ListMusic } from "lucide-react";

interface CabeceraGuardadasProps {
  totalPlaylists: number;
}

export function CabeceraGuardadas({ totalPlaylists }: CabeceraGuardadasProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
      <div className="relative px-6 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-xl">
            <ListMusic size={32} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-green-400 font-semibold mb-1">
              TU COLECCIÓN
            </p>
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Playlists Guardadas
            </h1>
          </div>
        </div>

        <div className="px-4 py-2 bg-neutral-800/50 backdrop-blur-sm rounded-full text-sm inline-block">
          <span className="text-neutral-400">Total:</span>
          <span className="ml-2 font-bold text-white">
            {totalPlaylists} {totalPlaylists === 1 ? "playlist" : "playlists"}
          </span>
        </div>
      </div>
    </div>
  );
}
