import type { Notificacion } from "../../../types";

interface IconoNotificacionProps {
  notificacion: Notificacion;
}

export const IconoNotificacion = ({ notificacion }: IconoNotificacionProps) => {
  // Si hay un usuario origen, mostrar su foto
  if (
    notificacion.usuarioOrigen &&
    typeof notificacion.usuarioOrigen === "object"
  ) {
    return (
      <img
        src={
          notificacion.usuarioOrigen.avatarUrl &&
          notificacion.usuarioOrigen.avatarUrl.trim() !== ""
            ? notificacion.usuarioOrigen.avatarUrl
            : "/avatar.png"
        }
        alt={
          notificacion.usuarioOrigen.nombreArtistico ||
          notificacion.usuarioOrigen.nick
        }
        className="w-12 h-12 rounded-full shrink-0 object-cover"
        onError={(e) => {
          e.currentTarget.src = "/avatar.png";
        }}
      />
    );
  }

  // Mostrar icono según el tipo
  const tipo = notificacion.tipo;

  if (tipo === "nueva_cancion_artista" || tipo === "nuevo_album_artista") {
    return (
      <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-full shrink-0 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </div>
    );
  }

  if (tipo === "nueva_playlist_artista") {
    return (
      <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-full shrink-0 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15V6"></path>
          <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
          <path d="M12 12H3"></path>
          <path d="M16 6H3"></path>
          <path d="M12 18H3"></path>
        </svg>
      </div>
    );
  }

  if (tipo === "sistema") {
    return (
      <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-yellow-500 rounded-full shrink-0 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      </div>
    );
  }

  if (
    tipo === "nuevo_seguidor" ||
    tipo === "solicitud_amistad" ||
    tipo === "amistad_aceptada"
  ) {
    return (
      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full shrink-0 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
    );
  }

  if (
    tipo === "comentario_en_perfil" ||
    tipo === "respuesta_comentario" ||
    tipo === "like_comentario"
  ) {
    return (
      <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-rose-500 rounded-full shrink-0 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
    );
  }

  return <div className="w-12 h-12 bg-neutral-700 rounded-full shrink-0"></div>;
};
