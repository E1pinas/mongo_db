import { Music } from "lucide-react";

interface MensajeCompartidoProps {
  mensaje: string;
  mostrarBeneficios: boolean;
}

export const MensajeCompartido = ({
  mensaje,
  mostrarBeneficios,
}: MensajeCompartidoProps) => {
  return (
    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-neutral-800/50 border-2 border-neutral-700 rounded-2xl backdrop-blur-md">
      <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center shrink-0">
          <Music size={18} className="sm:hidden text-white" />
          <Music size={20} className="hidden sm:block text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-bold text-white mb-1">
            Canción Compartida
          </p>
          <p className="text-xs text-neutral-400">
            {mensaje || "Un usuario compartió esta música contigo"}
          </p>
        </div>
      </div>

      {mostrarBeneficios && (
        <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4 border-t border-neutral-700">
          <p className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
            Beneficios de Miembro
          </p>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-start gap-2 sm:gap-2.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500"></div>
              </div>
              <p className="text-xs text-neutral-300">
                Interactúa con artistas y comunidad
              </p>
            </div>
            <div className="flex items-start gap-2 sm:gap-2.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-xs text-neutral-300">
                Organiza tu música en playlists personalizadas
              </p>
            </div>
            <div className="flex items-start gap-2 sm:gap-2.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></div>
              </div>
              <p className="text-xs text-neutral-300">
                Descubre nuevos artistas y tendencias
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
