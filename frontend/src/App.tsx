import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider, PlayerProvider, NotificationProvider } from "./contexts";
import { usePresence } from "./hooks/usePresence";
import ShellLayout from "./layouts/ShellLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import Home from "./pages/Inicio";
import { Albumes } from "./pages/Albumes";
import AlbumDetail from "./pages/DetalleAlbum";
import CreateAlbum from "./pages/CrearAlbum";
import Listas from "./pages/Listas";
import PlaylistDetail from "./pages/DetallePlaylist";
import LikedSongs from "./pages/CancionesFavoritas";
import LikedAlbums from "./pages/AlbumesGuardados";
import LikedPlaylists from "./pages/PlaylistsGuardadas";
import LikedArtists from "./pages/ArtistasGuardados";
import Profile from "./pages/Perfil";
import Notificaciones from "./pages/Notificaciones";
import { Solicitudes } from "./pages/Solicitudes";
import Settings from "./pages/Configuracion";
import BlockedUsers from "./pages/UsuariosBloqueados";
import SubirCancion from "./pages/SubirCancion";
import MySongs from "./pages/MisCanciones";
import Search from "./pages/Busqueda";
import Auth from "./pages/auth/Auth";
import AdminPanel from "./pages/AdminPanel";
import SongPage from "./pages/DetalleCancion";

/**
 * App.tsx - Punto de entrada principal
 *
 * INTEGRACIÓN:
 * - Este componente define el router con createBrowserRouter
 * - Rutas públicas (login/register) usan PublicRoute
 * - Rutas privadas (home, albums, etc) usan ProtectedRoute con ShellLayout
 */

const router = createBrowserRouter([
  // Rutas públicas (solo para usuarios NO autenticados)
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Auth key="login" />,
      },
      {
        path: "/register",
        element: <Auth key="register" />,
      },
    ],
  },
  // Rutas protegidas (solo para usuarios autenticados)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <ShellLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "buscar",
            element: <Search />,
          },
          {
            path: "albumes",
            element: <Albumes />,
          },
          {
            path: "album/:id",
            element: <AlbumDetail />,
          },
          {
            path: "crear-album",
            element: <CreateAlbum />,
          },
          {
            path: "playlists",
            element: <Listas />,
          },
          {
            path: "playlist/:id",
            element: <PlaylistDetail />,
          },
          {
            path: "cancion/:id",
            element: <SongPage />,
          },
          {
            path: "canciones-favoritas",
            element: <LikedSongs />,
          },
          {
            path: "biblioteca/artistas",
            element: <LikedArtists />,
          },
          {
            path: "biblioteca/albumes",
            element: <LikedAlbums />,
          },
          {
            path: "biblioteca/playlists",
            element: <LikedPlaylists />,
          },
          {
            path: "subir",
            element: <SubirCancion />,
          },
          {
            path: "mis-canciones",
            element: <MySongs />,
          },
          {
            path: "perfil",
            element: <Profile />,
          },
          {
            path: "perfil/:nick",
            element: <Profile />,
          },
          {
            path: "notificaciones",
            element: <Notificaciones />,
          },
          {
            path: "solicitudes",
            element: <Solicitudes />,
          },
          {
            path: "configuracion",
            element: <Settings />,
          },
          {
            path: "admin",
            element: <AdminPanel />,
          },
          {
            path: "usuarios-bloqueados",
            element: <BlockedUsers />,
          },
        ],
      },
    ],
  },
]);

function AppContent() {
  // Hook para mantener presencia online
  usePresence();

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
