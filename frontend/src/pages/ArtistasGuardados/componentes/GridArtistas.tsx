import { useNavigate } from "react-router-dom";

interface GridArtistasProps {
  artistas: any[];
}

export function GridArtistas({ artistas }: GridArtistasProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {artistas.map((artista) => (
        <div
          key={artista._id}
          onClick={() => navigate(`/perfil/${artista.nick}`)}
          className="group cursor-pointer text-center"
        >
          <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 bg-neutral-900 mx-auto ring-2 ring-neutral-800 group-hover:ring-blue-500 transition-all">
            <img
              src={artista.avatarUrl || "/avatar.png"}
              alt={artista.nombreArtistico || artista.nick}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
              {artista.nombreArtistico || artista.nick}
            </h3>
            {artista.verificado && (
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
          <p className="text-xs text-neutral-500 truncate">@{artista.nick}</p>
        </div>
      ))}
    </div>
  );
}
