import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Usuario } from "../../../types";

interface SeccionUsuariosProps {
  usuarios: Usuario[];
}

export const SeccionUsuarios = ({ usuarios }: SeccionUsuariosProps) => {
  const navigate = useNavigate();

  if (usuarios.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold">Artistas</h2>
        <span className="text-sm text-neutral-500">({usuarios.length})</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {usuarios.map((usuario) => (
          <div
            key={usuario._id}
            onClick={() => navigate(`/perfil/${usuario.nick}`)}
            className="group cursor-pointer text-center"
          >
            <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 bg-neutral-900 mx-auto">
              <img
                src={usuario.avatarUrl || "/avatar.png"}
                alt={usuario.nombreArtistico || usuario.nick}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                {usuario.nombreArtistico || usuario.nick}
              </h3>
              {usuario.verificado && (
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-500 truncate">@{usuario.nick}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
