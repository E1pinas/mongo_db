import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
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
      icon: FaInstagram,
      placeholder: "tu_usuario",
      color: "text-pink-500",
      helpText: "Solo tu nombre de usuario (sin @)",
    },
    {
      campo: "tiktok" as const,
      label: "TikTok",
      icon: FaTiktok,
      placeholder: "tu_usuario",
      color: "text-white",
      helpText: "Solo tu nombre de usuario (con o sin @)",
    },
    {
      campo: "youtube" as const,
      label: "YouTube",
      icon: FaYoutube,
      placeholder: "tu_canal",
      color: "text-red-500",
      helpText: "Tu nombre de canal o handle (con o sin @)",
    },
    {
      campo: "x" as const,
      label: "X (Twitter)",
      icon: FaXTwitter,
      placeholder: "tu_usuario",
      color: "text-white",
      helpText: "Solo tu nombre de usuario (con o sin @)",
    },
  ];

  return (
    <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
        Redes Sociales
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {redes.map(
          ({ campo, label, icon: Icon, placeholder, color, helpText }) => (
            <div key={campo}>
              <label className="block text-sm font-semibold text-neutral-300 mb-2.5 flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
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
              <p className="text-xs text-neutral-500 mt-1.5">{helpText}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
