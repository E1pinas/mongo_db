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
    <div className="relative h-48 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-xl overflow-hidden group border border-neutral-800/50">
      {bannerPreview ? (
        <img
          src={bannerPreview}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">Sin banner</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={deshabilitado}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Cambiar Banner
        </button>
        {bannerPreview && (
          <button
            type="button"
            onClick={alEliminar}
            disabled={deshabilitado}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
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

      <p className="absolute bottom-3 left-3 text-xs text-neutral-400 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-700/50">
        Recomendado: 1500x500px
      </p>
    </div>
  );
};
