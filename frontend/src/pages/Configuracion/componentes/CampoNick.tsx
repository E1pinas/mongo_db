interface CampoNickProps {
  valor: string;
  alCambiar: (valor: string) => void;
  deshabilitado?: boolean;
}

export const CampoNick = ({
  valor,
  alCambiar,
  deshabilitado = false,
}: CampoNickProps) => {
  const nickNormalizado = valor.toLowerCase().replace(/\s+/g, "");
  const mostrarPreview = valor !== nickNormalizado;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Nombre de Usuario
      </label>
      <input
        type="text"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        disabled={deshabilitado}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
        placeholder="usuario123"
        maxLength={30}
      />
      <p className="mt-1 text-xs text-gray-400">
        Solo letras, números y guión bajo (_). Entre 3 y 30 caracteres.
      </p>
      {mostrarPreview && (
        <p className="mt-1 text-xs text-purple-400">
          Se guardará como: <span className="font-mono">{nickNormalizado}</span>
        </p>
      )}
    </div>
  );
};
