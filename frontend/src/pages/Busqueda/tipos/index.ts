import type { Cancion, Album, Playlist, Usuario } from "../../../types";

export interface ResultadosBusqueda {
  canciones: Cancion[];
  albumes: Album[];
  playlists: Playlist[];
  usuarios: Usuario[];
}

export interface EstadoBusqueda {
  query: string;
  cargando: boolean;
  searched: boolean;
}
