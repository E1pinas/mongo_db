import { Plus } from "lucide-react";

interface CabeceraListasProps {
  onClickCrear: () => void;
}

export const CabeceraListas = ({ onClickCrear }: CabeceraListasProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
      <div className="relative px-6 pb-12 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-green-500 to-blue-600 shadow-xl">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-green-400">
                  TU COLECCIÓN
                </p>
                <h1 className="bg-linear-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-5xl font-black text-transparent">
                  Playlists
                </h1>
                <p className="mt-2 text-neutral-300">
                  Crea y gestiona tus playlists personalizadas
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClickCrear}
            className="flex items-center gap-3 rounded-full bg-linear-to-r from-green-500 to-blue-600 px-8 py-4 text-lg font-bold shadow-lg transition-all hover:scale-105 hover:from-green-600 hover:to-blue-700"
          >
            <Plus size={20} />
            Crear Playlist
          </button>
        </div>
      </div>
    </div>
  );
};
