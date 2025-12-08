// models/Notificacion.js
import { Schema, model } from "mongoose";
// Si usas CommonJS:
// const { Schema, model } = require("mongoose");

const recursoSchema = new Schema(
  {
    tipo: {
      type: String,
      enum: ["user", "song", "album", "playlist", "comment", "post"],
    },
    id: {
      type: Schema.Types.ObjectId,
    },
  },
  { _id: false }
);

const notificacionSchema = new Schema(
  {
    // Usuario que RECIBE la notificación
    usuarioDestino: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    // Usuario que la GENERA (puede ser null para sistema)
    usuarioOrigen: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },

    // Tipo de notificación (para que en frontend sepas qué icono/acción mostrar)
    tipo: {
      type: String,
      enum: [
        "nuevo_seguidor",
        "solicitud_amistad",
        "amistad_aceptada",
        "comentario_en_perfil",
        "respuesta_comentario",
        "like_comentario",
        "nueva_cancion_artista",
        "nuevo_album_artista",
        "nueva_playlist_artista",
        "nuevo_post",
        "like_post",
        "comentario_post",
        "repost",
        "sistema",
        "moderacion_advertencia",
        "moderacion_suspension",
        "moderacion_baneo",
        "moderacion_contenido_eliminado",
        "moderacion_reactivacion",
      ],
      required: true,
    },

    // Texto que se mostrará al usuario
    mensaje: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // Referencia opcional al recurso relacionado
    recurso: recursoSchema,

    // Si ya la ha visto/abierto el usuario
    leida: {
      type: Boolean,
      default: false,
    },

    // Si la notificación está oculta (por bloqueo u otra razón)
    oculta: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Para sacar rápido las notificaciones nuevas de un usuario
notificacionSchema.index({
  usuarioDestino: 1,
  leida: 1,
  createdAt: -1,
});

export const Notificacion = model("Notificacion", notificacionSchema);
// CommonJS: module.exports = model("Notificacion", notificacionSchema);
