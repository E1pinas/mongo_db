import { LIMITES_ARCHIVO } from "../utils/constantes";

interface CampoTituloProps {
  titulo: string;
  onCambioTitulo: (titulo: string) => void;
}

export const CampoTitulo = ({ titulo, onCambioTitulo }: CampoTituloProps) => {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800">
      <label className="block text-sm font-bold mb-3 text-pink-400">
        Título <span className="text-red-400">*</span>
      </label>
      <input
        type="text"
        value={titulo}
        onChange={(e) => onCambioTitulo(e.target.value)}
        placeholder="Nombre de tu canción"
        className="w-full px-5 py-4 bg-neutral-800/80 border-2 border-neutral-700 rounded-xl focus:outline-none focus:border-pink-500 focus:bg-neutral-800 transition-all text-lg"
        maxLength={LIMITES_ARCHIVO.TITULO_MAX_CHARS}
      />
      <p className="text-xs text-neutral-500 mt-2">
        {titulo.length}/{LIMITES_ARCHIVO.TITULO_MAX_CHARS} caracteres
      </p>
    </div>
  );
};
