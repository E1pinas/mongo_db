# 📱 GUÍA COMPLETA DE NOTIFICACIONES

## ✅ YA IMPLEMENTADO

### 1. **Nuevo Seguidor**

**Dónde:** `seguidorController.js` → `seguirUsuario()`

```javascript
await Notificacion.create({
  usuarioDestino: usuarioId,
  usuarioOrigen: req.userId,
  tipo: "nuevo_seguidor",
  mensaje: `${seguidor.nick} ha comenzado a seguirte`,
  recurso: { tipo: "user", id: req.userId },
});
```

**Cuándo se activa:** Cuando alguien te sigue
**Resultado:** "juan_music ha comenzado a seguirte"

---

### 2. **Nueva Canción de Artista**

**Dónde:** `cancionController.js` → `crearCancion()`

```javascript
// Ya usa notificacionHelper
import { notificarNuevaCancion } from "../helpers/notificacionHelper.js";
notificarNuevaCancion(nuevaCancion, req.userId);
```

**Cuándo se activa:** Cuando un artista sube una canción
**Resultado:** "Bad Bunny ha subido una nueva canción: 'Callaita'"

---

### 3. **Nuevo Álbum**

**Dónde:** `albumController.js` → `crearAlbum()`

```javascript
import { notificarNuevoAlbum } from "../helpers/notificacionHelper.js";
notificarNuevoAlbum(nuevoAlbum, artistaId);
```

**Cuándo se activa:** Cuando se crea un álbum
**Resultado:** "Rosalía ha lanzado un nuevo álbum: 'Motomami'"

---

## 🆕 NOTIFICACIONES PENDIENTES POR AGREGAR

### 4. **Comentario en Canción**

**Agregar en:** `comentarioController.js` → `crearComentarioCancion()`

```javascript
// Notificar al dueño de la canción
const cancion = await Cancion.findById(cancionDestino).populate("artistas");

for (const artista of cancion.artistas) {
  if (artista._id.toString() !== req.userId) {
    const usuario = await Usuario.findById(req.userId).select(
      "nick nombreArtistico"
    );
    await Notificacion.create({
      usuarioDestino: artista._id,
      usuarioOrigen: req.userId,
      tipo: "comentario_en_cancion",
      mensaje: `${
        usuario.nombreArtistico || usuario.nick
      } comentó en tu canción "${cancion.titulo}"`,
      recurso: { tipo: "song", id: cancionDestino },
    });
  }
}
```

**Cuándo:** Alguien comenta en tu canción
**Resultado:** "@pedro_music comentó en tu canción 'Summer Vibes'"

---

### 5. **Respuesta a Comentario**

**Agregar en:** `comentarioController.js` → `responderComentario()`

```javascript
// Notificar al autor del comentario original
const comentarioPadre = await Comentario.findById(comentarioPadreId).populate(
  "autor",
  "nick nombreArtistico"
);

if (comentarioPadre.autor._id.toString() !== req.userId) {
  const usuario = await Usuario.findById(req.userId).select(
    "nick nombreArtistico"
  );
  await Notificacion.create({
    usuarioDestino: comentarioPadre.autor._id,
    usuarioOrigen: req.userId,
    tipo: "respuesta_comentario",
    mensaje: `${
      usuario.nombreArtistico || usuario.nick
    } respondió a tu comentario`,
    recurso: { tipo: "comment", id: nuevoComentario._id },
  });
}
```

**Cuándo:** Alguien responde tu comentario
**Resultado:** "@maria respondió a tu comentario en 'Callaita'"

---

### 6. **Like en Comentario**

**Agregar en:** `comentarioController.js` → `toggleLike()`

```javascript
// Solo notificar cuando es un nuevo like, no cuando quita el like
if (!yaLeDioLike) {
  const comentario = await Comentario.findById(comentarioId).populate(
    "autor",
    "_id"
  );

  if (comentario.autor._id.toString() !== req.userId) {
    const usuario = await Usuario.findById(req.userId).select(
      "nick nombreArtistico"
    );
    await Notificacion.create({
      usuarioDestino: comentario.autor._id,
      usuarioOrigen: req.userId,
      tipo: "like_comentario",
      mensaje: `A ${
        usuario.nombreArtistico || usuario.nick
      } le gustó tu comentario`,
      recurso: { tipo: "comment", id: comentarioId },
    });
  }
}
```

