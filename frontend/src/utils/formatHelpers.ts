/**
 * Formatea segundos a formato MM:SS
 * @param seconds - Duración en segundos
 * @returns String formateado como "MM:SS"
 */
export const formatDuration = (seconds: number | undefined): string => {
  if (!seconds || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Formatea números grandes con separadores
 * @param num - Número a formatear
 * @returns String formateado (ej: 1,234 o 1.2M)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

/**
 * Formatea fecha relativa (ej: "hace 2 horas")
 * @param date - Fecha a formatear
 * @returns String con tiempo relativo
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)}sem`;
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)}mes`;
  return `hace ${Math.floor(diffDays / 365)}año`;
};
