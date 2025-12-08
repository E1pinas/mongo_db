import { Play } from "lucide-react";

interface PlaceholderCardProps {
  title: string;
  description: string;
  index: number;
}

/**
 * PlaceholderCard - Tarjeta placeholder para contenido de ejemplo
 */
export default function PlaceholderCard({
  title,
  description,
  index,
}: PlaceholderCardProps) {
  return (
    <div className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer group">
      <div className="relative mb-4">
        <div className="aspect-square bg-neutral-700 rounded-lg mb-4" />
        <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:scale-105">
          <Play size={24} fill="currentColor" />
        </button>
      </div>
      <p className="font-semibold text-sm mb-2 truncate">{title}</p>
      <p className="text-xs text-neutral-400 line-clamp-2">{description}</p>
    </div>
  );
}