**Cuándo:** Alguien da like a tu comentario
**Resultado:** "A @luis_dj le gustó tu comentario"

---

### 7. **Playlist Colaborativa - Invitación**

**Agregar en:** `playlistController.js` → `invitarColaborador()`

```javascript
// Ya existe en el código
const creador = await Usuario.findById(usuarioId);
await Notificacion.create({
  usuarioDestino: colaboradorId,
  usuarioOrigen: usuarioId,
  tipo: "nueva_playlist_artista",
  mensaje: `${creador.nick} te ha invitado a colaborar en la playlist "${playlist.titulo}"`,
  recurso: { tipo: "playlist", id: playlist._id },
});
```

**Cuándo:** Te invitan a colaborar en una playlist
**Resultado:** "@spotify te invitó a colaborar en 'Top Hits 2025'"

---

### 8. **Like en Álbum**

**Agregar en:** `albumController.js` → `toggleLikeAlbum()`

```javascript
// Solo al dar like (no al quitar)
if (!yaLeDioLike) {
  const album = await Album.findById(req.params.id).populate("artistas", "_id");

  for (const artista of album.artistas) {
    if (artista._id.toString() !== req.userId) {
      const usuario = await Usuario.findById(req.userId).select(
        "nick nombreArtistico"
      );
      await Notificacion.create({
        usuarioDestino: artista._id,
        usuarioOrigen: req.userId,
        tipo: "like_album",
        mensaje: `A ${
          usuario.nombreArtistico || usuario.nick
        } le gustó tu álbum "${album.titulo}"`,
        recurso: { tipo: "album", id: album._id },
      });
    }
  }
}
```

**Cuándo:** Alguien guarda/da like a tu álbum
**Resultado:** "A @pedro le gustó tu álbum 'Motomami'"

---

### 9. **Like en Canción (Milestone)**

**Agregar en:** `cancionController.js` → `toggleLike()`

```javascript
// Notificar al alcanzar hitos
const milestones = [10, 50, 100, 500, 1000, 5000, 10000];
const newLikesCount = cancion.likes.length;

if (milestones.includes(newLikesCount)) {
  cancion.artistas.forEach(async (artistaId) => {
    await Notificacion.create({
      usuarioDestino: artistaId,
      usuarioOrigen: null, // Sistema
      tipo: "sistema",
      mensaje: `🎉 Tu canción "${cancion.titulo}" ha alcanzado ${newLikesCount} me gusta!`,
      recurso: { tipo: "song", id: cancion._id },
    });
  });
}
```

**Cuándo:** Tu canción alcanza 100, 500, 1000... likes
**Resultado:** "🎉 Tu canción 'Callaita' ha alcanzado 1000 me gusta!"

---

### 10. **Seguir Playlist**

**Agregar en:** `playlistController.js` → `toggleSeguirPlaylist()`

```javascript
// Solo al seguir (no al dejar de seguir)
if (!yaSigue) {
  const playlist = await Playlist.findById(req.params.id).populate(
    "creador",
    "_id"
  );

  if (playlist.creador._id.toString() !== req.userId) {
    const usuario = await Usuario.findById(req.userId).select(
      "nick nombreArtistico"
    );
    await Notificacion.create({
      usuarioDestino: playlist.creador._id,
      usuarioOrigen: req.userId,
      tipo: "seguidor_playlist",
      mensaje: `${
        usuario.nombreArtistico || usuario.nick
      } comenzó a seguir tu playlist "${playlist.titulo}"`,
      recurso: { tipo: "playlist", id: playlist._id },
    });
  }
}
```

**Cuándo:** Alguien sigue tu playlist
**Resultado:** "@maria comenzó a seguir tu playlist 'Workout Mix'"

---

## 🎯 MEJORES PRÁCTICAS

### ✅ **Cuándo SÍ crear notificaciones:**

- ✓ Interacciones sociales (seguir, comentar, responder)
- ✓ Nuevo contenido de artistas que sigues
- ✓ Likes y reacciones a tu contenido
- ✓ Invitaciones a colaborar
- ✓ Hitos y logros (100 likes, 1000 reproducciones)
- ✓ Aceptación de solicitudes (amistad, colaboración)

### ❌ **Cuándo NO crear notificaciones:**

