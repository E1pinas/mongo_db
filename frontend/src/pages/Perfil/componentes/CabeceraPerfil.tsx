import { Calendar, Settings } from "lucide-react";
import type { Usuario } from "../../../types";
import { formatTimeAgo } from "../../../utils/dateFormat";
import { formatNumber } from "../../../utils/formatHelpers";

interface PropsCabeceraPerfil {
  usuario: Usuario;
  esPropioUsuario: boolean;
  totalCanciones: number;
  totalSeguidores: number;
  totalSiguiendo: number;
  alClickConfiguracion?: () => void;
}

export const CabeceraPerfil: React.FC<PropsCabeceraPerfil> = ({
  usuario,
  esPropioUsuario,
  totalCanciones,
  totalSeguidores,
  totalSiguiendo,
  alClickConfiguracion,
}) => {
  const usuarioExtendido = usuario as any;
  const urlBanner = usuarioExtendido.banner
    ? `http://localhost:3900/uploads/banners/${usuarioExtendido.banner}`
    : undefined;

  const urlAvatar = usuarioExtendido.avatar
    ? `http://localhost:3900/uploads/avatars/${usuarioExtendido.avatar}`
    : undefined;

  const redesSociales = [
    {
      nombre: "Instagram",
      url: usuarioExtendido.instagram,
      icon: "📷",
      color: "from-purple-600 to-pink-500",
      bgColor: "bg-purple-600",
    },
    {
      nombre: "TikTok",
      url: usuarioExtendido.tiktok,
      icon: "🎵",
      color: "from-black to-cyan-500",
      bgColor: "bg-black",
    },
    {
      nombre: "YouTube",
      url: usuarioExtendido.youtube,
      icon: "▶️",
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-600",
    },
    {
      nombre: "Twitter",
      url: usuarioExtendido.twitter,
      icon: "🐦",
      color: "from-sky-500 to-blue-500",
      bgColor: "bg-sky-500",
    },
  ].filter((red) => red.url);

  return (
    <div className="relative">
      {/* Banner Grande */}
      <div className="h-80 relative overflow-hidden">
        {urlBanner ? (
          <img
            src={urlBanner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-500 via-red-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Avatar Circular en la Esquina */}
        <div className="relative -mt-24 mb-6">
          <div className="flex items-end gap-6">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-neutral-900 border-4 border-black shadow-2xl">
              {urlAvatar ? (
                <img
                  src={urlAvatar}
                  alt={usuario.nombreArtistico || usuario.nick}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600">
                  {(usuario.nombreArtistico || usuario.nick)
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            {/* Botón de Configuración */}
            {esPropioUsuario && (
              <button
                onClick={alClickConfiguracion}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="font-semibold">Configuración</span>
              </button>
            )}
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">
            {usuario.nombreArtistico ||
              `${usuario.nombre} ${usuario.apellidos}`}
          </h1>
          <p className="text-lg text-neutral-400 mb-3">@{usuario.nick}</p>

          {/* Biografía */}
          {usuarioExtendido.biografia && (
            <p className="text-neutral-300 mb-4 max-w-3xl">
              {usuarioExtendido.biografia}
            </p>
          )}

          {/* Botones de Redes Sociales */}
          {redesSociales.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {redesSociales.map((red) => (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 ${red.bgColor} hover:opacity-90 rounded-full text-white font-semibold text-sm transition-opacity`}
                >
                  <span>{red.icon}</span>
                  <span>{red.nombre}</span>
                </a>
              ))}
            </div>
          )}

          {/* Fecha de Unión */}
          <div className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
            <Calendar className="w-4 h-4" />
            <span>Se unió en {new Date(usuario.createdAt).getFullYear()}</span>
          </div>

          {/* Estadísticas con Colores */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {formatNumber(totalSeguidores)}
              </div>
              <div className="text-sm text-neutral-400">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {formatNumber(totalSiguiendo)}
              </div>
              <div className="text-sm text-neutral-400">Siguiendo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {formatNumber(totalCanciones)}
              </div>
              <div className="text-sm text-neutral-400">Pistas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {usuarioExtendido.totalAlbumes || 0}
              </div>
              <div className="text-sm text-neutral-400">Álbumes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
