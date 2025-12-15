**Anexo A**

**Capturas de Pantalla de la Aplicación**

_Nota_: Las siguientes figuras presentan las interfaces principales del sistema desarrollado.

**Figura A1**. Página de inicio con feed de posts y canciones recientes

**Figura A2**. Reproductor de audio integrado en la barra inferior

**Figura A3**. Biblioteca personal de música (canciones, álbumes, playlists)

**Figura A4**. Formulario de subida de canciones

**Figura A5**. Creación y edición de álbumes

**Figura A6**. Vista detallada de un álbum con lista de canciones

**Figura A7**. Creación y gestión de playlists

**Figura A8**. Perfil de usuario con estadísticas

**Figura A9**. Feed de posts y reposts

**Figura A10**. Sistema de comentarios en posts

**Figura A11**. Notificaciones en tiempo real

**Figura A12**. Panel de control del administrador

**Figura A13**. Gestión de reportes y moderación

**Figura A14**. Vista de usuarios y estadísticas

**Figura A15**. Gestión de contenido reportado

**Figura A16**. Sistema de seguimiento de artistas

**Figura A17**. Solicitudes de amistad

**Figura A18**. Búsqueda de usuarios y contenido

---

**Anexo B**

**Diagramas de Arquitectura del Sistema**

**Figura B1**. Arquitectura general del sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Páginas    │  │  Componentes │  │   Contextos  │ │
│  │  (Views)     │  │   (UI)       │  │  (State)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Rutas      │  │ Controladores│  │  Middlewares │ │
│  │  (Routes)    │  │ (Controllers)│  │  (Auth, etc) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Modelos    │  │   Servicios  │  │   Helpers    │ │
│  │  (Mongoose)  │  │   (Business) │  │  (Utilities) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                  ▼
┌──────────────────────┐        ┌──────────────────────┐
│   MongoDB Atlas      │        │   Cloudflare R2      │
│  (Base de Datos)     │        │ (Almacenamiento)     │
│                      │        │                      │
│  - Usuarios          │        │  - Audio            │
│  - Canciones         │        │  - Imágenes         │
│  - Álbumes           │        │  - Portadas         │
│  - Playlists         │        │                      │
│  - Posts             │        │                      │
│  - Reportes          │        │                      │
└──────────────────────┘        └──────────────────────┘
```

**Figura B2**. Flujo de autenticación JWT

```
Cliente                    Backend                  Base de Datos
  │                          │                          │
  │──── POST /login ────────▶│                          │
  │  (email, password)       │                          │
  │                          │───── Buscar usuario ────▶│
  │                          │                          │
  │                          │◀──── Usuario ────────────│
  │                          │                          │
  │                          │── Verificar password     │
  │                          │                          │
  │◀─── JWT Token ──────────│                          │
  │                          │                          │
  │                          │                          │
  │── GET /api/canciones ───▶│                          │
  │  (Header: Bearer token)  │                          │
  │                          │── Verificar token        │
  │                          │                          │
  │                          │───── Consulta ──────────▶│
  │                          │                          │
  │◀──── Datos ─────────────│◀──── Resultados ─────────│
