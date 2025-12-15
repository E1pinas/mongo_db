interface CampoBiografiaProps {
  valor: string;
  alCambiar: (valor: string) => void;
  deshabilitado?: boolean;
}

export const CampoBiografia = ({
  valor,
  alCambiar,
  deshabilitado = false,
}: CampoBiografiaProps) => {
  const maxCaracteres = 200;
  const caracteresRestantes = maxCaracteres - valor.length;

  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-300 mb-2.5">
        Biografía
      </label>
      <textarea
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        disabled={deshabilitado}
        className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 resize-none transition-all backdrop-blur-sm"
        placeholder="Cuéntanos sobre ti..."
        rows={4}
        maxLength={maxCaracteres}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-neutral-500">Describe tu música y estilo</p>
        <p
          className={`text-xs font-medium ${
            caracteresRestantes < 20 ? "text-orange-400" : "text-neutral-400"
          }`}
        >
          {caracteresRestantes}/{maxCaracteres}
        </p>
      </div>
    </div>
  );
};
