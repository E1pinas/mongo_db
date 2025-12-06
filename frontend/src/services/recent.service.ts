// Servicio para gestionar el historial de elementos visitados recientemente

export type RecentItemType = "perfil" | "cancion" | "album" | "playlist";

export interface RecentItem {
  id: string;
  type: RecentItemType;
  titulo: string;
  subtitulo?: string; // Para artista, creador, etc.
  imagenUrl?: string;
  timestamp: number;
}

const STORAGE_KEY_PREFIX = "oto_music_recent_items";
const MAX_ITEMS = 7;

/**
 * Decodificar JWT para obtener el payload
 */
const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};

/**
 * Obtener la clave de storage específica del usuario
 */
const getStorageKey = (): string => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return `${STORAGE_KEY_PREFIX}_guest`;

    const payload = decodeToken(token);
    if (!payload) return `${STORAGE_KEY_PREFIX}_guest`;

    const userId = payload.id || payload.sub || payload.userId || payload._id;
    return `${STORAGE_KEY_PREFIX}_${userId || "unknown"}`;
  } catch (error) {
    console.error("Error al obtener storage key:", error);
    return `${STORAGE_KEY_PREFIX}_guest`;
  }
};

export const recentService = {
  /**
   * Obtener todos los items recientes del usuario actual
   */
  getRecentItems(): RecentItem[] {
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error al obtener items recientes:", error);
      return [];
    }
  },

  /**
   * Agregar un item al historial del usuario actual
   */
  addRecentItem(item: Omit<RecentItem, "timestamp">): void {
    try {
      const key = getStorageKey();
      const items = this.getRecentItems();

      // Eliminar item duplicado si existe
      const filtered = items.filter(
        (i) => !(i.id === item.id && i.type === item.type)
      );

      // Agregar al principio
      const newItems = [
        {
          ...item,
          timestamp: Date.now(),
        },
        ...filtered,
      ];

      // Mantener solo los últimos MAX_ITEMS
      const limited = newItems.slice(0, MAX_ITEMS);

      localStorage.setItem(key, JSON.stringify(limited));

      // Disparar evento personalizado para que los componentes se actualicen
      window.dispatchEvent(new Event("recentItemsUpdated"));
    } catch (error) {
      console.error("Error al agregar item reciente:", error);
    }
  },

  /**
   * Limpiar todo el historial del usuario actual
   */
  clearRecentItems(): void {
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
      window.dispatchEvent(new Event("recentItemsUpdated"));
    } catch (error) {
      console.error("Error al limpiar items recientes:", error);
    }
  },

  /**
   * Eliminar un item específico del usuario actual
   */
  removeRecentItem(id: string, type: RecentItemType): void {
    try {
      const key = getStorageKey();
      const items = this.getRecentItems();
      const filtered = items.filter(
        (item) => !(item.id === id && item.type === type)
      );
      localStorage.setItem(key, JSON.stringify(filtered));
      window.dispatchEvent(new Event("recentItemsUpdated"));
    } catch (error) {
      console.error("Error al eliminar item reciente:", error);
    }
  },

  /**
   * Limpiar recientes de la clave antigua (migración)
   */
  clearOldStorage(): void {
    try {
      localStorage.removeItem("oto_music_recent_items");
    } catch (error) {
      console.error("Error al limpiar storage antiguo:", error);
    }
  },
};
