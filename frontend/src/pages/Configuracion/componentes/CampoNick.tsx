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
      <label className="block text-sm font-semibold text-neutral-300 mb-2.5">
        Nombre de Usuario
      </label>
      <input
        type="text"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        disabled={deshabilitado}
        className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 transition-all backdrop-blur-sm"
        placeholder="usuario123"
        maxLength={30}
      />
      <p className="mt-2 text-xs text-neutral-400">
        Solo letras, números y guión bajo (_). Entre 3 y 30 caracteres.
      </p>
      {mostrarPreview && (
        <p className="mt-2 text-xs text-purple-400 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          Se guardará como:{" "}
          <span className="font-mono font-semibold">{nickNormalizado}</span>
        </p>
      )}
    </div>
  );
};
