import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useNotifications, useAuth } from "../../contexts";
import { friendshipService } from "../../services/friendship.service";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Home,
  Disc,
  ListMusic,
  User,
  Bell,
  UserPlus,
  Search,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

/**
 * TopNav - Barra de navegación superior fija
 *
 * FUNCIONALIDAD:
 * - Navegación principal con NavLink (active styling automático)
 * - Botones para colapsar sidebar izquierdo y derecho
 * - Botón hamburguesa para móvil (sidebar izquierdo overlay)
 * - Buscador global
 *
 * RESPONSIVE:
 * - Botón hamburguesa solo visible en móvil (lg:hidden)
 * - Links completos en desktop, iconos en móvil
 * - Botón sidebar derecho solo visible en xl+
 */

interface TopNavProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleLeftMobile: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
}

export default function TopNav({
  onToggleLeft,
  onToggleRight,
  onToggleLeftMobile,
  leftOpen,
  rightOpen,
}: TopNavProps) {
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar contador de solicitudes pendientes
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const requests = await friendshipService.getPendingRequests();
        setPendingRequestsCount(requests.length);
      } catch (error) {
        console.error("Error loading pending requests:", error);
      }
    };

    loadPendingRequests();

    // Actualizar cada 30 segundos
    const interval = setInterval(loadPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="h-16 bg-neutral-950 border-b border-neutral-800 px-4 flex items-center justify-between gap-4 shrink-0">
      {/* IZQUIERDA - Logo y controles sidebar */}
      <div className="flex items-center gap-3">
        {/* Toggle sidebar izquierdo (desktop) - Primero para que sea visible */}
        <button
          onClick={onToggleLeft}
          className="hidden lg:flex p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Toggle left sidebar"
          title={leftOpen ? "Ocultar biblioteca" : "Mostrar biblioteca"}
        >
          {leftOpen ? (
            <PanelLeftClose size={20} />
          ) : (
            <PanelLeftOpen size={20} />
          )}
        </button>

        {/* Botón hamburguesa móvil */}
        <button
          onClick={onToggleLeftMobile}
          className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <NavLink to="/" className="font-bold text-xl hidden sm:block">
          OTO Music
        </NavLink>
      </div>

      {/* CENTRO - Navegación principal */}
      <nav className="flex items-center gap-1 flex-1 justify-center max-w-2xl">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`
          }
        >
          <Home size={18} />
          <span className="hidden sm:inline">Inicio</span>
        </NavLink>

        <NavLink
          to="/buscar"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`
          }
        >
          <Search size={18} />
          <span className="hidden sm:inline">Buscar</span>
        </NavLink>

        <NavLink
          to="/albumes"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`
          }
        >
          <Disc size={18} />
          <span className="hidden sm:inline">Álbumes</span>
        </NavLink>

        <NavLink
          to="/playlists"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`
          }
        >
          <ListMusic size={18} />
          <span className="hidden sm:inline">Playlists</span>
        </NavLink>

        <NavLink
          to={
            user?.role === "admin" || user?.role === "super_admin"
              ? "/admin"
              : `/perfil/${user?.nick || ""}`
          }
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? " text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`
          }
        >
          <User size={18} />
          <span className="hidden md:inline">
            {user?.role === "admin" || user?.role === "super_admin"
              ? "Admin"
              : "Perfil"}
          </span>
        </NavLink>

        <NavLink
          to="/notificaciones"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`
          }
        >
          <Bell size={18} />
          <span className="hidden md:inline">Notif.</span>
          {/* Badge de notificaciones no leídas */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-xs flex items-center justify-center font-bold px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/solicitudes"
          className={({ isActive }) =>
            `relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
            }`
          }
        >
          <UserPlus size={18} />
          <span className="hidden md:inline">Solicitudes</span>
          {/* Badge de solicitudes pendientes */}
          {pendingRequestsCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-orange-500 rounded-full text-xs flex items-center justify-center font-bold px-1">
              {pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}
            </span>
          )}
        </NavLink>
      </nav>

      {/* DERECHA - Avatar y toggle sidebar derecho */}
      <div className="flex items-center gap-3">
        {/* Toggle sidebar derecho (Cola y Amigos) - Primero para que sea visible */}
        <button
          onClick={onToggleRight}
          className="hidden lg:flex p-2 hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
          aria-label="Toggle right sidebar"
          title={rightOpen ? "Ocultar Cola/Amigos" : "Mostrar Cola/Amigos"}
        >
          {rightOpen ? (
            <PanelRightClose size={20} />
          ) : (
            <PanelRightOpen size={20} />
          )}
        </button>

        {/* Dropdown de perfil */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="User menu"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.nick}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">
                {user?.nick.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <ChevronDown
              size={16}
              className={`hidden sm:block transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50">
              {/* Info del usuario */}
              <div className="px-4 py-3 border-b border-neutral-800">
                <p className="font-semibold text-sm truncate">
                  {user?.role === "admin" || user?.role === "super_admin"
                    ? user?.nick
                    : user?.nombreArtistico ||
                      `${user?.nombre} ${user?.apellidos}`}
                </p>
                {user?.role !== "admin" &&
                  user?.role !== "super_admin" &&
                  user?.nombreArtistico && (
                    <p className="text-xs text-neutral-400 truncate">
                      @{user?.nick}
                    </p>
                  )}
              </div>

              {/* Opciones */}
              <div className="py-1">
                <NavLink
                  to={
                    user?.role === "admin" || user?.role === "super_admin"
                      ? "/admin"
                      : `/perfil/${user?.nick || ""}`
                  }
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-800 transition-colors text-sm"
                >
                  <User size={16} />
                  <span>
                    {user?.role === "admin" || user?.role === "super_admin"
                      ? "Panel de Admin"
                      : "Ver perfil"}
                  </span>
                </NavLink>

                <NavLink
                  to="/configuracion"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-800 transition-colors text-sm"
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </NavLink>
              </div>

              {/* Cerrar sesión */}
              <div className="border-t border-neutral-800 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-red-500 transition-colors text-sm"
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
