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
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Nombre Artístico
      </label>
      <input
        type="text"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        disabled={deshabilitado}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
        placeholder="Tu nombre artístico"
        maxLength={50}
      />
    </div>
  );
};
