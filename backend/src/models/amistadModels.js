// src/models/amistadModel.js
import { Schema, model } from "mongoose";

const AmistadSchema = new Schema(
  {
    solicitante: {
      type: Schema.Types.ObjectId,
      ref: "Usuario", // el que envía la solicitud
      required: true,
    },
    receptor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario", // el que recibe la solicitud
      required: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "aceptada", "rechazada", "bloqueada"],
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  }
);

// Evitar duplicados: que no existan dos documentos para la misma pareja
AmistadSchema.index({ solicitante: 1, receptor: 1 }, { unique: true });
// 2) Índices para buscar rápido solicitudes y amigos de un usuario
AmistadSchema.index({ solicitante: 1, estado: 1 });
AmistadSchema.index({ receptor: 1, estado: 1 });

export const Amistad = model("Amistad", AmistadSchema);
