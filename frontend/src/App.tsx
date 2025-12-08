import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider, PlayerProvider, NotificationProvider } from "./contexts";
import { usePresence } from "./hooks/usePresence";
import ShellLayout from "./layouts/ShellLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import Home from "./pages/Home";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import CreateAlbum from "./pages/CreateAlbum";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import LikedSongs from "./pages/LikedSongs";
import LikedAlbums from "./pages/LikedAlbums";
import LikedPlaylists from "./pages/LikedPlaylists";
import LikedArtists from "./pages/LikedArtists";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Requests from "./pages/Requests";
import Settings from "./pages/Settings";
import BlockedUsers from "./pages/BlockedUsers";
import UploadSong from "./pages/UploadSong";
import MySongs from "./pages/MySongs";
import Search from "./pages/Search";
import Auth from "./pages/auth/Auth";
import AdminPanel from "./pages/AdminPanel";

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
            path: "search",
            element: <Search />,
          },
          {
            path: "albums",
            element: <Albums />,
          },
          {
            path: "album/:id",
            element: <AlbumDetail />,
          },
          {
            path: "create-album",
            element: <CreateAlbum />,
          },
          {
            path: "playlists",
            element: <Playlists />,
          },
          {
            path: "playlist/:id",
            element: <PlaylistDetail />,
          },
          {
            path: "liked-songs",
            element: <LikedSongs />,
          },
          {
            path: "library/artists",
            element: <LikedArtists />,
          },
          {
            path: "library/albums",
            element: <LikedAlbums />,
          },
          {
            path: "library/playlists",
            element: <LikedPlaylists />,
          },
          {
            path: "upload",
            element: <UploadSong />,
          },
          {
            path: "my-songs",
            element: <MySongs />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "profile/:nick",
            element: <Profile />,
          },
          {
            path: "notifications",
            element: <Notifications />,
          },
          {
            path: "requests",
            element: <Requests />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "admin",
            element: <AdminPanel />,
          },
          {
            path: "blocked-users",
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
