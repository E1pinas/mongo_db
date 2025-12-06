import api, { handleApiError } from "./api";
import type { Notificacion } from "../types";

export const notificationService = {
  // Obtener todas las notificaciones
  async getNotifications(): Promise<Notificacion[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        notificaciones: Notificacion[];
      }>("/notificaciones");
      return response.data.notificaciones || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener solo no leídas
  async getUnreadNotifications(): Promise<Notificacion[]> {
    try {
      const response = await api.get<{
        ok: boolean;
        notificaciones: Notificacion[];
      }>("/notificaciones?soloNoLeidas=true");
      return response.data.notificaciones || [];
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Marcar como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notificaciones/${notificationId}/leer`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Marcar todas como leídas
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch("/notificaciones/leer-todas");
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar notificación
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notificaciones/${notificationId}`);
    } catch (error) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },
};
