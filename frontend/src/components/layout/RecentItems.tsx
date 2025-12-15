import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recentService, type RecentItem } from "../../services/recent.service";
import { useAuth } from "../../contexts";

export default function RecentItems() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Limpiar storage antiguo (migración)
    recentService.clearOldStorage();

    // Cargar items cuando cambia el usuario
    loadItems();
  }, [user]);

  useEffect(() => {
    // Cargar items iniciales
    loadItems();

    // Escuchar cambios en el historial
    const handleUpdate = () => loadItems();
    window.addEventListener("recentItemsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("recentItemsUpdated", handleUpdate);
    };
  }, []);

  const loadItems = () => {
    const recentItems = recentService.getRecentItems();
    setItems(recentItems);
  };

  const handleRemoveItem = (e: React.MouseEvent, item: RecentItem) => {
    e.stopPropagation();
    recentService.removeRecentItem(item.id, item.type);
    loadItems();
  };

  const handleItemClick = (item: RecentItem) => {
    switch (item.type) {
      case "perfil":
        navigate(`/perfil/${item.id}`);
        break;
      case "cancion":
        // Las canciones no tienen página individual, podrías navegar al álbum o reproducir
        break;
      case "album":
        navigate(`/album/${item.id}`);
        break;
      case "playlist":
        navigate(`/playlist/${item.id}`);
        break;
    }
  };

  const getDefaultImage = (type: RecentItem["type"]) => {
    switch (type) {
      case "perfil":
        return "/avatar.png";
      case "cancion":
      case "album":
      case "playlist":
        return "/cover.jpg";
      default:
        return "/cover.jpg";
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="px-2">
      <h3 className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
        Recientes
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="relative group/item">
            <button
              onClick={() => handleItemClick(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-neutral-800/50 transition-colors"
            >
              <div
                className={`w-12 h-12 ${
                  item.type === "perfil" ? "rounded-full" : "rounded-lg"
                } overflow-hidden shrink-0 bg-neutral-800`}
              >
                <img
                  src={
                    item.imagenUrl && item.imagenUrl.trim() !== ""
                      ? item.imagenUrl
                      : getDefaultImage(item.type)
                  }
                  alt={item.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getDefaultImage(item.type);
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate group-hover/item:text-orange-400 transition-colors">
                  {item.titulo}
                </p>
                {item.subtitulo && (
                  <p className="text-xs text-neutral-400 truncate">
                    {item.subtitulo}
                  </p>
                )}
              </div>
            </button>
            <button
              onClick={(e) => handleRemoveItem(e, item)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
              title="Eliminar del historial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
