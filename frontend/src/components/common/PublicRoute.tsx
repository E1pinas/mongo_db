import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts";

/**
 * PublicRoute - Protege rutas que solo pueden ver usuarios NO autenticados
 *
 * Si el usuario está autenticado, redirige a /
 * Si NO está autenticado, renderiza el Outlet (login/register)
 */
export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras carga, mostrar spinner
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, redirigir a home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si NO está autenticado, mostrar login/register
  return <Outlet />;
}
