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
      className={`mb-4 p-4 rounded-lg ${
        esError
          ? "bg-red-500/20 text-red-400 border border-red-500/50"
          : "bg-green-500/20 text-green-400 border border-green-500/50"
      }`}
    >
      <p className="whitespace-pre-line">{mensaje}</p>
    </div>
  );
};
