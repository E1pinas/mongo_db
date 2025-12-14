export type TipoErrorAlbum = "not_found" | "private" | "unavailable";

export interface ErrorAlbum {
  tipo: TipoErrorAlbum;
  mensaje: string;
}

export interface ConfiguracionErrorAlbum {
  icon: string;
  title: string;
  color: string;
  gradient: string;
}
