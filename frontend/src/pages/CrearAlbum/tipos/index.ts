import type { Cancion } from "../../../types";

export interface DatosAlbum {
  titulo: string;
  descripcion: string;
  generos: string[];
  fechaLanzamiento: string;
  esPrivado: boolean;
}

export interface ArchivosAlbum {
  portadaFile: File | null;
  portadaPreview: string;
}

export interface SeleccionCanciones {
  misCanciones: Cancion[];
  selectedSongs: string[];
  showSongSelector: boolean;
}
