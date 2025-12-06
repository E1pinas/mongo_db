// ============================================
// TIPOS PRINCIPALES DEL SISTEMA
// ============================================

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  nick: string;
  nombreArtistico?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  role: "user" | "admin";
  verificado: boolean;
  banned: boolean;
  estaConectado?: boolean;
  ultimaConexion?: string;
  redes?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    x?: string;
  };
  contadores: {
    seguidores: number;
    seguidos: number;
    canciones: number;
    albumes: number;
    playlists: number;
    amigos: number;
  };
  // Contenido del perfil
  misCanciones?: Cancion[];
  misAlbumes?: Album[];
  playlistsCreadas?: Playlist[];
  createdAt: string;
  updatedAt: string;
}

export interface Cancion {
  _id: string;
  titulo: string;
  artistas: string[] | Usuario[];
  album?: string | Album;
  esSingle: boolean;
  duracionSegundos: number;
  generos: string[];
  audioUrl: string;
  portadaUrl?: string;
  esPrivada: boolean;
  esExplicita: boolean;
  reproduccionesTotales: number;
  likes: string[];
  estaEliminada: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  _id: string;
  titulo: string;
  descripcion?: string;
  portadaUrl?: string;
  artistas: string[] | Usuario[];
  canciones: string[] | Cancion[];
  generos?: string[];
  fechaLanzamiento?: string;
  esPrivado: boolean;
  reproduccionesTotales?: number;
  likes?: string[];
  estaEliminado?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  titulo: string;
  descripcion?: string;
  portadaUrl?: string;
  creador: string | Usuario;
  canciones: string[] | Cancion[];
  esPublica: boolean;
  esColaborativa: boolean;
  colaboradores: string[] | Usuario[];
  seguidores: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comentario {
  _id: string;
  autor: string | Usuario;
  contenido: string;
  perfilDestino: string | Usuario;
  likes: string[];
  respuestas: Comentario[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  usuario: Usuario;
  contenido: string | null;
  tipo:
    | "texto"
    | "repost_cancion"
    | "repost_album"
    | "repost_playlist"
    | "repost_post";
  recursoId?: Cancion | Album | Playlist;
  tipoRecurso?: "Cancion" | "Album" | "Playlist";
  postOriginal?: Post; // Para reposts de posts
  likes: string[];
  comentarios: PostComentario[];
  reposts: PostRepost[];
  estaEliminado: boolean;
  createdAt: string;
  updatedAt: string;
  totalLikes: number;
  totalComentarios: number;
  totalReposts: number;
  usuario_dio_like?: boolean;
  usuario_hizo_repost?: boolean;
}

export interface PostComentario {
  _id?: string;
  usuario: string | Usuario;
  contenido: string;
  createdAt: string;
}

export interface PostRepost {
  _id?: string;
  usuario: string | Usuario;
  comentario?: string;
  createdAt: string;
}

export interface Notificacion {
  _id: string;
  usuarioDestino: string;
  usuarioOrigen?: string | Usuario;
  tipo: NotificacionTipo;
  mensaje: string;
  leida: boolean;
  recurso?: {
    tipo: "cancion" | "album" | "playlist" | "comentario" | "usuario" | "post";
    id: string;
  };
  createdAt: string;
}

export type NotificacionTipo =
  | "nueva_cancion_artista"
  | "nuevo_album_artista"
  | "nueva_playlist_artista"
  | "solicitud_amistad"
  | "amistad_aceptada"
  | "nuevo_seguidor"
  | "comentario_en_perfil"
  | "respuesta_comentario"
  | "like_comentario"
  | "like_post"
  | "comentario_post"
  | "repost"
  | "sistema";

export interface Reporte {
  _id: string;
  reportador: string | Usuario;
  tipoRecurso: "usuario" | "cancion" | "album" | "playlist" | "comentario";
  recursoId: string;
  motivo: string;
  descripcion?: string;
  estado: "pendiente" | "en_revision" | "resuelto" | "rechazado";
  resolucion?: string;
  adminRevisor?: string | Usuario;
  createdAt: string;
  updatedAt: string;
}

export interface Amistad {
  _id: string;
  usuario1: string | Usuario;
  usuario2: string | Usuario;
  estado: "pendiente" | "aceptada" | "rechazada";
  solicitante: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TIPOS DE RESPUESTA API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  usuario: Usuario;
  token: string;
  message?: string;
}

// ============================================
// TIPOS DE FORMULARIOS
// ============================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nombre: string;
  apellidos: string;
  email: string;
  nick: string;
  password: string;
  pais: string;
  fechaNacimiento: string;
}

export interface CancionForm {
  titulo: string;
  descripcion?: string;
  genero?: string;
  esPrivada: boolean;
  archivo: File;
  imagen?: File;
}

export interface AlbumForm {
  titulo: string;
  descripcion?: string;
  genero?: string;
  fechaLanzamiento?: string;
  esPrivado: boolean;
  portada?: File;
  canciones: string[];
}

export interface PlaylistForm {
  nombre: string;
  descripcion?: string;
  esPrivada: boolean;
  esColaborativa: boolean;
  portada?: File;
}

// ============================================
// TIPOS DE ESTADO
// ============================================

export interface PlayerState {
  currentSong: Cancion | null;
  queue: Cancion[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeat: "off" | "one" | "all";
  shuffle: boolean;
}

export interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NotificationState {
  notifications: Notificacion[];
  unreadCount: number;
}
