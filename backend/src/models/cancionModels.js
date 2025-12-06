import { Schema, model } from "mongoose";

const cancionSchema = new Schema(
  {
    // Título de la canción
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Artista(s) que la interpretan (usuarios de tu app)
    artistas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
      },
    ],

    // Álbum al que pertenece (opcional si es single)
    album: {
      type: Schema.Types.ObjectId,
      ref: "Album",
      default: null,
    },

    // Si es un single suelto
    esSingle: {
      type: Boolean,
      default: false,
    },

    // Duración en segundos
    duracionSegundos: {
      type: Number,
      required: true,
      min: 1,
    },

    // Géneros musicales (mismo enum que en User)
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

    // URL del archivo de audio (R2 / S3 / etc.)
    audioUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Portada específica de la canción (opcional)
    portadaUrl: {
      type: String,
      default: "",
    },

    // Visibilidad de la canción
    esPrivada: {
      type: Boolean,
      default: false,
    },

    // Contenido explícito (lenguaje, temas adultos, etc.)
    esExplicita: {
      type: Boolean,
      default: false,
    },

    // Métricas básicas
    reproduccionesTotales: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Usuarios que han dado like a la canción
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],

    // Borrado lógico (por si la “eliminan”)
    estaEliminada: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsqueda rápida
cancionSchema.index({ titulo: "text" });
cancionSchema.index({ artistas: 1 });
cancionSchema.index({ album: 1 });

export const Cancion = model("Cancion", cancionSchema);
