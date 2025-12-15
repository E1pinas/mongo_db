interface MensajeEstadoProps {
  mensaje: string;
}

export const MensajeEstado = ({ mensaje }: MensajeEstadoProps) => {
  if (!mensaje) return null;

  const esError =
    mensaje.includes("⚠️") ||
    (!mensaje.startsWith("✓") && !mensaje.includes("actualizado"));

  return (
    <div
      className={`mb-6 p-4 rounded-xl border backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
        esError
          ? "bg-red-500/10 text-red-400 border-red-500/30"
          : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border-green-500/30"
      }`}
    >
      <p className="whitespace-pre-line flex items-start gap-2 font-medium">
        {esError ? (
          <span className="text-lg">⚠️</span>
        ) : (
          <span className="text-lg">✓</span>
        )}
        <span>{mensaje.replace(/^(✓|⚠️)\s*/, "")}</span>
      </p>
    </div>
  );
};
