import { X } from "lucide-react";

interface CabeceraModalProps {
  alCerrar: () => void;
}

export const CabeceraModal = ({ alCerrar }: CabeceraModalProps) => {
  return (
    <div className="relative">
      <button
        onClick={alCerrar}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-red-500 transition-colors border border-neutral-600 hover:border-red-400"
      >
        <X size={20} className="sm:hidden text-white" strokeWidth={2.5} />
        <X size={22} className="hidden sm:block text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
};
