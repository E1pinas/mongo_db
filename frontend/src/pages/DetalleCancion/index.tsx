import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCargarCancion, useReproduccionCancion } from "./hooks";
import {
  CabeceraModal,
  InformacionCancion,
  BotonReproducir,
  AccesoUsuario,
  MensajeCompartido,
  EstadoCarga,
} from "./componentes";

export default function DetalleCancion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { cancion, cargando, error, mensaje } = useCargarCancion(id);
  const { handlePlayCancion, isCurrentSong, isPlaying } =
    useReproduccionCancion();

  const handleClose = () => {
    if (!user) {
      window.location.href = "/login";
    } else {
      navigate(-1);
    }
  };

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  if (cargando) {
    return <EstadoCarga mensaje="Cargando canción..." alCerrar={handleClose} />;
  }

  if (error || !cancion) {
    return (
      <EstadoCarga
        mensaje={error || "No se pudo cargar la canción"}
        esError
        alCerrar={handleClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-linear-to-br from-neutral-900 via-neutral-900 to-neutral-800 rounded-2xl max-w-lg w-full border border-neutral-700 shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        <CabeceraModal alCerrar={handleClose} />

        <div className="p-5 sm:p-8">
          <InformacionCancion cancion={cancion} />

          <div className="space-y-2.5 sm:space-y-3">
            <BotonReproducir
              isCurrentSong={isCurrentSong(cancion)}
              isPlaying={isPlaying}
              onClick={() => handlePlayCancion(cancion)}
            />

            {!user && (
              <AccesoUsuario
                onLogin={handleLogin}
                onRegister={handleRegister}
              />
            )}

            {user && (
              <button
                onClick={handleClose}
                className="w-full px-5 sm:px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-2xl font-semibold text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cerrar
              </button>
            )}
          </div>

          <MensajeCompartido mensaje={mensaje} mostrarBeneficios={!user} />
        </div>
      </div>
    </div>
  );
}
