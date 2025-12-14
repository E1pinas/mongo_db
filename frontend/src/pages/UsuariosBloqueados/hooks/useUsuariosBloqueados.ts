import { useState, useEffect } from "react";
import { bloqueoService } from "../../../services/bloqueo.service";

export const useUsuariosBloqueados = () => {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarBloqueados();
  }, []);

  const cargarBloqueados = async () => {
    try {
      setCargando(true);
      const response = await bloqueoService.obtenerBloqueados();
      setBlockedUsers(response.bloqueados || []);
    } catch (error) {
      console.error("Error loading blocked users:", error);
    } finally {
      setCargando(false);
    }
  };

  return { blockedUsers, setBlockedUsers, cargando };
};
