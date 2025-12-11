import { NavLink } from "react-router-dom";
import {
  Library,
  Music,
  Disc,
  ListMusic,
  Heart,
  Clock,
  X,
  Upload,
} from "lucide-react";
import RecentItems from "./RecentItems";

/**
 * SidebarLeft - Barra lateral izquierda (Biblioteca)
 *
 * FUNCIONALIDAD:
 * - Muestra biblioteca del usuario: Playlists, Álbumes, Artistas
 * - Colapsable: 260px (expandido) ↔ 76px (colapsado, solo iconos)
 * - En móvil: Overlay absoluto sobre el contenido
 *
 * RESPONSIVE:
 * - Mobile (<lg): Absolute overlay con backdrop, se muestra con isMobileOpen
 * - Desktop (≥lg): Sticky sidebar con ancho dinámico según isOpen
 *
 * CLAVES TAILWIND:
 * - lg:sticky lg:top-0: Fijo en desktop
 * - transition-all duration-300: Animación suave de colapso
 * - overflow-y-auto: Scroll interno si contenido es largo
 */

interface SidebarLeftProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function SidebarLeft({
  isOpen,
  isMobileOpen,
  onCloseMobile,
}: SidebarLeftProps) {
  // Estilos para móvil (overlay)
  const mobileClasses = isMobileOpen
    ? "fixed inset-0 z-50 lg:hidden"
    : "hidden lg:block";

  // Ancho según estado colapsado
  const widthClass = isOpen ? "w-64" : "w-[76px]";

  return (
    <>
      {/* Backdrop para móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${mobileClasses}
          lg:relative lg:block
          ${widthClass}
          bg-neutral-950 border-r border-neutral-800
          transition-all duration-300
          overflow-y-auto
          h-full
          ${isMobileOpen ? "z-50" : ""}
        `}
      >
        <div className="p-4">
          {/* Header con botón cerrar (móvil) */}
          <div className="flex items-center justify-between mb-6 lg:mb-4">
            <div className="flex items-center gap-3">
              <Library size={24} className="text-neutral-400" />
              {isOpen && (
                <h2 className="font-semibold text-lg">Tu biblioteca</h2>
              )}
            </div>
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filtros de biblioteca */}
          <div className="space-y-2 mb-6">
            <NavLink
              to="/subir"
              className={`
                flex items-center gap-3 w-full p-3 rounded-lg
                bg-blue-500/10 hover:bg-blue-500/20 transition-colors
                border border-blue-500/30
                ${!isOpen && "justify-center"}
              `}
            >
              <Upload size={20} className="text-blue-400 shrink-0" />
              {isOpen && (
                <span className="text-sm font-semibold text-blue-400">
                  Subir Música
                </span>
              )}
            </NavLink>

            <NavLink
              to="/canciones-favoritas"
              className={({ isActive }) => `
                flex items-center gap-3 w-full p-3 rounded-lg
                hover:bg-neutral-800 transition-colors
                ${!isOpen && "justify-center"}
                ${isActive ? "bg-neutral-800 text-orange-400" : ""}
              `}
            >
              <Heart size={20} className="shrink-0" />
              {isOpen && (
                <span className="text-sm">Canciones que me gustan</span>
              )}
            </NavLink>

            <NavLink
              to="/biblioteca/playlists"
              className={({ isActive }) => `
                flex items-center gap-3 w-full p-3 rounded-lg
                hover:bg-neutral-800 transition-colors
                ${!isOpen && "justify-center"}
                ${isActive ? "bg-neutral-800 text-orange-400" : ""}
              `}
            >
              <ListMusic size={20} className="shrink-0" />
              {isOpen && <span className="text-sm">Playlists</span>}
            </NavLink>

            <NavLink
              to="/biblioteca/artistas"
              className={({ isActive }) => `
                flex items-center gap-3 w-full p-3 rounded-lg
                hover:bg-neutral-800 transition-colors
                ${!isOpen && "justify-center"}
                ${isActive ? "bg-neutral-800 text-orange-400" : ""}
              `}
            >
              <Music size={20} className="shrink-0" />
              {isOpen && <span className="text-sm">Artistas</span>}
            </NavLink>

            <NavLink
              to="/biblioteca/albumes"
              className={({ isActive }) => `
                flex items-center gap-3 w-full p-3 rounded-lg
                hover:bg-neutral-800 transition-colors
                ${!isOpen && "justify-center"}
                ${isActive ? "bg-neutral-800 text-orange-400" : ""}
              `}
            >
              <Disc size={20} className="shrink-0" />
              {isOpen && <span className="text-sm">Álbumes</span>}
            </NavLink>
          </div>

          {/* Sección de elementos recientes */}
          {isOpen && <RecentItems />}

          {/* Solo iconos cuando está colapsado */}
        </div>
      </aside>
    </>
  );
}
