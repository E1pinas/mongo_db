import { Upload, X } from "lucide-react";

interface SelectorPortadaProps {
  portadaPreview: string;
  alCambiar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  alEliminar: () => void;
}

export const SelectorPortada = ({
  portadaPreview,
  alCambiar,
  alEliminar,
}: SelectorPortadaProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Portada del álbum
      </label>
      <div className="flex items-start gap-4">
        {portadaPreview ? (
          <div className="relative w-48 h-48 rounded-lg overflow-hidden group">
            <img
              src={portadaPreview}
              alt="Portada"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={alEliminar}
              className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="w-48 h-48 border-2 border-dashed border-neutral-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
            <Upload size={32} className="text-neutral-500 mb-2" />
            <span className="text-sm text-neutral-400">Subir portada</span>
            <span className="text-xs text-neutral-500 mt-1">
              JPG, PNG (máx 5MB)
            </span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={alCambiar}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};
