// src/models/reproduccionModel.js
import { Schema, model } from "mongoose";

const ReproduccionSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario", // quién escucha
      required: true,
    },
    cancion: {
      type: Schema.Types.ObjectId,
      ref: "Cancion", // qué canción escucha
      required: true,
    },
    artista: {
      type: Schema.Types.ObjectId,
      ref: "Usuario", // quién es el creador de esa canción
      required: true,
    },
    album: {
      type: Schema.Types.ObjectId,
      ref: "Album", // si pertenece a un álbum
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Índice útil para consultas de "qué ha escuchado un usuario"
ReproduccionSchema.index({ usuario: 1, createdAt: -1 });

// Índice útil para top canciones / top artistas
ReproduccionSchema.index({ cancion: 1 });
ReproduccionSchema.index({ artista: 1 });
ReproduccionSchema.index({ album: 1 });

export const Reproduccion = model("Reproduccion", ReproduccionSchema);
