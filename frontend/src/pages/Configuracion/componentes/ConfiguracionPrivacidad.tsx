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
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Privacidad</h3>
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-white">Perfil Público</p>
              <p className="text-sm text-gray-400 mt-1">
                Permitir que cualquiera vea tu perfil
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.perfilPublico}
              onChange={(e) => alCambiar("perfilPublico", e.target.checked)}
              disabled={deshabilitado}
              className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 disabled:opacity-50"
            />
          </label>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-white">Recibir Solicitudes</p>
              <p className="text-sm text-gray-400 mt-1">
                Permitir que otros usuarios te envíen solicitudes de amistad
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.recibirSolicitudes}
              onChange={(e) =>
                alCambiar("recibirSolicitudes", e.target.checked)
              }
              disabled={deshabilitado}
              className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 disabled:opacity-50"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
