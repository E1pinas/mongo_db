export interface DatosFormularioPerfil {
  nick: string;
  nombreArtistico: string;
  bio: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
}

export interface ConfiguracionPrivacidad {
  perfilPublico: boolean;
  recibirSolicitudes: boolean;
}

export interface ArchivosImagenes {
  avatarFile: File | null;
  bannerFile: File | null;
  avatarPreview: string;
  bannerPreview: string;
}
