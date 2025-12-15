import type { ConfiguracionPrivacidad } from "../tipos";

interface SeccionConfiguracionPrivacidadProps {
  privacySettings: ConfiguracionPrivacidad;
  alCambiar: (campo: keyof ConfiguracionPrivacidad, valor: boolean) => void;
  deshabilitado?: boolean;
}

export const SeccionConfiguracionPrivacidad = ({
  privacySettings,
  alCambiar,
  deshabilitado = false,
}: SeccionConfiguracionPrivacidadProps) => {
  return (
    <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
        Privacidad
      </h3>
      <div className="space-y-4">
        <div className="bg-neutral-900/50 p-5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex-1">
              <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                Perfil Público
              </p>
              <p className="text-sm text-neutral-400 mt-1.5">
                Permitir que cualquiera vea tu perfil
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={privacySettings.perfilPublico}
                onChange={(e) => alCambiar("perfilPublico", e.target.checked)}
                disabled={deshabilitado}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 peer-focus:ring-4 peer-focus:ring-purple-500/20 transition-all disabled:opacity-50" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-lg" />
            </div>
          </label>
        </div>

        <div className="bg-neutral-900/50 p-5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex-1">
              <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                Recibir Solicitudes
              </p>
              <p className="text-sm text-neutral-400 mt-1.5">
                Permitir que otros usuarios te envíen solicitudes de amistad
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={privacySettings.recibirSolicitudes}
                onChange={(e) =>
                  alCambiar("recibirSolicitudes", e.target.checked)
                }
                disabled={deshabilitado}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 peer-focus:ring-4 peer-focus:ring-purple-500/20 transition-all disabled:opacity-50" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-lg" />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
