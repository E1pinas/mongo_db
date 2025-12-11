import { Notificacion } from "../models/notificacionModels.js";

/**
 * Enviar notificación de moderación a un usuario
 * @param {String} usuarioId - ID del usuario que recibe la notificación
 * @param {String} tipo - Tipo de notificación de moderación
 * @param {String} mensaje - Mensaje para el usuario
 * @param {String} razon - Razón de la acción (opcional, se añade al mensaje)
 */
export const enviarNotificacionModeracion = async (
  usuarioId,
  tipo,
  mensaje,
  razon = null
) => {
  try {
    let mensajeFinal = mensaje;

    // Si hay una razón, añadirla al mensaje
    if (razon) {
      mensajeFinal = `${mensaje}\n\nMotivo: ${razon}`;
    }

    const notificacion = new Notificacion({
      usuarioDestino: usuarioId,
      usuarioOrigen: null, // Sistema/moderación no tiene usuario origen
      tipo,
      mensaje: mensajeFinal,
      leida: false,
    });

    await notificacion.save();

    return notificacion;
  } catch (error) {
    console.error("Error al crear notificación de moderación:", error);
    throw error;
  }
};

/**
 * Crear notificaciones según el tipo de acción de moderación
 */
export const notificacionesModeracion = {
  /**
   * Notificación por advertencia
   */
  advertencia: async (usuarioId, tipoContenido, razon) => {
    const tipos = {
      cancion: "canción",
      album: "álbum",
      playlist: "playlist",
      comentario: "comentario",
      usuario: "comportamiento",
    };

    const tipo = tipos[tipoContenido] || "contenido";
    const mensaje =
      tipoContenido === "usuario"
        ? "⚠️ Has recibido una advertencia del equipo de moderación."
        : `⚠️ Has recibido una advertencia por tu ${tipo}.`;

    return await enviarNotificacionModeracion(
      usuarioId,
      "moderacion_advertencia",
      mensaje,
      razon
    );
  },

  /**
   * Notificación por suspensión temporal
   */
  suspension: async (usuarioId, dias, razon) => {
    return await enviarNotificacionModeracion(
      usuarioId,
      "moderacion_suspension",
      `🔒 Tu cuenta ha sido suspendida temporalmente por ${dias} días.`,
      razon
    );
  },

  /**
   * Notificación por baneo permanente
   */
  baneo: async (usuarioId, razon) => {
    return await enviarNotificacionModeracion(
      usuarioId,
      "moderacion_baneo",
      "🚫 Tu cuenta ha sido desactivada permanentemente.",
      razon
    );
  },

  /**
   * Notificación por canción oculta (no eliminada, solo no reproducible)
   */
  cancionOculta: async (usuarioId, nombreCancion, razon) => {
    return await enviarNotificacionModeracion(
      usuarioId,
      "moderacion_cancion_oculta",
      `🚫 Tu canción "${nombreCancion}" ha sido ocultada por el equipo de moderación. La canción sigue existiendo pero no se puede reproducir.`,
      razon
    );
  },

  /**
   * Notificación por contenido eliminado
   */
  contenidoEliminado: async (
    usuarioId,
    tipoContenido,
    nombreContenido,
    razon
  ) => {
    const tipos = {
      cancion: "canción",
      album: "álbum",
      playlist: "playlist",
      comentario: "comentario",
    };

    const tipo = tipos[tipoContenido] || "contenido";

    return await enviarNotificacionModeracion(
      usuarioId,
      "moderacion_contenido_eliminado",
      `🗑️ Tu ${tipo} "${nombreContenido}" ha sido eliminado por el equipo de moderación.`,
      razon
    );
  },

  /**
   * Notificación por reactivación de cuenta
   */
  reactivacion: async (usuarioId) => {
    return await enviarNotificacionModeracion(
      usuarioId,
      "moderacion_reactivacion",
      "✅ Tu cuenta ha sido reactivada. Ya puedes acceder nuevamente a la plataforma.",
      null
    );
  },
};
