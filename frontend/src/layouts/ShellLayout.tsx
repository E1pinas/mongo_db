import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../components/layout/TopNav";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import PlayerBar from "../components/layout/PlayerBar";
import WelcomeModal from "../components/common/WelcomeModal";
import { useAuth } from "../contexts";

/**
 * ShellLayout - Layout principal tipo Spotify
 *
 * ESTRUCTURA:
 * - Grid de altura completa (h-screen) con 3 filas: topbar, contenido, player
 * - Fila contenido usa grid de 3 columnas: sidebar-left, main, sidebar-right
 * - Las columnas cambian dinámicamente según el estado colapsado
 *
 * CLAVES DE TAILWIND:
 * - h-screen: Altura completa de viewport
 * - overflow-hidden: Previene scroll global
 * - grid grid-rows-[auto_1fr_auto]: Topbar y player auto, contenido flexible
 * - overflow-y-auto: Solo el main central tiene scroll
 * - sticky/fixed: Sidebars y barras permanecen fijos
 *
 * RESPONSIVE:
 * - Sidebar izquierdo: Oculto en móvil (absolute overlay), visible en desktop
 * - Sidebar derecho: Oculto hasta lg (1024px)
 * - Estado leftOpen/rightOpen controla colapso de sidebars
 */

export default function ShellLayout() {
  // Estado para controlar colapso de sidebars
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftMobileOpen, setLeftMobileOpen] = useState(false);

  // Hook de autenticación
  const { needsProfileSetup, completeProfileSetup, refreshProfile } = useAuth();

  const handleCompleteSetup = async () => {
    await refreshProfile();
    completeProfileSetup();
  };

  // Toggle handlers
  const toggleLeft = () => setLeftOpen(!leftOpen);
  const toggleRight = () => setRightOpen(!rightOpen);
  const toggleLeftMobile = () => setLeftMobileOpen(!leftMobileOpen);

  return (
    <div className="h-screen overflow-hidden bg-black text-white flex flex-col">
      {/* Modal de bienvenida (obligatorio) */}
      {needsProfileSetup && <WelcomeModal onComplete={handleCompleteSetup} />}

      {/* TOPBAR - Fija arriba */}
      <TopNav
        onToggleLeft={toggleLeft}
        onToggleRight={toggleRight}
        onToggleLeftMobile={toggleLeftMobile}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
      />

      {/* CONTENIDO PRINCIPAL - Grid con sidebars y main */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[auto_1fr_auto]">
        {/* SIDEBAR IZQUIERDO */}
        <SidebarLeft
          isOpen={leftOpen}
          isMobileOpen={leftMobileOpen}
          onCloseMobile={() => setLeftMobileOpen(false)}
        />

        {/* MAIN - Área central con scroll */}
        <main className="overflow-y-auto bg-neutral-900">
          <Outlet />
        </main>

        {/* SIDEBAR DERECHO - Cola y Amigos (visible desde lg: 1024px+) */}
        <SidebarRight isOpen={rightOpen} />
      </div>

      {/* PLAYER BAR - Fijo abajo */}
      <PlayerBar />
    </div>
  );
}
