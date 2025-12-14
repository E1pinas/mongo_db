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
  botonesAccion?: React.ReactNode;
}

export const CabeceraPerfil: React.FC<PropsCabeceraPerfil> = ({
  usuario,
  esPropioUsuario,
  totalCanciones,
  totalSeguidores,
  totalSiguiendo,
  alClickConfiguracion,
  botonesAccion,
}) => {
  const usuarioExtendido = usuario as any;
  const urlBanner = usuarioExtendido.bannerUrl || undefined;
  const urlAvatar = usuarioExtendido.avatarUrl || "/avatar.png";

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
    <div className="relative overflow-visible">
      {/* Banner Grande con efecto de overlay */}
      <div className="h-[400px] relative overflow-hidden">
        {urlBanner ? (
          <img
            src={urlBanner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700" />
        )}
        {/* Overlay oscuro en la parte inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

        {/* Contenedor de información sobre el banner */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 overflow-visible">
          <div className="flex items-end gap-6 overflow-visible">
            {/* Avatar Circular Más Grande */}
            <div className="w-36 h-36 rounded-full overflow-hidden bg-neutral-900 border-4 border-neutral-950 shadow-2xl flex-shrink-0">
              <img
                src={urlAvatar}
                alt={usuario.nombreArtistico || usuario.nick}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Información del usuario */}
            <div className="flex-1 pb-2">
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                {usuario.nombreArtistico ||
                  `${usuario.nombre} ${usuario.apellidos}`}
              </h1>
              <p className="text-base text-neutral-300 mb-3">@{usuario.nick}</p>

              {/* Biografía */}
              {usuarioExtendido.biografia && (
                <p className="text-neutral-200 mb-4 max-w-2xl text-sm drop-shadow">
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
                      className={`flex items-center gap-2 px-3 py-1.5 ${red.bgColor} hover:opacity-90 rounded-md text-white font-medium text-sm transition-opacity shadow-lg`}
                    >
                      <span className="text-base">{red.icon}</span>
                      <span>{red.nombre}</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Fecha de Unión */}
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <Calendar className="w-4 h-4" />
                <span>
                  Se unió en {new Date(usuario.createdAt).getFullYear()}
                </span>
              </div>
            </div>

            {/* Botón de Editar Perfil o Botones de Acción */}
            <div className="mb-2 relative z-30">
              {esPropioUsuario ? (
                <button
                  onClick={alClickConfiguracion}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-800/80 hover:bg-neutral-700/80 backdrop-blur-sm rounded-lg transition-colors shadow-lg"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-semibold">Editar perfil</span>
                </button>
              ) : (
                botonesAccion
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas con Colores - Debajo del banner */}
      <div className="bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {formatNumber(totalSeguidores)}
              </div>
              <div className="text-sm text-neutral-400 mt-1">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {formatNumber(totalSiguiendo)}
              </div>
              <div className="text-sm text-neutral-400 mt-1">Siguiendo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {formatNumber(totalCanciones)}
              </div>
              <div className="text-sm text-neutral-400 mt-1">Pistas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {usuarioExtendido.totalAlbumes || 0}
              </div>
              <div className="text-sm text-neutral-400 mt-1">Álbumes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
