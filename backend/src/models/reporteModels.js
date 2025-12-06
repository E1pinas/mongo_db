import { Schema, model } from "mongoose";

const reporteSchema = new Schema(
  {
    reportadoPor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    tipoContenido: {
      type: String,
      enum: ["cancion", "album", "playlist", "usuario", "comentario"],
      required: true,
    },
    contenidoId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    motivo: {
      type: String,
      enum: [
        "spam",
        "contenido_inapropiado",
        "derechos_autor",
        "incitacion_odio",
        "acoso",
        "informacion_falsa",
        "otro",
      ],
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en_revision", "resuelto", "rechazado"],
      default: "pendiente",
    },
    prioridad: {
      type: String,
      enum: ["baja", "media", "alta", "urgente"],
      default: "media",
    },
    resolucion: {
      accion: {
        type: String,
        enum: [
          "ninguna",
          "advertencia",
          "eliminar_contenido",
          "suspender_usuario",
          "banear_usuario",
        ],
      },
      nota: String,
      resueltoPor: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
      fechaResolucion: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
reporteSchema.index({ estado: 1, prioridad: -1, createdAt: -1 });
reporteSchema.index({ tipoContenido: 1, contenidoId: 1 });
reporteSchema.index({ reportadoPor: 1 });

export const Reporte = model("Reporte", reporteSchema);
