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
    <div className="relative w-24 h-24 mx-auto -mt-12 group">
      <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-gray-900 overflow-hidden flex items-center justify-center">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-12 h-12 text-gray-400" />
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={deshabilitado}
        className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
      >
        <Camera className="w-6 h-6 text-white" />
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
