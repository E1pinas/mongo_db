export interface Estadisticas {
  usuarios: {
    total: number;
    activos: number;
    suspendidos: number;
    nuevosUltimos30Dias: number;
  };
  contenido: {
    canciones: number;
    albumes: number;
    playlists: number;
  };
  reportes: {
    total: number;
    pendientes: number;
  };
}

export interface Reporte {
  _id: string;
  reportadoPor: {
    nick: string;
    nombreArtistico?: string;
  };
  reportador: {
    nick: string;
    nombreArtistico?: string;
  };
  asignadoA?: {
    nick: string;
    nombreArtistico?: string;
  };
  tipoContenido: string;
  motivo: string;
  descripcion?: string;
  detalles?: string;
  estado: string;
  prioridad: string;
  createdAt: string;
  fechaReporte: string;
  contenidoDetalle?: any;
  comentarioResolucion?: string;
  accionTomada?: string;
  resueltoPersonal?: {
    nick: string;
  };
  fechaResolucion?: string;
}

export interface Administrador {
  _id: string;
  nombre: string;
  apellidos: string;
  nick: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  nick: string;
  email: string;
  pais?: string;
  ciudad?: string;
  suspendido?: boolean;
  motivoSuspension?: string;
  fechaSuspension?: string;
  duracionSuspension?: number;
  estadoCuenta?: string;
}

export interface Contenido {
  _id: string;
  titulo?: string;
  nombre?: string;
  artista?: {
    nick: string;
    nombreArtistico?: string;
  };
  portadaUrl?: string;
  archivoUrl?: string;
  duracion?: number;
  reproducciones?: number;
  likes?: number;
  oculto?: boolean;
  razonOcultamiento?: string;
  tipo: "cancion" | "album" | "playlist";
}

export type TipoPestañaAdmin =
  | "panelControl"
  | "reportes"
  | "usuarios"
  | "contenido"
  | "administradores";

export type TipoContenido = "canciones" | "albumes" | "playlists";

export type EstadoUsuario = "todos" | "activos" | "suspendidos";

export const PAISES = [
  { code: "MX", nombre: "México" },
  { code: "ES", nombre: "España" },
  { code: "CO", nombre: "Colombia" },
  { code: "AR", nombre: "Argentina" },
  { code: "CL", nombre: "Chile" },
  { code: "PE", nombre: "Perú" },
  { code: "VE", nombre: "Venezuela" },
  { code: "EC", nombre: "Ecuador" },
  { code: "GT", nombre: "Guatemala" },
  { code: "CU", nombre: "Cuba" },
  { code: "BO", nombre: "Bolivia" },
  { code: "DO", nombre: "República Dominicana" },
  { code: "HN", nombre: "Honduras" },
  { code: "PY", nombre: "Paraguay" },
  { code: "SV", nombre: "El Salvador" },
  { code: "NI", nombre: "Nicaragua" },
  { code: "CR", nombre: "Costa Rica" },
  { code: "PA", nombre: "Panamá" },
  { code: "UY", nombre: "Uruguay" },
  { code: "PR", nombre: "Puerto Rico" },
  { code: "US", nombre: "Estados Unidos" },
  { code: "CA", nombre: "Canadá" },
];
