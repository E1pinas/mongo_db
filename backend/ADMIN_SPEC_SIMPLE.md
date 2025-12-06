# 🎛️ ESPECIFICACIÓN BACKEND - PANEL DE ADMINISTRACIÓN

## 📋 Índice

1. [Modelo de Admin](#1-modelo-de-admin)
2. [Autenticación](#2-autenticación)
3. [Gestión de Usuarios](#3-gestión-de-usuarios)
4. [Gestión de Contenido](#4-gestión-de-contenido)
5. [Moderación](#5-moderación)
6. [Analytics](#6-analytics)
7. [Configuración](#7-configuración)

---

## 1. Modelo de Admin

### Schema: Admin

```javascript
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellidos: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    ultimaConexion: {
      type: Date,
      default: null,
    },
    estaActivo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
adminSchema.index({ email: 1 });

// Hash password antes de guardar
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar contraseñas
adminSchema.methods.compararPassword = async function (passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

// Método para generar JWT
adminSchema.methods.generarJWT = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      type: "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

export const Admin = model("Admin", adminSchema);
```

### Permisos del Admin

Un admin tiene **acceso completo** a todas las funcionalidades:

✅ **Usuarios**: Ver, suspender, banear, verificar, eliminar
✅ **Contenido**: Ver, editar, eliminar, destacar
✅ **Moderación**: Ver reportes, tomar acciones
✅ **Analytics**: Dashboard, estadísticas, exportar
✅ **Configuración**: Ajustes generales, destacados, banners

---

## 2. Autenticación

### Middleware: authAdmin

```javascript
// middlewares/authAdmin.js
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModels.js";

export const authAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Token no proporcionado",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Acceso denegado",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.estaActivo) {
      return res.status(401).json({
        ok: false,
        message: "Admin no encontrado o inactivo",
      });
    }

    // Actualizar última conexión
    admin.ultimaConexion = new Date();
    await admin.save();

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      ok: false,
      message: "Token inválido o expirado",
    });
  }
};
```

### Endpoints de Autenticación

#### POST `/api/admin/auth/login`

```javascript
// Request
{
  "email": "admin@plataforma.com",
  "password": "password123"
}

// Response Success
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "673d2a1b5f8e9c001234abcd",
    "nombre": "Carlos",
    "apellidos": "Administrador",
    "email": "admin@plataforma.com",
    "role": "admin",
    "avatarUrl": "https://..."
  },
  "expiresIn": 28800
}

// Response Error
{
  "ok": false,
  "message": "Credenciales incorrectas"
}
```

#### POST `/api/admin/auth/logout`

```javascript
// Headers: Authorization: Bearer {token}
// Response
{
  "ok": true,
  "message": "Sesión cerrada correctamente"
}
```

#### GET `/api/admin/auth/me`

```javascript
// Headers: Authorization: Bearer {token}
// Response
{
  "ok": true,
  "admin": {
    "id": "673d2a1b5f8e9c001234abcd",
    "nombre": "Carlos",
    "apellidos": "Administrador",
    "email": "admin@plataforma.com",
    "role": "admin",
    "avatarUrl": "https://...",
    "ultimaConexion": "2025-11-28T10:30:00.000Z",
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
}
```

---

## 3. Gestión de Usuarios

### GET `/api/admin/usuarios`

```javascript
// Query Params
{
  page: 1,
  limit: 50,
  search: "texto", // Busca en nick, email, nombre
  role: "user" | "admin",
  verificado: true | false,
  baneado: true | false,
  estaActivo: true | false,
  pais: "MX",
  fechaRegistroDesde: "2024-01-01",
  fechaRegistroHasta: "2024-12-31",
  ordenar: "createdAt" | "ultimaConexion" | "cantidadIniciosSesion",
  orden: "asc" | "desc"
}

// Response
{
  "ok": true,
  "usuarios": [
    {
      "id": "673d2a1b5f8e9c001234abcd",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "nick": "juanperez",
      "email": "juan@example.com",
      "avatarUrl": "https://...",
      "pais": "MX",
      "fechaNacimiento": "1995-05-20",
      "edad": 29,
      "verificado": false,
      "baneado": false,
      "estaActivo": true,
      "ultimaConexion": "2025-11-28T10:00:00.000Z",
      "cantidadIniciosSesion": 45,
      "estadisticas": {
        "totalCancionesSubidas": 5,
        "totalAlbumesSubidos": 1,
        "totalSeguidores": 250,
        "reproduccionesTotales": 15000
      },
      "createdAt": "2024-06-15T12:00:00.000Z"
    }
  ],
  "paginacion": {
    "total": 10523,
    "pagina": 1,
    "limite": 50,
    "totalPaginas": 211
  },
  "resumen": {
    "totalUsuarios": 10523,
    "usuariosActivos": 8500,
    "usuariosBaneados": 23,
    "usuariosVerificados": 150
  }
}
```

### GET `/api/admin/usuarios/:id`

```javascript
// Response
{
  "ok": true,
  "usuario": {
    "id": "673d2a1b5f8e9c001234abcd",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "nick": "juanperez",
    "email": "juan@example.com",
    "avatarUrl": "https://...",
    "portadaArtista": "https://...",
    "descripcion": "Artista indie...",
    "pais": "MX",
    "fechaNacimiento": "1995-05-20",
    "generos": ["rock", "indie"],
    "redes": {
      "instagram": "@juanperez",
      "youtube": "/juanperez",
      "spotify": "juanperez"
    },
    "verificado": false,
    "baneado": false,
    "estaActivo": true,
    "ultimaConexion": "2025-11-28T10:00:00.000Z",
    "cantidadIniciosSesion": 45,
    "estadisticas": {
      "totalCancionesSubidas": 5,
      "totalAlbumesSubidos": 1,
      "totalSeguidores": 250,
      "totalSiguiendo": 100,
      "reproduccionesTotales": 15000,
      "totalLikes": 1200
    },
    "biblioteca": {
      "cancionesGuardadas": 85,
      "playlistsGuardadas": 12,
      "albumesGuardados": 8,
      "artistasGuardados": 25
    },
    "reportes": {
      "recibidos": 2,
      "realizados": 5
    },
    "createdAt": "2024-06-15T12:00:00.000Z",
    "updatedAt": "2025-11-28T10:00:00.000Z"
  }
}
```

### PUT `/api/admin/usuarios/:id/suspender`

```javascript
// Request
{
  "duracionDias": 7, // null o 0 = permanente
  "razon": "Spam reiterado en comentarios"
}

// Response
{
  "ok": true,
  "message": "Usuario suspendido correctamente",
  "suspensionHasta": "2025-12-05T10:00:00.000Z"
}
```

### PUT `/api/admin/usuarios/:id/reactivar`

```javascript
// Response
{
  "ok": true,
  "message": "Usuario reactivado correctamente"
}
```

### PUT `/api/admin/usuarios/:id/banear`

```javascript
// Request
{
  "razon": "Violación grave de términos de servicio",
  "eliminarContenido": false // true = elimina canciones/álbumes
}

// Response
{
  "ok": true,
  "message": "Usuario baneado correctamente"
}
```

### PUT `/api/admin/usuarios/:id/desbanear`

```javascript
// Response
{
  "ok": true,
  "message": "Usuario desbaneado correctamente"
}
```

### PUT `/api/admin/usuarios/:id/verificar`

```javascript
// Marca usuario como verificado (badge azul)
// Response
{
  "ok": true,
  "message": "Usuario verificado correctamente"
}
```

### DELETE `/api/admin/usuarios/:id`

```javascript
// Query Params
{
  tipo: "anonimizar" | "eliminar_completo",
  eliminarContenido: true | false
}

// Response
{
  "ok": true,
  "message": "Usuario eliminado correctamente"
}
```

---

## 4. Gestión de Contenido

### 4.1 Canciones

#### GET `/api/admin/canciones`

```javascript
// Query Params
{
  page: 1,
  limit: 50,
  search: "título o artista",
  genero: "rock",
  esExplicita: true | false,
  esPrivada: true | false,
  estaEliminada: true | false,
  artistaId: "673d2a1b5f8e9c001234abcd",
  albumId: "673d2a1b5f8e9c001234abcd",
  fechaDesde: "2024-01-01",
  fechaHasta: "2024-12-31",
  ordenar: "createdAt" | "reproduccionesTotales" | "likes",
  orden: "asc" | "desc"
}

// Response
{
  "ok": true,
  "canciones": [
    {
      "id": "673d2a1b5f8e9c001234abcd",
      "titulo": "Mi Canción",
      "artistas": [
        {
          "id": "673d2a1b5f8e9c001234abcd",
          "nick": "juanperez",
          "avatarUrl": "https://..."
        }
      ],
      "album": {
        "id": "673d2a1b5f8e9c001234abcd",
        "titulo": "Mi Álbum",
        "portadaUrl": "https://..."
      },
      "duracionSegundos": 210,
      "audioUrl": "https://...",
      "portadaUrl": "https://...",
      "generos": ["rock", "indie"],
      "esExplicita": false,
      "esPrivada": false,
      "estaEliminada": false,
      "reproduccionesTotales": 5000,
      "likes": 450,
      "reportesActivos": 0,
      "createdAt": "2024-11-01T12:00:00.000Z"
    }
  ],
  "paginacion": {
    "total": 45000,
    "pagina": 1,
    "limite": 50,
    "totalPaginas": 900
  }
}
```

#### GET `/api/admin/canciones/:id`

```javascript
// Response con información detallada
{
  "ok": true,
  "cancion": {
    "id": "673d2a1b5f8e9c001234abcd",
    "titulo": "Mi Canción",
    "artistas": [...],
    "album": {...},
    "duracionSegundos": 210,
    "audioUrl": "https://...",
    "portadaUrl": "https://...",
    "generos": ["rock", "indie"],
    "esExplicita": false,
    "esPrivada": false,
    "estaEliminada": false,
    "reproduccionesTotales": 5000,
    "likes": 450,
    "reportesActivos": 2,
    "metadatos": {
      "formato": "mp3",
      "bitrate": "320kbps",
      "tamanioMB": 5.2
    },
    "createdAt": "2024-11-01T12:00:00.000Z",
    "updatedAt": "2024-11-15T10:00:00.000Z"
  }
}
```

#### PUT `/api/admin/canciones/:id`

```javascript
// Request
{
  "titulo": "Nuevo Título",
  "generos": ["rock", "alternative"],
  "esExplicita": true,
  "esPrivada": false
}

// Response
{
  "ok": true,
  "message": "Canción actualizada correctamente",
  "cancion": {...}
}
```

#### DELETE `/api/admin/canciones/:id`

```javascript
// Query Params
{
  tipo: "logico" | "permanente",
  razon: "Violación de derechos de autor"
}

// Response
{
  "ok": true,
  "message": "Canción eliminada correctamente"
}
```

#### POST `/api/admin/canciones/:id/restaurar`

```javascript
// Restaura una canción eliminada lógicamente
// Response
{
  "ok": true,
  "message": "Canción restaurada correctamente"
}
```

### 4.2 Álbumes

#### GET `/api/admin/albumes`

```javascript
// Similar a canciones con filtros específicos
{
  page: 1,
  limit: 50,
  search: "título o artista",
  genero: "rock",
  artistaId: "673d2a1b5f8e9c001234abcd",
  esPrivado: true | false,
  estaEliminado: true | false,
  fechaDesde: "2024-01-01",
  ordenar: "createdAt" | "fechaLanzamiento",
  orden: "desc"
}
```

#### GET `/api/admin/albumes/:id`

```javascript
// Response
{
  "ok": true,
  "album": {
    "id": "673d2a1b5f8e9c001234abcd",
    "titulo": "Mi Álbum",
    "artistas": [...],
    "descripcion": "Descripción del álbum",
    "portadaUrl": "https://...",
    "generos": ["rock"],
    "canciones": [
      {
        "cancion": {...},
        "orden": 1
      }
    ],
    "fechaLanzamiento": "2024-11-01",
    "esPrivado": false,
    "estaEliminado": false,
    "reproduccionesTotales": 15000,
    "reportesActivos": 0,
    "createdAt": "2024-11-01T12:00:00.000Z"
  }
}
```

#### PUT `/api/admin/albumes/:id`

```javascript
// Request
{
  "titulo": "Nuevo Título",
  "descripcion": "Nueva descripción",
  "generos": ["rock", "indie"],
  "esPrivado": false
}
```

#### DELETE `/api/admin/albumes/:id`

```javascript
// Similar a canciones
{
  tipo: "logico" | "permanente",
  razon: "Contenido inapropiado"
}
```

### 4.3 Playlists

#### GET `/api/admin/playlists`

```javascript
// Query params
{
  page: 1,
  limit: 50,
  search: "título",
  creadorId: "673d2a1b5f8e9c001234abcd",
  esPublica: true | false,
  esColaborativa: true | false,
  fechaDesde: "2024-01-01",
  ordenar: "createdAt" | "seguidores",
  orden: "desc"
}

// Response
{
  "ok": true,
  "playlists": [
    {
      "id": "673d2a1b5f8e9c001234abcd",
      "titulo": "Mi Playlist",
      "creador": {
        "id": "673d2a1b5f8e9c001234abcd",
        "nick": "juanperez",
        "avatarUrl": "https://..."
      },
      "portadaUrl": "https://...",
      "descripcion": "Descripción",
      "esPublica": true,
      "esColaborativa": false,
      "cantidadCanciones": 25,
      "seguidores": 150,
      "reportesActivos": 0,
      "createdAt": "2024-11-01T12:00:00.000Z"
    }
  ],
  "paginacion": {...}
}
```

#### DELETE `/api/admin/playlists/:id`

```javascript
// Response
{
  "ok": true,
  "message": "Playlist eliminada correctamente"
}
```

---

## 5. Moderación

### 5.1 Modelo de Reportes

```javascript
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

reporteSchema.index({ estado: 1, prioridad: -1, createdAt: -1 });

export const Reporte = model("Reporte", reporteSchema);
```

### 5.2 Endpoints de Reportes

#### GET `/api/admin/reportes`

```javascript
// Query Params
{
  page: 1,
  limit: 50,
  estado: "pendiente" | "en_revision" | "resuelto" | "rechazado",
  prioridad: "alta" | "urgente",
  tipoContenido: "cancion" | "usuario" | "comentario",
  motivo: "spam" | "derechos_autor",
  fechaDesde: "2024-01-01",
  ordenar: "createdAt" | "prioridad",
  orden: "desc"
}

// Response
{
  "ok": true,
  "reportes": [
    {
      "id": "673d2a1b5f8e9c001234abcd",
      "reportadoPor": {
        "id": "673d2a1b5f8e9c001234abcd",
        "nick": "usuario1",
        "avatarUrl": "https://..."
      },
      "tipoContenido": "cancion",
      "contenido": {
        "id": "673d2a1b5f8e9c001234abcd",
        "titulo": "Canción Reportada",
        "artista": "Artista"
      },
      "motivo": "contenido_inapropiado",
      "descripcion": "Contiene lenguaje ofensivo",
      "estado": "pendiente",
      "prioridad": "media",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ],
  "paginacion": {...},
  "resumen": {
    "pendientes": 45,
    "enRevision": 12,
    "resueltos": 500,
    "rechazados": 80
  }
}
```

#### GET `/api/admin/reportes/:id`

```javascript
// Response con información completa
{
  "ok": true,
  "reporte": {
    "id": "673d2a1b5f8e9c001234abcd",
    "reportadoPor": {
      "id": "673d2a1b5f8e9c001234abcd",
      "nick": "usuario1",
      "email": "user@example.com",
      "avatarUrl": "https://...",
      "historialReportes": {
        "total": 10,
        "validos": 8
      }
    },
    "tipoContenido": "cancion",
    "contenido": {
      // Info completa del contenido reportado
      "id": "673d2a1b5f8e9c001234abcd",
      "titulo": "Canción Reportada",
      "artistas": [...],
      "audioUrl": "https://...",
      "reproduccionesTotales": 1000
    },
    "motivo": "contenido_inapropiado",
    "descripcion": "Descripción detallada del reporte",
    "estado": "pendiente",
    "prioridad": "media",
    "reportesSimilares": [
      // Otros reportes del mismo contenido
    ],
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

#### PUT `/api/admin/reportes/:id/estado`

```javascript
// Request
{
  "estado": "en_revision" | "resuelto" | "rechazado"
}

// Response
{
  "ok": true,
  "message": "Estado actualizado correctamente"
}
```

#### PUT `/api/admin/reportes/:id/resolver`

```javascript
// Request
{
  "accion": "eliminar_contenido" | "advertencia" | "suspender_usuario" | "banear_usuario" | "ninguna",
  "nota": "Contenido eliminado por violación de términos"
}

// Response
{
  "ok": true,
  "message": "Reporte resuelto correctamente"
}
```

#### PUT `/api/admin/reportes/:id/prioridad`

```javascript
// Request
{
  "prioridad": "urgente" | "alta" | "media" | "baja"
}

// Response
{
  "ok": true,
  "message": "Prioridad actualizada correctamente"
}
```

---

## 6. Analytics

### 6.1 Dashboard Principal

#### GET `/api/admin/analytics/dashboard`

```javascript
// Query Params (opcional)
{
  periodo: "hoy" | "semana" | "mes" | "anio",
  fechaInicio: "2024-01-01",
  fechaFin: "2024-12-31"
}

// Response
{
  "ok": true,
  "periodo": "mes",
  "usuarios": {
    "total": 10523,
    "nuevos": 450,
    "activos": 8500,
    "crecimiento": 4.5 // % vs periodo anterior
  },
  "contenido": {
    "totalCanciones": 45000,
    "cancionesNuevas": 850,
    "totalAlbumes": 8500,
    "albumesNuevos": 120,
    "totalPlaylists": 25000
  },
  "reproducciones": {
    "total": 5500000,
    "promedioDiario": 183333,
    "crecimiento": 8.2
  },
  "engagement": {
    "likes": 650000,
    "compartidos": 45000,
    "comentarios": 120000
  },
  "topCanciones": [
    {
      "id": "673d2a1b5f8e9c001234abcd",
      "titulo": "Canción Popular",
      "artista": "Artista",
      "reproducciones": 150000,
      "likes": 8500
    }
  ],
  "topArtistas": [
    {
      "id": "673d2a1b5f8e9c001234abcd",
      "nick": "artistaTop",
      "reproducciones": 500000,
      "seguidores": 15000
    }
  ],
  "topGeneros": [
    {
      "nombre": "rock",
      "reproducciones": 1200000,
      "porcentaje": 21.8
    }
  ]
}
```

### 6.2 Métricas de Usuarios

#### GET `/api/admin/analytics/usuarios`

```javascript
// Query Params
{
  periodo: "semana" | "mes" | "anio"
}

// Response
{
  "ok": true,
  "metricas": {
    "totalRegistrados": 10523,
    "usuariosActivos": {
      "dau": 2500,  // Daily Active Users
      "wau": 6000,  // Weekly Active Users
      "mau": 8500   // Monthly Active Users
    },
    "registrosPorDia": [
      {
        "fecha": "2025-11-28",
        "cantidad": 15
      }
    ],
    "distribucionPorPais": {
      "MX": 5200,
      "AR": 2100,
      "ES": 1800,
      "CO": 1423
    },
    "distribucionPorEdad": {
      "13-17": 500,
      "18-24": 3500,
      "25-34": 4200,
      "35-44": 1800,
      "45+": 523
    },
    "tiempoPromedioSesion": 42 // minutos
  }
}
```

### 6.3 Métricas de Contenido

#### GET `/api/admin/analytics/contenido`

```javascript
// Query Params
{
  periodo: "semana" | "mes" | "anio"
}

// Response
{
  "ok": true,
  "metricas": {
    "reproducciones": {
      "total": 5500000,
      "porDia": [
        {
          "fecha": "2025-11-28",
          "cantidad": 183000
        }
      ],
      "porHora": [...],
      "duracionPromedio": 185 // segundos
    },
    "contenidoSubido": {
      "canciones": 850,
      "albumes": 120
    },
    "topCanciones": [...],
    "topArtistas": [...],
    "topGeneros": [
      {
        "nombre": "rock",
        "reproducciones": 1200000,
        "canciones": 8500,
        "porcentaje": 21.8
      }
    ]
  }
}
```

### 6.4 Exportar Reportes

#### POST `/api/admin/analytics/export`

```javascript
// Request
{
  "tipo": "usuarios" | "reproducciones" | "contenido",
  "formato": "csv" | "excel",
  "periodo": {
    "inicio": "2024-01-01",
    "fin": "2024-12-31"
  }
}

// Response
{
  "ok": true,
  "message": "Exportación generada correctamente",
  "downloadUrl": "https://...",
  "expiraEn": "2025-12-01T10:00:00.000Z" // 24 horas
}
```

---

## 7. Configuración

### 7.1 Configuraciones Globales

#### GET `/api/admin/config`

```javascript
// Response
{
  "ok": true,
  "configuracion": {
    "general": {
      "nombrePlataforma": "Mi Plataforma Musical",
      "logoUrl": "https://...",
      "emailContacto": "contact@plataforma.com",
      "mantenimientoActivo": false
    },
    "contenido": {
      "maxDuracionCancion": 600, // segundos
      "formatosAudioPermitidos": ["mp3", "wav", "flac"],
      "maxTamanioAudioMB": 50,
      "requiereAprobacionManual": false
    },
    "usuarios": {
      "registroAbierto": true,
      "verificacionEmailObligatoria": true,
      "edadMinima": 13
    }
  }
}
```

#### PUT `/api/admin/config`

```javascript
// Request
{
  "categoria": "general",
  "cambios": {
    "nombrePlataforma": "Nuevo Nombre",
    "mantenimientoActivo": true
  }
}

// Response
{
  "ok": true,
  "message": "Configuración actualizada correctamente"
}
```

### 7.2 Contenido Destacado

#### GET `/api/admin/destacados`

```javascript
// Response
{
  "ok": true,
  "secciones": [
    {
      "id": "home_banner",
      "nombre": "Banner Principal",
      "tipo": "manual",
      "items": [
        {
          "tipo": "album",
          "contenidoId": "673d2a1b5f8e9c001234abcd",
          "orden": 1,
          "activo": true
        }
      ]
    },
    {
      "id": "trending",
      "nombre": "Tendencias",
      "tipo": "automatico",
      "criterio": "mas_reproducidas_semana"
    },
    {
      "id": "nuevos_lanzamientos",
      "nombre": "Nuevos Lanzamientos",
      "tipo": "automatico",
      "criterio": "recientes"
    }
  ]
}
```

#### PUT `/api/admin/destacados/:seccionId`

```javascript
// Request
{
  "items": [
    {
      "tipo": "cancion",
      "contenidoId": "673d2a1b5f8e9c001234abcd",
      "orden": 1
    },
    {
      "tipo": "album",
      "contenidoId": "673d2a1b5f8e9c001234abcd",
      "orden": 2
    }
  ]
}

// Response
{
  "ok": true,
  "message": "Contenido destacado actualizado correctamente"
}
```

### 7.3 Feature Flags

#### GET `/api/admin/features`

```javascript
// Response
{
  "ok": true,
  "features": [
    {
      "key": "new_player_ui",
      "nombre": "Nueva UI del reproductor",
      "descripcion": "Habilita el nuevo diseño del reproductor",
      "activo": true,
      "porcentajeUsuarios": 100
    },
    {
      "key": "ai_recommendations",
      "nombre": "Recomendaciones con IA",
      "activo": false,
      "porcentajeUsuarios": 0
    }
  ]
}
```

#### PUT `/api/admin/features/:key`

```javascript
// Request
{
  "activo": true,
  "porcentajeUsuarios": 50 // Rollout gradual
}

// Response
{
  "ok": true,
  "message": "Feature flag actualizado correctamente"
}
```

---

## 📊 Estructura de Rutas

```javascript
// routes/admin.routes.js
import express from "express";
import { authAdmin } from "../middlewares/authAdmin.js";
import { adminLoginLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

// ========== AUTENTICACIÓN ==========
router.post("/auth/login", adminLoginLimiter, loginAdmin);
router.post("/auth/logout", authAdmin, logoutAdmin);
router.get("/auth/me", authAdmin, getAdminProfile);

// ========== USUARIOS ==========
router.get("/usuarios", authAdmin, listarUsuarios);
router.get("/usuarios/:id", authAdmin, obtenerUsuario);
router.put("/usuarios/:id/suspender", authAdmin, suspenderUsuario);
router.put("/usuarios/:id/reactivar", authAdmin, reactivarUsuario);
router.put("/usuarios/:id/banear", authAdmin, banearUsuario);
router.put("/usuarios/:id/desbanear", authAdmin, desbanearUsuario);
router.put("/usuarios/:id/verificar", authAdmin, verificarUsuario);
router.delete("/usuarios/:id", authAdmin, eliminarUsuario);

// ========== CANCIONES ==========
router.get("/canciones", authAdmin, listarCanciones);
router.get("/canciones/:id", authAdmin, obtenerCancion);
router.put("/canciones/:id", authAdmin, actualizarCancion);
router.delete("/canciones/:id", authAdmin, eliminarCancion);
router.post("/canciones/:id/restaurar", authAdmin, restaurarCancion);

// ========== ÁLBUMES ==========
router.get("/albumes", authAdmin, listarAlbumes);
router.get("/albumes/:id", authAdmin, obtenerAlbum);
router.put("/albumes/:id", authAdmin, actualizarAlbum);
router.delete("/albumes/:id", authAdmin, eliminarAlbum);
router.post("/albumes/:id/restaurar", authAdmin, restaurarAlbum);

// ========== PLAYLISTS ==========
router.get("/playlists", authAdmin, listarPlaylists);
router.get("/playlists/:id", authAdmin, obtenerPlaylist);
router.delete("/playlists/:id", authAdmin, eliminarPlaylist);

// ========== REPORTES ==========
router.get("/reportes", authAdmin, listarReportes);
router.get("/reportes/:id", authAdmin, obtenerReporte);
router.put("/reportes/:id/estado", authAdmin, cambiarEstadoReporte);
router.put("/reportes/:id/resolver", authAdmin, resolverReporte);
router.put("/reportes/:id/prioridad", authAdmin, cambiarPrioridadReporte);

// ========== ANALYTICS ==========
router.get("/analytics/dashboard", authAdmin, getDashboard);
router.get("/analytics/usuarios", authAdmin, getAnalyticsUsuarios);
router.get("/analytics/contenido", authAdmin, getAnalyticsContenido);
router.post("/analytics/export", authAdmin, exportarReporte);

// ========== CONFIGURACIÓN ==========
router.get("/config", authAdmin, obtenerConfiguracion);
router.put("/config", authAdmin, actualizarConfiguracion);
router.get("/features", authAdmin, obtenerFeatureFlags);
router.put("/features/:key", authAdmin, actualizarFeatureFlag);
router.get("/destacados", authAdmin, obtenerDestacados);
router.put("/destacados/:seccionId", authAdmin, actualizarDestacados);

export default router;
```

---

## 🔒 Seguridad

### Rate Limiting

```javascript
// middlewares/rateLimit.js
import rateLimit from "express-rate-limit";

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    ok: false,
    message: "Demasiados intentos de login. Intenta en 15 minutos.",
  },
});

export const adminApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests
  message: {
    ok: false,
    message: "Límite de requests excedido",
  },
});
```

### CORS

```javascript
// config/cors.js
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://admin.plataforma.com",
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
};
```

---

## 🚀 Plan de Implementación

### Fase 1 - Core (1-2 semanas)

- ✅ Modelo Admin
- ✅ Autenticación con JWT
- ✅ Middleware authAdmin
- ✅ CRUD de usuarios
- ✅ CRUD de contenido básico

### Fase 2 - Moderación (1 semana)

- ✅ Sistema de reportes
- ✅ Acciones sobre contenido
- ✅ Suspensión y baneo de usuarios

### Fase 3 - Analytics (1 semana)

- ✅ Dashboard principal
- ✅ Métricas de usuarios y contenido
- ✅ Exportación de reportes

### Fase 4 - Configuración (3-5 días)

- ✅ Configuraciones globales
- ✅ Feature flags
- ✅ Contenido destacado

---

**Documentación generada para Panel de Administración Simplificado**
**Versión: 2.0**
**Fecha: 28 de Noviembre, 2025**
