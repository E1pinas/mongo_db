import { useState, useEffect } from "react";
import { servicioPerfil } from "../servicios";
import type { EstadoRelacion } from "../tipos";

export const useEstadoRelacion = (
  usuarioPerfilId: string | undefined,
  usuarioActualId: string | undefined
) => {
  const [estadoRelacion, setEstadoRelacion] =
    useState<EstadoRelacion>("ninguno");
  const [solicitudId, setSolicitudId] = useState<string | undefined>();
  const [aceptaSolicitudes, setAceptaSolicitudes] = useState(true);
  const [estaSiguiendo, setEstaSiguiendo] = useState(false);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  const verificarRelaciones = async () => {
    if (
      !usuarioPerfilId ||
      !usuarioActualId ||
      usuarioPerfilId === usuarioActualId
    )
      return;

    try {
      // Verificar amistad
      const estadoAmistad = await servicioPerfil.verificarEstadoAmistad(
        usuarioPerfilId
      );
      setEstadoRelacion(estadoAmistad.estado);
      setSolicitudId(estadoAmistad.solicitudId);
      setAceptaSolicitudes(estadoAmistad.aceptaSolicitudes);

      // Verificar seguimiento
      const siguiendo = await servicioPerfil.verificarSiSigue(usuarioPerfilId);
      setEstaSiguiendo(siguiendo);
    } catch (error) {
      console.error("Error al verificar relaciones:", error);
    }
  };

  useEffect(() => {
    verificarRelaciones();
  }, [usuarioPerfilId, usuarioActualId]);

  const seguir = async () => {
    if (!usuarioPerfilId) return;
    try {
      setCargandoAccion(true);
      await servicioPerfil.seguirUsuario(usuarioPerfilId);
      setEstaSiguiendo(true);
    } catch (error) {
      console.error("Error al seguir:", error);
      throw error;
    } finally {
      setCargandoAccion(false);
    }
  };

  const dejarDeSeguir = async () => {
    if (!usuarioPerfilId) return;
    try {
      setCargandoAccion(true);
      await servicioPerfil.dejarDeSeguir(usuarioPerfilId);
      setEstaSiguiendo(false);
    } catch (error) {
      console.error("Error al dejar de seguir:", error);
      throw error;
    } finally {
      setCargandoAccion(false);
    }
  };

  const enviarSolicitudAmistad = async () => {
    if (!usuarioPerfilId) return;
    try {
      setCargandoAccion(true);
      await servicioPerfil.enviarSolicitudAmistad(usuarioPerfilId);
      await verificarRelaciones();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      throw error;
    } finally {
      setCargandoAccion(false);
    }
  };

  const aceptarSolicitud = async () => {
    if (!solicitudId) return;
    try {
      setCargandoAccion(true);
      await servicioPerfil.aceptarSolicitudAmistad(solicitudId);
      await verificarRelaciones();
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      throw error;
    } finally {
      setCargandoAccion(false);
    }
  };

  const rechazarSolicitud = async () => {
    if (!solicitudId) return;
    try {
      setCargandoAccion(true);
      await servicioPerfil.rechazarSolicitudAmistad(solicitudId);
      await verificarRelaciones();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      throw error;
    } finally {
      setCargandoAccion(false);
    }
  };

  const cancelarSolicitud = async () => {
    if (!solicitudId) return;
    try {
      setCargandoAccion(true);
      await servicioPerfil.cancelarSolicitudEnviada(solicitudId);
      await verificarRelaciones();
    } catch (error) {
      console.error("Error al cancelar solicitud:", error);
      throw error;
    } finally {
      setCargandoAccion(false);
    }
  };

  const eliminarAmistad = async () => {
    if (!usuarioPerfilId) return;
    try {
      setCargandoAccion(true);
      await servicioPerfil.eliminarAmistad(usuarioPerfilId);
      await verificarRelaciones();
    } catch (error) {
      console.error("Error al eliminar amistad:", error);
      throw error;
    } finally {
      setCargandoAccion(false);
    }
  };

  return {
    estadoRelacion,
    solicitudId,
    aceptaSolicitudes,
    estaSiguiendo,
    cargandoAccion,
    seguir,
    dejarDeSeguir,
    enviarSolicitudAmistad,
    aceptarSolicitud,
    rechazarSolicitud,
    cancelarSolicitud,
    eliminarAmistad,
    recargarRelaciones: verificarRelaciones,
  };
};
