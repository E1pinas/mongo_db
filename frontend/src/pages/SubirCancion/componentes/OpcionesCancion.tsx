interface OpcionesCancionProps {
  esPrivada: boolean;
  esExplicita: boolean;
  onCambiarPrivacidad: (esPrivada: boolean) => void;
  onCambiarExplicita: (esExplicita: boolean) => void;
}

export const OpcionesCancion = ({
  esPrivada,
  esExplicita,
  onCambiarPrivacidad,
  onCambiarExplicita,
}: OpcionesCancionProps) => {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800 space-y-4">
      <label className="group flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-neutral-800/50 transition-all">
        <input
          type="checkbox"
          checked={esPrivada}
          onChange={(e) => onCambiarPrivacidad(e.target.checked)}
          className="w-5 h-5 mt-1 rounded bg-neutral-800 border-neutral-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="font-bold text-white">Canción Privada</span>
          </div>
          <p className="text-sm text-neutral-400">
            Solo tú podrás ver y reproducir esta canción
          </p>
        </div>
      </label>

      <label className="group flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-neutral-800/50 transition-all">
        <input
          type="checkbox"
          checked={esExplicita}
          onChange={(e) => onCambiarExplicita(e.target.checked)}
          className="w-5 h-5 mt-1 rounded bg-neutral-800 border-neutral-600 focus:ring-2 focus:ring-red-500 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-red-500 bg-red-500/20 px-2 py-1 rounded">
              E
            </span>
            <span className="font-bold text-white">Contenido Explícito</span>
          </div>
          <p className="text-sm text-neutral-400">
            Marca si contiene lenguaje o temas para adultos (+18)
          </p>
        </div>
      </label>
    </div>
  );
};
