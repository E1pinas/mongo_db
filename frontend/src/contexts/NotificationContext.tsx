import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { notificationService } from "../services/notification.service";
import { authService } from "../services/auth.service";
import type { Notificacion } from "../types";

interface NotificationContextType {
  notifications: Notificacion[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notificacion) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calcular no leídas
  const unreadCount = notifications.filter((n) => !n.leida).length;

  // Cargar notificaciones al iniciar (solo si está autenticado)
  useEffect(() => {
    // Verificar si hay token antes de hacer polling
    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    fetchNotifications();

    // Polling cada 30 segundos para actualizar notificaciones
    const interval = setInterval(() => {
      // Verificar autenticación antes de cada polling
      if (authService.isAuthenticated()) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Actualizar localmente
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      // Actualizar localmente
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // Remover localmente
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Agregar notificación en tiempo real (para cuando implementes WebSockets)
  const addNotification = (notification: Notificacion) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
