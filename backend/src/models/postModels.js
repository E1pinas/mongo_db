import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    contenido: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    tipo: {
      type: String,
      enum: [
        "texto",
        "repost_cancion",
        "repost_album",
        "repost_playlist",
        "repost_post",
      ],
      required: true,
      default: "texto",
      index: true,
    },
    // Referencia al recurso (canción, álbum o playlist)
    recursoId: {
      type: Schema.Types.ObjectId,
      refPath: "tipoRecurso",
    },
    tipoRecurso: {
      type: String,
      enum: ["Cancion", "Album", "Playlist"],
    },
    // Referencia al post original (para repost_post)
    postOriginal: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      index: true,
    },
    // Arrays para likes, comentarios y reposts embebidos
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],
    comentarios: [
      {
        usuario: {
          type: Schema.Types.ObjectId,
          ref: "Usuario",
          required: true,
        },
        contenido: {
          type: String,
          required: true,
          maxlength: 300,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reposts: [
      {
        usuario: {
          type: Schema.Types.ObjectId,
          ref: "Usuario",
          required: true,
        },
        comentario: {
          type: String,
          maxlength: 200,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    estaEliminado: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compuestos para queries eficientes
postSchema.index({ usuario: 1, createdAt: -1 });
postSchema.index({ tipo: 1, createdAt: -1 });
postSchema.index({ estaEliminado: 1, createdAt: -1 });

// Virtuals para contadores
postSchema.virtual("totalLikes").get(function () {
  return this.likes ? this.likes.length : 0;
});

postSchema.virtual("totalComentarios").get(function () {
  return this.comentarios ? this.comentarios.length : 0;
});

postSchema.virtual("totalReposts").get(function () {
  return this.reposts ? this.reposts.length : 0;
});

export default model("Post", postSchema);
