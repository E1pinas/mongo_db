import { useAuth } from "../../../contexts";
import { obtenerSaludo } from "../utils";

export const SeccionHero = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 blur-3xl" />
      <div className="relative px-6 pt-8 pb-12">
        <h1 className="text-5xl md:text-6xl font-black mb-2 bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          {obtenerSaludo()}, {user?.nombreArtistico || user?.nick}
        </h1>
        <p className="text-neutral-400 text-lg">¿Qué quieres escuchar hoy?</p>
      </div>
    </div>
  );
};
