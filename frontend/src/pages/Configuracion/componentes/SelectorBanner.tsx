import { Camera, X } from "lucide-react";

interface SelectorBannerProps {
  bannerPreview: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  alCambiar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  alEliminar: () => void;
  deshabilitado?: boolean;
}

export const SelectorBanner = ({
  bannerPreview,
  inputRef,
  alCambiar,
  alEliminar,
  deshabilitado = false,
}: SelectorBannerProps) => {
  return (
    <div className="relative h-48 bg-gray-800 rounded-lg overflow-hidden group">
      {bannerPreview && (
        <img
          src={bannerPreview}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={deshabilitado}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Cambiar Banner
        </button>
        {bannerPreview && (
          <button
            type="button"
            onClick={alEliminar}
            disabled={deshabilitado}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Quitar
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={alCambiar}
        className="hidden"
        disabled={deshabilitado}
      />

      <p className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
        Recomendado: 1500x500px
      </p>
    </div>
  );
};