- ✗ Acciones propias (no notificar cuando tú haces algo en tu contenido)
- ✗ Acciones repetitivas (cada reproducción de canción)
- ✗ Acciones de sistema (limpieza automática, backups)
- ✗ Cuando se quita un like/follow (desnotificar)

### 🔔 **Optimizaciones:**

```javascript
// 1. NO notificar si es el mismo usuario
if (autorId !== req.userId) {
  // crear notificación
}

// 2. Agrupar notificaciones similares
// En lugar de: "juan dio like", "pedro dio like", "maria dio like"
// Mejor: "juan, pedro y maria dieron like a tu canción"

// 3. Limitar notificaciones masivas
// Si tienes 10,000 seguidores, no enviar 10,000 notificaciones individuales
// Usar notificaciones agrupadas o feed
```

---

## 📊 TIPOS DE NOTIFICACIONES POR CATEGORÍA

| Categoría          | Tipo                     | Cuándo usar             |
| ------------------ | ------------------------ | ----------------------- |
| 👥 **Social**      | `nuevo_seguidor`         | Alguien te sigue        |
| 👥 **Social**      | `solicitud_amistad`      | Solicitud de amistad    |
| 👥 **Social**      | `amistad_aceptada`       | Amistad aceptada        |
| 🎵 **Contenido**   | `nueva_cancion_artista`  | Artista sube canción    |
| 🎵 **Contenido**   | `nuevo_album_artista`    | Artista lanza álbum     |
| 🎵 **Contenido**   | `nueva_playlist_artista` | Nueva playlist          |
| 💬 **Interacción** | `comentario_en_cancion`  | Comentan tu canción     |
| 💬 **Interacción** | `respuesta_comentario`   | Responden tu comentario |
| ❤️ **Reacción**    | `like_comentario`        | Like a tu comentario    |
| ❤️ **Reacción**    | `like_album`             | Like a tu álbum         |
| ❤️ **Reacción**    | `seguidor_playlist`      | Siguen tu playlist      |
| 🏆 **Sistema**     | `sistema`                | Hitos y logros          |

---

## 🚀 IMPLEMENTACIÓN RÁPIDA

Para agregar una notificación en cualquier controlador:

```javascript
import { Notificacion } from "../models/notificacionModels.js";
import { Usuario } from "../models/usuarioModels.js";

// 1. Obtener info del usuario que hace la acción
const usuario = await Usuario.findById(req.userId).select(
  "nick nombreArtistico"
);

// 2. Crear notificación
await Notificacion.create({
  usuarioDestino: idDelReceptor, // Quién recibe
  usuarioOrigen: req.userId, // Quién la genera
  tipo: "tipo_notificacion", // Ver tipos arriba
  mensaje: `Mensaje descriptivo`, // Texto para mostrar
  recurso: {
    // Recurso relacionado (opcional)
    tipo: "song", // song, album, playlist, user, comment
    id: recursoId,
  },
});
```

---

## 🎨 FRONTEND - Cómo mostrarlas

```tsx
// En NotificationContext.tsx ya tienes:
- notificaciones no leídas (badge rojo)
- marcar como leída
- lista de notificaciones

// Agregar iconos según tipo:
const getIcon = (tipo: string) => {
  switch(tipo) {
    case 'nuevo_seguidor': return <UserPlus />;
    case 'nueva_cancion_artista': return <Music />;
    case 'nuevo_album_artista': return <Disc />;
    case 'comentario_en_cancion': return <MessageCircle />;
    case 'like_comentario': return <Heart />;
    case 'sistema': return <Bell />;
    default: return <Bell />;
  }
};
```

---

## ✨ CONCLUSIÓN

**Notificaciones ya implementadas:**

- ✅ Nuevo seguidor
- ✅ Nueva canción de artista
- ✅ Nuevo álbum
- ✅ Nueva playlist (invitación)

**Notificaciones recomendadas para agregar:**

- 📝 Comentarios en canciones
- 💬 Respuestas a comentarios
- ❤️ Likes en comentarios
- 💿 Likes en álbumes
- 📱 Seguimiento de playlists
- 🏆 Hitos y logros

**Prioridad:**

1. **Alta:** Comentarios y respuestas (interacción directa)
2. **Media:** Likes en contenido (feedback)
3. **Baja:** Hitos y logros (gamificación)
