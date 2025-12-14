import { useRef } from "react";

interface SelectorPortadaProps {
  portadaFile: File | null;
  portadaPreview: string;
  onCambioPortada: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SelectorPortada = ({
  portadaFile,
  portadaPreview,
  onCambioPortada,
}: SelectorPortadaProps) => {
  const portadaInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800">
      <label className="block text-sm font-bold mb-3 text-purple-400">
        Portada (opcional)
      </label>
      <div className="flex items-center gap-6">
        {portadaPreview && (
          <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 border-2 border-purple-500/30 shadow-lg shadow-purple-500/10">
            <img
              src={portadaPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div
          onClick={() => portadaInputRef.current?.click()}
          className="group flex-1 border-2 border-dashed border-neutral-700 hover:border-purple-500/50 rounded-xl p-6 cursor-pointer transition-all hover:bg-purple-500/5"
        >
          <input
            ref={portadaInputRef}
            type="file"
            accept="image/*"
            onChange={onCambioPortada}
            className="hidden"
          />
          {portadaFile ? (
            <div>
              <p className="text-green-400 font-semibold mb-1">
                ✓ {portadaFile.name}
              </p>
              <p className="text-sm text-neutral-400">
                {(portadaFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-linear-to-br from-neutral-800 to-neutral-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-neutral-400 group-hover:text-purple-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-white font-medium mb-1 group-hover:text-purple-400 transition-colors">
                Click para subir imagen
              </p>
              <p className="text-xs text-neutral-500">
                JPG, PNG, WebP (Máx. 5MB)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
