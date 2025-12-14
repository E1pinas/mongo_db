import { User } from "lucide-react";

interface CabeceraArtistasProps {
  totalArtistas: number;
}

export function CabeceraArtistas({ totalArtistas }: CabeceraArtistasProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl" />
      <div className="relative px-6 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
            <User size={32} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-400 font-semibold mb-1">
              TU COLECCIÓN
            </p>
            <h1 className="text-5xl font-black bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Artistas
            </h1>
          </div>
        </div>

        <div className="px-4 py-2 bg-neutral-800/50 backdrop-blur-sm rounded-full text-sm inline-block">
          <span className="text-neutral-400">Siguiendo:</span>
          <span className="ml-2 font-bold text-white">
            {totalArtistas} {totalArtistas === 1 ? "artista" : "artistas"}
          </span>
        </div>
      </div>
    </div>
  );
}
