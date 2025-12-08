import { useEffect } from "react";
import { useAuth } from "../contexts";
import { presenceService } from "../services/presence.service";

/**
 * Hook para mantener el estado de presencia del usuario
 * Envía heartbeats cada 3 minutos mientras el usuario está autenticado
 */
export const usePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Enviar heartbeat inicial
    presenceService.heartbeat();

    // Enviar heartbeat cada 3 minutos (180,000 ms)
    const interval = setInterval(() => {
      presenceService.heartbeat();
    }, 3 * 60 * 1000);

    // Enviar heartbeat al cerrar/recargar la página
    const handleBeforeUnload = () => {
      // Este no se enviará porque el navegador cancela las requests al cerrar
      // pero el backend lo manejará con el timeout de inactividad
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);
};
