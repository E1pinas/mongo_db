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
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Biografía
      </label>
      <textarea
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        disabled={deshabilitado}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 resize-none"
        placeholder="Cuéntanos sobre ti..."
        rows={4}
        maxLength={maxCaracteres}
      />
      <p className="mt-1 text-xs text-gray-400 text-right">
        {caracteresRestantes} caracteres restantes
      </p>
    </div>
  );
};
