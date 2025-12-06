import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha a formato relativo (ej: "hace 2 horas")
 */
export function formatTimeAgo(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return "Hace un momento";
  }
}

/**
 * Formatea una fecha a formato corto (ej: "5 dic 2025")
 */
export function formatShortDate(date: string | Date): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Formatea una fecha a formato largo (ej: "5 de diciembre de 2025, 14:30")
 */
export function formatLongDate(date: string | Date): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Obtiene solo el año de una fecha
 */
export function getYear(date: string | Date): number {
  try {
    return new Date(date).getFullYear();
  } catch {
    return new Date().getFullYear();
  }
}
