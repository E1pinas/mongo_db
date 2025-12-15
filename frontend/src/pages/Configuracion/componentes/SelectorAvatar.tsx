import { Camera, User } from "lucide-react";

interface SelectorAvatarProps {
  avatarPreview: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  alCambiar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deshabilitado?: boolean;
}

export const SelectorAvatar = ({
  avatarPreview,
  inputRef,
  alCambiar,
  deshabilitado = false,
}: SelectorAvatarProps) => {
  return (
    <div className="relative w-32 h-32 mx-auto -mt-16 group">
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-4 border-neutral-900 overflow-hidden flex items-center justify-center shadow-2xl">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-16 h-16 text-neutral-600" />
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={deshabilitado}
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
      >
        <div className="text-center">
          <Camera className="w-7 h-7 text-white mx-auto mb-1" />
          <p className="text-xs text-white font-medium">Cambiar</p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={alCambiar}
        className="hidden"
        disabled={deshabilitado}
      />
    </div>
  );
};
