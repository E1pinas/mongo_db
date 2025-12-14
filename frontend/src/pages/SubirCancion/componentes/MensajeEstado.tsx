interface MensajeEstadoProps {
  tipo: "exito" | "error";
  mensaje: string;
}

export const MensajeEstado = ({ tipo, mensaje }: MensajeEstadoProps) => {
  const esExito = tipo === "exito";

  return (
    <div
      className={`mb-6 p-5 ${
        esExito
          ? "bg-green-500/10 border-green-500/50"
          : "bg-red-500/10 border-red-500/50"
      } border rounded-xl backdrop-blur-sm animate-fade-in`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full ${
            esExito ? "bg-green-500/20" : "bg-red-500/20"
          } flex items-center justify-center`}
        >
          <svg
            className={`w-5 h-5 ${esExito ? "text-green-400" : "text-red-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {esExito ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            )}
          </svg>
        </div>
        {esExito ? (
          <div>
            <p className="text-green-400 font-semibold">
              ✓ Canción subida correctamente
            </p>
            <p className="text-sm text-neutral-400 mt-0.5">
              Redirigiendo a tus canciones...
            </p>
          </div>
        ) : (
          <p className="text-red-400">{mensaje}</p>
        )}
      </div>
    </div>
  );
};
