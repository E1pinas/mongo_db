import { UserPlus, Users as UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Usuario } from "../../../types";

interface SeccionUsuariosSugeridosProps {
  usuarios: Usuario[];
  alSeguir: (userId: string) => void;
}

export const SeccionUsuariosSugeridos = ({
  usuarios,
  alSeguir,
}: SeccionUsuariosSugeridosProps) => {
  const navigate = useNavigate();

  if (usuarios.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <UsersIcon size={20} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold">Artistas para Seguir</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {usuarios.map((usuario) => (
          <div
            key={usuario._id}
            className="group bg-neutral-900/50 hover:bg-neutral-800/80 border border-neutral-800 hover:border-blue-500/50 rounded-xl p-4 transition-all"
          >
            <div
              onClick={() => navigate(`/perfil/${usuario.nick}`)}
              className="cursor-pointer"
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 bg-neutral-800 mx-auto">
                <img
                  src={usuario.avatarUrl || "/avatar.png"}
                  alt={usuario.nick}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/avatar.png";
                  }}
                />
              </div>
              <h3 className="font-semibold text-white truncate text-center group-hover:text-blue-400 transition-colors">
                {usuario.nombreArtistico || usuario.nick}
              </h3>
              <p className="text-sm text-neutral-400 truncate text-center">
                @{usuario.nick}
              </p>
            </div>
            <button
              onClick={() => alSeguir(usuario._id)}
              className="mt-3 w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Seguir
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
