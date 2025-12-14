export type TipoErrorPlaylist = "not_found" | "private" | "unavailable";

export interface ErrorPlaylist {
  tipo: TipoErrorPlaylist;
  mensaje: string;
}

export interface ConfiguracionErrorPlaylist {
  icon: string;
  title: string;
  color: string;
  gradient: string;
}
