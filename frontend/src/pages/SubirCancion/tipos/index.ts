export interface DatosFormularioCancion {
  titulo: string;
  generos: string[];
  esPrivada: boolean;
  esExplicita: boolean;
}

export interface ArchivosSubida {
  audioFile: File | null;
  portadaFile: File | null;
  audioPreview: string;
  portadaPreview: string;
  duracionSegundos: number;
}

export interface EstadoSubida {
  subiendo: boolean;
  error: string;
  exitoso: boolean;
  mostrarModalSuspendido: boolean;
}
