import type { Cancion, Album, Playlist, Usuario } from "../../../types";

export interface DatosInicio {
  misCanciones: Cancion[];
  albumesRecientes: Album[];
  playlistsPopulares: Playlist[];
  usuariosSugeridos: Usuario[];
}

export interface EstadoCarga {
  cargando: boolean;
  error: string;
}
