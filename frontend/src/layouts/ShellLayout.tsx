import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../components/layout/TopNav";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import PlayerBar from "../components/layout/PlayerBar";
import WelcomeModal from "../components/common/WelcomeModal";
import { useAuth } from "../contexts";



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
