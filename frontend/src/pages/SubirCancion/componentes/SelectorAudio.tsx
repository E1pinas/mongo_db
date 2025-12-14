import { useRef } from "react";
import { formatDuration } from "../../../utils/formatHelpers";

interface SelectorAudioProps {
  audioFile: File | null;
  audioPreview: string;
  duracionSegundos: number;
  onCambioAudio: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SelectorAudio = ({
  audioFile,
  audioPreview,
  duracionSegundos,
  onCambioAudio,
}: SelectorAudioProps) => {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800">
      <label className="block text-sm font-bold mb-3 text-blue-400">
        Archivo de Audio <span className="text-red-400">*</span>
      </label>
      <div
        onClick={() => audioInputRef.current?.click()}
        className="group relative border-2 border-dashed border-neutral-700 hover:border-blue-500/50 rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-blue-500/5"
      >
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={onCambioAudio}
          className="hidden"
        />
        {audioFile ? (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-semibold text-lg">
                ✓ {audioFile.name}
              </p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-neutral-400">
                <span>{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                {duracionSegundos > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(duracionSegundos)}</span>
                  </>
                )}
              </div>
            </div>
            {audioPreview && (
              <div className="mt-6">
                <audio
                  ref={audioRef}
                  src={audioPreview}
                  controls
                  className="w-full max-w-md mx-auto rounded-lg"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-linear-to-br from-neutral-800 to-neutral-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-10 h-10 text-neutral-400 group-hover:text-blue-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
              Click para seleccionar un archivo de audio
            </p>
            <p className="text-sm text-neutral-500">
              MP3, WAV, FLAC, AAC, OGG (Máx. 50MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
