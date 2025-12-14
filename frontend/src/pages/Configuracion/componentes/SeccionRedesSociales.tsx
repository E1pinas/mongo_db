import type { DatosFormularioPerfil } from "../tipos";

interface SeccionRedesSocialesProps {
  formData: DatosFormularioPerfil;
  alCambiar: (campo: keyof DatosFormularioPerfil, valor: string) => void;
  deshabilitado?: boolean;
}

export const SeccionRedesSociales = ({
  formData,
  alCambiar,
  deshabilitado = false,
}: SeccionRedesSocialesProps) => {
  const redes = [
    {
      campo: "instagram" as const,
      label: "Instagram",
      placeholder: "tu_usuario",
    },
    { campo: "tiktok" as const, label: "TikTok", placeholder: "@tu_usuario" },
    { campo: "youtube" as const, label: "YouTube", placeholder: "@tu_canal" },
    { campo: "x" as const, label: "X (Twitter)", placeholder: "@tu_usuario" },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Redes Sociales</h3>
      <div className="grid grid-cols-2 gap-4">
        {redes.map(({ campo, label, placeholder }) => (
          <div key={campo}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {label}
            </label>
            <input
              type="text"
              value={formData[campo]}
              onChange={(e) => alCambiar(campo, e.target.value)}
              disabled={deshabilitado}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
