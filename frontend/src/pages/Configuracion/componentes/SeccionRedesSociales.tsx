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
    <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
        Redes Sociales
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {redes.map(({ campo, label, placeholder }) => (
          <div key={campo}>
            <label className="block text-sm font-semibold text-neutral-300 mb-2.5">
              {label}
            </label>
            <input
              type="text"
              value={formData[campo]}
              onChange={(e) => alCambiar(campo, e.target.value)}
              disabled={deshabilitado}
              className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 transition-all"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
