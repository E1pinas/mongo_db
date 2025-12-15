interface CampoNombreArtisticoProps {
  valor: string;
  alCambiar: (valor: string) => void;
  deshabilitado?: boolean;
}

export const CampoNombreArtistico = ({
  valor,
  alCambiar,
  deshabilitado = false,
}: CampoNombreArtisticoProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-300 mb-2.5">
        Nombre Artístico
      </label>
      <input
        type="text"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        disabled={deshabilitado}
        className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 transition-all backdrop-blur-sm"
        placeholder="Tu nombre artístico"
        maxLength={50}
      />
    </div>
  );
};
