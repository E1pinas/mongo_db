export type TipoPestaña =
  | "posts"
  | "canciones"
  | "albumes"
  | "playlists"
  | "seguidores"
  | "siguiendo";

export type EstadoRelacion =
  | "ninguno"
  | "pendiente_enviada"
  | "pendiente_recibida"
  | "amigos"
  | "bloqueado";

export interface ErrorPerfil {
  tipo: "no_encontrado" | "privado" | "no_disponible";
  mensaje: string;
}

export interface EstadisticasPerfil {
  totalCanciones: number;
  totalAlbumes: number;
  totalPlaylists: number;
  totalSeguidores: number;
  totalSiguiendo: number;
  totalReproducciones?: number;
}
