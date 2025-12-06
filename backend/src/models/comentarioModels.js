// models/Comentario.js
import { Schema, model } from "mongoose";
// Si usas CommonJS:
// const { Schema, model } = require("mongoose");

const comentarioSchema = new Schema(
  {
    // Quién escribe el comentario
    autor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    // Perfil (usuario/artista) donde se deja el comentario (opcional)
    perfilDestino: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
    },

    // Canción donde se deja el comentario (opcional)
    cancionDestino: {
      type: Schema.Types.ObjectId,
      ref: "Cancion",
    },

    // Comentario padre (para respuestas anidadas)
    comentarioPadre: {
      type: Schema.Types.ObjectId,
      ref: "Comentario",
      default: null,
    },

    // Texto principal del comentario
    texto: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },

    // Usuarios que han dado "like" al comentario
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],

    // Borrado lógico
    estaEliminado: {
      type: Boolean,
      default: false,
    },

    // Editado
    estaEditado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Índices útiles: listar comentarios de un perfil o canción por fecha
comentarioSchema.index({ perfilDestino: 1, createdAt: -1 });
comentarioSchema.index({ cancionDestino: 1, createdAt: -1 });
comentarioSchema.index({ comentarioPadre: 1, createdAt: 1 });

export const Comentario = model("Comentario", comentarioSchema);
// CommonJS: module.exports = model("Comentario", comentarioSchema);