```

---

**Anexo C**

**Modelo de Base de Datos**

**Tabla C1**

_Esquema de la colección Usuario_

```javascript
{
  _id: ObjectId,
  nombre: String,
  apellidos: String,
  email: String (único),
  nick: String (único),
  nombreArtistico: String (opcional),
  password: String (encriptado),
  avatarUrl: String,
  bannerUrl: String,
  bio: String,
  role: Enum ["user", "admin", "super_admin"],
  fechaNacimiento: Date,
  pais: String,
  redes: {
    instagram: String,
    tiktok: String,
    youtube: String,
    x: String
  },
  vidas: Number (default: 3),
  verificado: Boolean,
  suspendido: Boolean,
  suspendidoHasta: Date,
  misCanciones: [ObjectId -> Cancion],
  misAlbumes: [ObjectId -> Album],
  playlistsCreadas: [ObjectId -> Playlist],
  createdAt: Date,
  updatedAt: Date
}
```

**Tabla C2**

_Esquema de la colección Canción_

```javascript
{
  _id: ObjectId,
  titulo: String,
  artistas: [ObjectId -> Usuario],
  album: ObjectId -> Album (opcional),
  esSingle: Boolean,
  duracionSegundos: Number,
  generos: [String],
  audioUrl: String,
  portadaUrl: String,
  esPrivada: Boolean,
  esExplicita: Boolean,
  oculta: Boolean,
  reproduccionesTotales: Number,
  likes: [ObjectId -> Usuario],
  createdAt: Date,
  updatedAt: Date
}
```

**Tabla C3**

_Esquema de la colección Álbum_

```javascript
{
  _id: ObjectId,
  titulo: String,
  descripcion: String,
  portadaUrl: String,
  artistas: [ObjectId -> Usuario],
  canciones: [ObjectId -> Cancion],
  generos: [String],
  fechaLanzamiento: Date,
  esPrivado: Boolean,
  reproduccionesTotales: Number,
  likes: [ObjectId -> Usuario],
  createdAt: Date,
  updatedAt: Date
}
```

**Tabla C4**

_Esquema de la colección Playlist_

```javascript
{
  _id: ObjectId,
  titulo: String,
  descripcion: String,
  portadaUrl: String,
  creador: ObjectId -> Usuario,
  canciones: [ObjectId -> Cancion],
  esPublica: Boolean,
  esColaborativa: Boolean,
  colaboradores: [ObjectId -> Usuario],
  seguidores: [ObjectId -> Usuario],
  createdAt: Date,
  updatedAt: Date
}
```

**Tabla C5**

_Esquema de la colección Post_

```javascript
{
  _id: ObjectId,
  usuario: ObjectId -> Usuario,
  contenido: String,
  tipo: Enum ["texto", "repost_cancion", "repost_album", "repost_playlist"],
  recursoId: ObjectId (Cancion/Album/Playlist),
  tipoRecurso: Enum ["Cancion", "Album", "Playlist"],
  likes: [ObjectId -> Usuario],
  comentarios: [{
    usuario: ObjectId -> Usuario,
    contenido: String,
    likes: [ObjectId],
    respuestas: [{
      usuario: ObjectId,
      contenido: String,
      createdAt: Date
    }],
    createdAt: Date
  }],
  reposts: [{
    usuario: ObjectId -> Usuario,
    comentario: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Tabla C6**

_Esquema de la colección Reporte_

```javascript
{
  _id: ObjectId,
  reportadoPor: ObjectId -> Usuario,
  tipoContenido: Enum ["cancion", "album", "playlist", "usuario", "comentario"],
  contenidoId: ObjectId,
  motivo: String,
  descripcion: String,
  estado: Enum ["pendiente", "en_revision", "resuelto", "rechazado"],
  prioridad: Enum ["baja", "media", "alta"],
  asignadoA: ObjectId -> Usuario (Admin),
  resolucion: {
    accion: String,
    comentario: String,
    fecha: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

**Anexo D**

**Endpoints de la API REST**

**Tabla D1**

_Endpoints de Autenticación_

```
POST   /api/usuarios/registro     - Registro de nuevo usuario
POST   /api/usuarios/login        - Inicio de sesión
GET    /api/usuarios/perfil       - Obtener perfil del usuario actual
PATCH  /api/usuarios/perfil       - Actualizar perfil
```

**Tabla D2**

_Endpoints de Canciones_

```
GET    /api/canciones             - Listar canciones públicas
POST   /api/canciones             - Subir nueva canción
GET    /api/canciones/:id         - Obtener detalles de una canción
PUT    /api/canciones/:id         - Actualizar canción
DELETE /api/canciones/:id         - Eliminar canción
POST   /api/canciones/:id/like    - Dar/quitar like a canción
```

**Tabla D3**

_Endpoints de Álbumes_

```
GET    /api/albumes               - Listar álbumes públicos
POST   /api/albumes               - Crear nuevo álbum
GET    /api/albumes/:id           - Obtener detalles de un álbum
PUT    /api/albumes/:id           - Actualizar álbum
DELETE /api/albumes/:id           - Eliminar álbum
POST   /api/albumes/:id/like      - Dar/quitar like a álbum
POST   /api/albumes/:id/canciones - Agregar canción al álbum
DELETE /api/albumes/:id/canciones/:cancionId - Quitar canción del álbum
```

**Tabla D4**

_Endpoints de Playlists_

```
GET    /api/playlists             - Listar playlists públicas
POST   /api/playlists             - Crear nueva playlist
GET    /api/playlists/:id         - Obtener detalles de una playlist
PUT    /api/playlists/:id         - Actualizar playlist
DELETE /api/playlists/:id         - Eliminar playlist
POST   /api/playlists/:id/canciones - Agregar canción a la playlist
DELETE /api/playlists/:id/canciones/:cancionId - Quitar canción
POST   /api/playlists/:id/seguir  - Seguir/dejar de seguir playlist
```

**Tabla D5**

_Endpoints de Posts y Red Social_

```
GET    /api/posts                 - Obtener feed de posts
POST   /api/posts                 - Crear nuevo post
DELETE /api/posts/:id             - Eliminar post
POST   /api/posts/:id/like        - Dar/quitar like a post
POST   /api/posts/:id/comentarios - Comentar en post
POST   /api/posts/:id/repost      - Hacer repost
```

**Tabla D6**

_Endpoints de Seguimiento y Amistad_

```
GET    /api/seguidores            - Obtener seguidores
GET    /api/seguidores/siguiendo  - Obtener usuarios que sigo
POST   /api/seguidores/:id        - Seguir usuario
DELETE /api/seguidores/:id        - Dejar de seguir usuario

POST   /api/amistad/solicitud/:id - Enviar solicitud de amistad
POST   /api/amistad/aceptar/:id   - Aceptar solicitud
POST   /api/amistad/rechazar/:id  - Rechazar solicitud
DELETE /api/amistad/:id           - Eliminar amistad
GET    /api/amistad/pendientes    - Ver solicitudes pendientes
```

**Tabla D7**

_Endpoints de Reportes y Moderación_

```
GET    /api/moderacion/reportes          - Listar reportes
POST   /api/moderacion/reportes/:id/resolver - Resolver reporte
PUT    /api/moderacion/reportes/:id/prioridad - Cambiar prioridad
GET    /api/moderacion/usuarios          - Buscar usuarios
POST   /api/moderacion/usuarios/:id/suspender - Suspender usuario
POST   /api/moderacion/usuarios/:id/reactivar - Reactivar usuario
GET    /api/moderacion/estadisticas      - Estadísticas del sistema
```

**Tabla D8**

_Endpoints de Administración (Super Admin)_

```
GET    /api/admin                        - Listar administradores
POST   /api/admin                        - Crear administrador
DELETE /api/admin/:id                   - Eliminar administrador
GET    /api/admin/usuarios/:id/conducta - Historial de conducta de usuario
POST   /api/admin/usuarios/:id/vidas    - Agregar vidas a usuario
DELETE /api/admin/usuarios/:id/eliminar - Eliminar usuario permanentemente
```

---

**Anexo E**

**Variables de Entorno Requeridas**

**Tabla E1**

_Configuración del Backend_

```env
# Servidor
PORT=3900
NODE_ENV=production

# Base de Datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/tcg

# Autenticación
JWT_SECRET=clave_secreta_muy_segura_aqui
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Cloudflare R2
R2_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_access_key
R2_BUCKET_NAME=nombre_del_bucket
R2_PUBLIC_URL=https://tu-bucket.r2.dev
```

**Tabla E2**

_Configuración del Frontend_

```env
VITE_API_URL=http://localhost:3900
```

---

**Anexo F**

**Estructura de Directorios del Proyecto**

**Figura F1**. Estructura de directorios del Backend

```
backend/
├── index.js                      # Punto de entrada
├── package.json                  # Dependencias
├── .env                         # Variables de entorno
├── database/
│   └── conexion.js              # Configuración MongoDB
├── scripts/                     # Scripts de utilidad
│   ├── crear-super-admin.js
│   └── limpiar-notificaciones-comentarios.js
└── src/
    ├── controllers/             # Lógica de negocio
    │   ├── usuarioController.js
    │   ├── cancionController.js
    │   ├── albumController.js
    │   └── ...
    ├── models/                  # Esquemas de MongoDB
    │   ├── usuarioModels.js
    │   ├── cancionModels.js
    │   └── ...
    ├── routes/                  # Rutas de la API
    │   ├── usuario.routes.js
    │   ├── cancion.routes.js
    │   └── ...
    ├── middlewares/             # Middlewares
    │   ├── authUsuario.js
    │   ├── authAdmin.js
    │   └── ...
    ├── helpers/                 # Funciones auxiliares
    │   ├── jwtHelpers.js
    │   └── ...
    └── services/                # Servicios externos
        └── r2Service.js
```

**Figura F2**. Estructura de directorios del Frontend

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/                      # Archivos estáticos
│   ├── avatar.png
│   └── cover.jpg
└── src/
    ├── App.tsx                 # Componente principal
    ├── main.tsx                # Punto de entrada
    ├── index.css               # Estilos globales
    ├── components/             # Componentes reutilizables
    │   ├── common/
    │   ├── layout/
    │   ├── musica/
    │   └── social/
    ├── contexts/               # Context API (estado global)
    │   ├── AuthContext.tsx
    │   ├── PlayerContext.tsx
    │   └── NotificationContext.tsx
    ├── pages/                  # Páginas de la aplicación
    │   ├── Inicio/
    │   ├── Perfil/
    │   ├── AdminPanel/
    │   └── ...
    ├── services/               # Llamadas a la API
    │   ├── api.ts
    │   ├── auth.service.ts
    │   └── ...
    ├── types/                  # Definiciones TypeScript
    │   └── index.ts
    └── utils/                  # Utilidades
        └── formatHelpers.ts
```

---

**Anexo G**

**Instrucciones de Instalación**

Ver archivo `INSTRUCCIONES_INSTALACION.md` en la raíz del proyecto.

---

**Anexo H**

**Manual de Usuario**

_Registro e Inicio de Sesión_

1. Acceder a la página principal
2. Hacer clic en "Registrarse"
3. Llenar el formulario con datos personales
4. Confirmar edad (mayores de 13 años)
5. Iniciar sesión con email y contraseña

_Subir Música_

1. Hacer clic en "Subir Canción" en el menú
2. Seleccionar archivo de audio (MP3, WAV)
3. Agregar título, género y portada (opcional)
4. Elegir privacidad (pública o privada)
5. Marcar si contiene contenido explícito
6. Hacer clic en "Subir"

_Crear Álbumes_

1. Ir a "Mis Álbumes"
2. Hacer clic en "Crear Álbum"
3. Ingresar título, descripción y fecha
4. Agregar portada
5. Seleccionar canciones del catálogo
6. Configurar privacidad
7. Publicar álbum

_Sistema de Moderación (Administradores)_

1. Acceder al panel de administración
2. Revisar reportes pendientes
3. Asignar prioridades
4. Tomar acciones:
   - Advertir usuario
   - Eliminar contenido
   - Suspender cuenta
5. Agregar comentario de resolución

---

**Nota:** Este documento contiene anexos técnicos para complementar la tesis del proyecto TCG. Las capturas de pantalla mencionadas deben ser agregadas como imágenes en el documento final.
