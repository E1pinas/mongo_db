import { useMemo } from "react";
import type { Notificacion } from "../../../types";
import type { TipoFiltro } from "../tipos";

interface UseNotificacionesFiltradasParams {
  notificaciones: Notificacion[];
  filtro: TipoFiltro;
}

export const useNotificacionesFiltradas = ({
  notificaciones,
  filtro,
}: UseNotificacionesFiltradasParams) => {
  const notificacionesFiltradas = useMemo(() => {
    if (filtro === "todas") return notificaciones;

    return notificaciones.filter((notif) => {
      if (filtro === "musica") {
        return [
          "nueva_cancion_artista",
          "nuevo_album_artista",
          "nueva_playlist_artista",
        ].includes(notif.tipo);
      }

      if (filtro === "social") {
        return [
          "nuevo_seguidor",
          "solicitud_amistad",
          "amistad_aceptada",
          "nuevo_post",
          "like_post",
          "comentario_post",
          "repost",
        ].includes(notif.tipo);
      }

      if (filtro === "sistema") {
        return notif.tipo === "sistema";
      }

      return true;
    });
  }, [notificaciones, filtro]);

  const hayNoLeidas = notificaciones.some((n) => !n.leida);

  return {
    notificacionesFiltradas,
    hayNoLeidas,
  };
};
