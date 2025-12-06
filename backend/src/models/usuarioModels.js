import { Schema, model } from "mongoose";

const usuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    apellidos: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    nick: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    nombreArtistico: {
      type: String,
      trim: true,
      maxlength: 50,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    password: { type: String, required: true },
    pais: {
      type: String,
      required: true,
    },
    avatarUrl: { type: String, default: "" }, // Foto de perfil circular
    bannerUrl: { type: String, default: "" }, // Portada de perfil (fondo)
    descripcion: { type: String, default: "" },
    fechaNacimiento: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
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
    redes: {
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
      x: { type: String, default: "" },
    },

    misCanciones: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cancion",
      },
    ],

    misAlbumes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Album",
      },
    ],

    playlistsCreadas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
    biblioteca: {
      cancionesGuardadas: [
        {
          type: Schema.Types.ObjectId,
          ref: "Cancion",
        },
      ],
      playlistsGuardadas: [
        {
          type: Schema.Types.ObjectId,
          ref: "Playlist",
        },
      ],
      albumesGuardados: [
        {
          type: Schema.Types.ObjectId,
          ref: "Album",
        },
      ],
      artistasGuardados: [
        {
          type: Schema.Types.ObjectId,
          ref: "Usuario",
        },
      ],
    },
    historialBusquedasInput: [
      {
        termino: { type: String },
        fecha: { type: Date, default: Date.now },
      },
    ],

    // 🎧 Historial de lo que ESCUCHAS (últimas canciones)
    historialReproducciones: [
      {
        cancion: { type: Schema.Types.ObjectId, ref: "Cancion" },
        fecha: { type: Date, default: Date.now },
      },
    ],
    estadisticas: {
      reproduccionesTotales: { type: Number, default: 0 },
      totalSeguidores: { type: Number, default: 0 },
      totalSeguidos: { type: Number, default: 0 },
      amigosTotales: { type: Number, default: 0 },
      totalCancionesSubidas: { type: Number, default: 0 },
      totalAlbumesSubidos: { type: Number, default: 0 },
      totalLikesRecibidos: { type: Number, default: 0 },
      tiempoTotalEscuchado: { type: Number, default: 0 }, // minutos
      totalCancionesEscuchadas: { type: Number, default: 0 },
      totalArtistasEscuchados: { type: Number, default: 0 },
      promedioDiarioEscucha: { type: Number, default: 0 }, // minutos/día
    },

    // ⚙️ CONFIG DE ESTADÍSTICAS (por si el user quiere más privacidad)
    configEstadisticas: {
      guardarHistorial: { type: Boolean, default: true },
      mostrarEnPerfil: { type: Boolean, default: true },
      recibirResumenSemanal: { type: Boolean, default: true },
    },
    reportes: [
      {
        motivo: { type: String },
        fecha: { type: Date, default: Date.now },
      },
    ],

    // MODERACIÓN Y ADMIN
    baneado: { type: Boolean, default: false },
    razonBaneo: { type: String, default: null },
    suspendidoHasta: { type: Date, default: null },
    razonSuspension: { type: String, default: null },
    verificado: { type: Boolean, default: false }, // Badge de verificación

    // CONEXIÓN WEB / ESTADO
    ultimaConexion: { type: Date },
    estaConectado: { type: Boolean, default: false },
    cantidadIniciosSesion: { type: Number, default: 0 },
    estaActivo: { type: Boolean, default: true },

    // Configuración de privacidad
    privacy: {
      perfilPublico: { type: Boolean, default: true }, // ¿Se puede ver su perfil?
      mostrarUltimoIngreso: { type: Boolean, default: true }, // ¿Mostrar "última vez activo"?
      mostrarEstadoConectado: { type: Boolean, default: true }, // ¿Ver online/offline?
      permitirVerPerfil: {
        type: String,
        enum: ["publico", "solo-seguidores", "nadie"],
        default: "publico",
      },
      recibirSolicitudesAmistad: { type: Boolean, default: true }, // ¿Puede recibir solicitudes de amistad?
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Usuario = model("Usuario", usuarioSchema);
