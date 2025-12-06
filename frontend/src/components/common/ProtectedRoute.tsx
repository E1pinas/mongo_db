import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts";

/**
 * ProtectedRoute - Protege rutas que requieren autenticación
 *
 * Si el usuario NO está autenticado, redirige a /login
 * Si está autenticado, renderiza el Outlet (rutas hijas)
 */
export default function ProtectedRoute() {
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

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar contenido
  return <Outlet />;
}
