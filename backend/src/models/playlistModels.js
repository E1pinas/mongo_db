import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    // Usuario que crea la playlist
    creador: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    // Título de la playlist
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    portadaUrl: {
      type: String,
      default: "",
    },

    // Pública o privada
    esPublica: {
      type: Boolean,
      default: true,
    },

    // ¿Otros pueden añadir canciones?
    esColaborativa: {
      type: Boolean,
      default: false,
    },

    // Usuarios invitados que pueden colaborar (solo si esColaborativa = true)
    colaboradores: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],

    // Usuarios que siguen esta playlist
    seguidores: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],

    // Canciones que contiene la playlist (simple array de IDs)
    canciones: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cancion",
      },
    ],

    // Borrado lógico
    estaEliminada: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para listar playlists de un usuario o públicas
playlistSchema.index({ creador: 1, esPublica: 1 });
playlistSchema.index({ titulo: "text" });

export const Playlist = model("Playlist", playlistSchema);
