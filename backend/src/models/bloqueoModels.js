import { Schema, model } from "mongoose";

/**
 * Esquema de Bloqueos
 * Registra cuando un usuario (bloqueador) bloquea a otro (bloqueado)
 */
const bloqueoSchema = new Schema(
  {
    // Usuario que realiza el bloqueo
    bloqueador: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },

    // Usuario que es bloqueado
    bloqueado: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },

    // Razón del bloqueo (opcional)
    razon: {
      type: String,
      maxlength: 200,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

// Índice compuesto para evitar bloqueos duplicados y mejorar rendimiento
bloqueoSchema.index({ bloqueador: 1, bloqueado: 1 }, { unique: true });

// Índice inverso para consultas bidireccionales
bloqueoSchema.index({ bloqueado: 1, bloqueador: 1 });

export default model("Bloqueo", bloqueoSchema);
