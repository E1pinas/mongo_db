import type { Cancion } from "../../../types";

export const obtenerSaludo = (): string => {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 18) return "Buenas tardes";
  return "Buenas noches";
};

export const obtenerNombreArtista = (artistas: any): string => {
  if (!artistas || artistas.length === 0) return "Artista";
  if (typeof artistas[0] === "string") return "Artista";
  return artistas
    .map((a: any) => a.nombreArtistico || a.nick || a.nombre)
    .join(", ");
};

export const estaLiked = (cancion: Cancion, userId?: string): boolean => {
  if (!userId) return false;
  return cancion.likes?.includes(userId) || false;
};
