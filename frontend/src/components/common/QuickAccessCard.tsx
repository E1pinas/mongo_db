import { Play } from "lucide-react";

interface QuickAccessCardProps {
  title: string;
  imageUrl?: string;
  gradient?: string;
  isRounded?: boolean;
  onClick?: () => void;
  onPlay?: (e: React.MouseEvent) => void;
}

/**
 * QuickAccessCard - Tarjeta de acceso rápido horizontal
 */
export default function QuickAccessCard({
  title,
  imageUrl,
  gradient,
  isRounded = false,
  onClick,
  onPlay,
}: QuickAccessCardProps) {
  return (
    <div
      className="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors cursor-pointer group flex items-center gap-4"
      onClick={onClick}
    >
      <div
        className={`w-20 h-20 shrink-0 ${
          gradient ? gradient : "bg-neutral-700"
        } ${isRounded ? "rounded-full" : ""}`}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <p className="font-semibold truncate pr-4">{title}</p>
      {onPlay && (
        <button
          onClick={onPlay}
          className="ml-auto mr-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105"
        >
          <Play size={24} fill="currentColor" />
        </button>
      )}
    </div>
  );
}
