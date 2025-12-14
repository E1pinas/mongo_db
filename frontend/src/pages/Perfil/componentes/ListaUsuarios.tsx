import { Users } from "lucide-react";
import type { Usuario } from "../../../types";
import { useNavigate } from "react-router-dom";

interface PropsListaUsuarios {
  usuarios: Usuario[];
  titulo: string;
  cargando: boolean;
}

export const ListaUsuarios: React.FC<PropsListaUsuarios> = ({
  usuarios,
  titulo,
  cargando,
}) => {
  const navigate = useNavigate();

  if (cargando) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-400">Cargando...</div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
        <p className="text-neutral-400 text-lg">
          No hay {titulo.toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {usuarios.map((usuario) => {
        const usuarioExtendido = usuario as any;
        const urlAvatar = usuarioExtendido.avatarUrl || undefined;

        return (
          <div
            key={usuario._id}
            onClick={() => navigate(`/perfil/${usuario.nick}`)}
            className="bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                  {urlAvatar ? (
                    <img
                      src={urlAvatar}
                      alt={usuario.nombreArtistico || usuario.nick}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                      {(usuario.nombreArtistico || usuario.nick)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {usuario.nombreArtistico ||
                    `${usuario.nombre} ${usuario.apellidos}`}
                </h3>
                <p className="text-sm text-neutral-400 truncate">
                  @{usuario.nick}
                </p>
                {usuario.biografia && (
                  <p className="text-xs text-neutral-500 mt-1 truncate">
                    {usuario.biografia}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
