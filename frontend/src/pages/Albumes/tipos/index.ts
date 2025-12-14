export const GENEROS_DISPONIBLES = [
  "rock",
  "pop",
  "jazz",
  "electronic",
  "hiphop",
  "classical",
  "reggaeton",
  "indie",
  "latino",
  "urbano",
] as const;

export const GENEROS_CON_TODO = ["Todo", ...GENEROS_DISPONIBLES] as const;

export type Genero = (typeof GENEROS_DISPONIBLES)[number];
export type GeneroConTodo = (typeof GENEROS_CON_TODO)[number];

export interface DatosAlbum {
  titulo: string;
  descripcion: string;
  portadaUrl: string;
  generos: string[];
  fechaLanzamiento?: string;
  esPrivado: boolean;
}
