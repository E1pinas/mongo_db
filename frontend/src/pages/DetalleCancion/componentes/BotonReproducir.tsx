import { Play, Pause } from "lucide-react";

interface BotonReproducirProps {
  isCurrentSong: boolean;
  isPlaying: boolean;
  onClick: () => void;
}

export const BotonReproducir = ({
  isCurrentSong,
  isPlaying,
  onClick,
}: BotonReproducirProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] transform active:scale-[0.98]"
    >
      {isCurrentSong && isPlaying ? (
        <>
          <Pause size={20} className="sm:hidden" fill="currentColor" />
          <Pause size={22} className="hidden sm:block" fill="currentColor" />
          <span>Pausar</span>
        </>
      ) : (
        <>
          <Play size={20} className="sm:hidden" fill="currentColor" />
          <Play size={22} className="hidden sm:block" fill="currentColor" />
          <span>Reproducir Ahora</span>
        </>
      )}
    </button>
  );
};
