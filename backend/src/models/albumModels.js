import { Schema, model } from "mongoose";

const albumSchema = new Schema(
  {
    // Título del álbum
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Artistas del álbum (pueden ser varios)
    artistas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
      },
    ],

    // Descripción del álbum
    descripcion: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Portada del álbum
    portadaUrl: {
      type: String,
      default: "",
    },

    // Géneros del álbum
    generos: {
      type: [String],
      enum: [
        "rock",
        "pop",
        "jazz",
        "electronic",
        "hiphop",
        "classical",
        "reggaeton",
        "indie",
        "latino",
        "urbano",
      ],
      default: [],
    },

    // Canciones que pertenecen a este álbum
    canciones: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cancion",
      },
    ],

    // Fecha de lanzamiento
    fechaLanzamiento: {
      type: Date,
      default: null,
    },

    // Privacidad del álbum
    esPrivado: {
      type: Boolean,
      default: false,
    },

    // Métricas
    reproduccionesTotales: {
      type: Number,
      default: 0,
      min: 0,
    },

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
  },
  {
    timestamps: true,
  }
);

// Índices para listar álbumes de un artista
albumSchema.index({ artistas: 1, fechaLanzamiento: -1 });
albumSchema.index({ titulo: "text" });

export const Album = model("Album", albumSchema);
