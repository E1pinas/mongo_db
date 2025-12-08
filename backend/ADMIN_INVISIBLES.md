# Sistema de Admins Invisibles con Notificaciones de Moderación

## 🎯 Cambios Implementados

### 1. Admins Invisibles

Los administradores ahora son **invisibles** en la plataforma:

**Nuevos campos en Usuario:**

- `esVisible: Boolean` - `false` para admins, `true` para usuarios
- `puedeSubirContenido: Boolean` - `false` para admins, `true` para usuarios

**Restricciones aplicadas:**

- ❌ Admins NO aparecen en búsquedas de usuarios
- ❌ Admins NO tienen perfil público visible
- ❌ Admins NO pueden subir canciones
- ❌ Admins NO pueden crear álbumes
- ❌ Admins NO pueden crear playlists
- ✅ Admins SOLO pueden moderar

---

### 2. Sistema de Notificaciones de Moderación

Los usuarios ahora reciben **notificaciones automáticas** cuando reciben acciones de moderación.

**Nuevos tipos de notificación:**

- `moderacion_advertencia` - Advertencia del equipo
- `moderacion_suspension` - Cuenta suspendida temporalmente
- `moderacion_baneo` - Cuenta desactivada permanentemente
- `moderacion_contenido_eliminado` - Contenido eliminado
- `moderacion_reactivacion` - Cuenta reactivada

---

## 📋 Acciones que Generan Notificaciones

### 1. Suspensión Temporal

```http
POST /api/moderacion/usuarios/:id/suspender
{
  "dias": 7,
  "razon": "Lenguaje ofensivo en comentarios"
}
```

**Notificación al usuario:**

```
🔒 Tu cuenta ha sido suspendida temporalmente por 7 días.

Motivo: Lenguaje ofensivo en comentarios
```

---

### 2. Baneo Permanente

```http
POST /api/moderacion/usuarios/:id/banear
{
  "razon": "Violación repetida de términos de servicio"
}
```

**Notificación al usuario:**

```
🚫 Tu cuenta ha sido desactivada permanentemente.

Motivo: Violación repetida de términos de servicio
```

---

### 3. Contenido Eliminado

**Canción:**

```http
DELETE /api/moderacion/canciones/:id
{
  "razon": "Contenido que viola derechos de autor"
}
```

**Notificación al artista:**

```
🗑️ Tu canción "Nombre de la Canción" ha sido eliminada por el equipo de moderación.

Motivo: Contenido que viola derechos de autor
```

**Álbum:**

```http
DELETE /api/moderacion/albumes/:id
{
  "razon": "Material inapropiado"
}
```

**Notificación al artista:**

```
🗑️ Tu álbum "Nombre del Álbum" ha sido eliminado por el equipo de moderación.

Motivo: Material inapropiado
```

**Playlist:**

```http
DELETE /api/moderacion/playlists/:id
{
  "razon": "Playlist con contenido spam"
}
```

**Comentario:**

```http
DELETE /api/moderacion/comentarios/:id
{
  "razon": "Lenguaje ofensivo"
}
```

---

### 4. Reactivación de Cuenta

```http
POST /api/moderacion/usuarios/:id/reactivar
```

**Notificación al usuario:**

```
✅ Tu cuenta ha sido reactivada. Ya puedes acceder nuevamente a la plataforma.
```

---

## 🔒 Visibilidad de Admins

### Búsqueda de Usuarios (`GET /api/usuarios/buscar`)

**Antes:**

```javascript
Usuario.find({ nick: regex });
```

**Ahora:**

```javascript
Usuario.find({
  nick: regex,
  esVisible: true, // Excluir admins
  role: "user", // Solo usuarios normales
});
```

**Resultado:** Los admins NO aparecen en búsquedas.

---

### Perfil Público (`GET /api/perfil/nick/:nick`)

**Antes:**

```javascript
Usuario.findOne({ nick });
```

**Ahora:**

```javascript
Usuario.findOne({
  nick,
  esVisible: true, // Excluir admins
  role: "user", // Solo usuarios normales
});
```

**Resultado:** Los perfiles de admins NO son accesibles públicamente.

---

### Subida de Contenido

**Canción - `POST /api/canciones`:**

```javascript
// Nuevo: Validar permisos
const usuario = await Usuario.findById(req.userId);

if (!usuario.puedeSubirContenido || usuario.role !== "user") {
  return res.status(403).json({
    message: "No tienes permisos para subir contenido musical",
  });
}
```

**Álbum - `POST /api/albumes`:**

```javascript
// Nuevo: Validar permisos
const usuario = await Usuario.findById(artistaId);

if (!usuario.puedeSubirContenido || usuario.role !== "user") {
  return res.status(403).json({
    message: "No tienes permisos para crear álbumes",
  });
}
```

**Resultado:** Los admins NO pueden subir música.

---

## 🆕 Crear Admin Invisible

### Script Actualizado

```bash
node scripts/crear-super-admin.js
```

**Configuración automática:**

```javascript
{
  role: "super_admin",
  esVisible: false,           // ← NUEVO
  puedeSubirContenido: false  // ← NUEVO
}
```

### Crear Admin Manual

```http
POST /api/admin
Authorization: Bearer {token_super_admin}
{
  "nombre": "Admin",
  "apellidos": "Moderador",
  "nick": "admin1",
  "email": "admin@tcgmusic.com",
  "password": "Admin123!",
  "pais": "México",
  "fechaNacimiento": "1995-01-01"
}
```

**Configuración automática:**

- `esVisible: false`
- `puedeSubirContenido: false`
- `role: "admin"`

---

## 📧 Cómo Funcionan las Notificaciones

### Archivo: `moderacionNotificaciones.js`

**Función principal:**

```javascript
export const notificacionesModeracion = {
  suspension: async (usuarioId, dias, razon) => {
    return await enviarNotificacionModeracion(
      usuarioId,
      "moderacion_suspension",
      `🔒 Tu cuenta ha sido suspendida temporalmente por ${dias} días.`,
      razon
    );
  },
  // ... más funciones
};
```

**Uso en controlador:**

```javascript
import { notificacionesModeracion } from "../helpers/moderacionNotificaciones.js";

// Al suspender usuario
await notificacionesModeracion.suspension(usuarioId, dias, razon);

// Al banear usuario
await notificacionesModeracion.baneo(usuarioId, razon);

// Al eliminar contenido
await notificacionesModeracion.contenidoEliminado(
  artistaId,
  "cancion",
  tituloCancion,
  razon
);
```

---

## 📱 Frontend - Ver Notificaciones

Las notificaciones se reciben en:

```http
GET /api/notificaciones
Authorization: Bearer {token}
```

**Ejemplo de notificación de moderación:**

```json
{
  "_id": "...",
  "usuarioDestino": "692df34f6a3c7ecd1dbbc398",
  "usuarioOrigen": null,
  "tipo": "moderacion_suspension",
  "mensaje": "🔒 Tu cuenta ha sido suspendida temporalmente por 7 días.\n\nMotivo: Lenguaje ofensivo en comentarios",
  "leida": false,
  "createdAt": "2025-12-06T..."
}
```

**Frontend debe mostrar:**

- 🔒 Icono de candado para suspensión
- 🚫 Icono de prohibido para baneo
- 🗑️ Icono de basura para contenido eliminado
- ⚠️ Icono de advertencia para advertencias
- ✅ Icono de check para reactivación

---

## 🧪 Testing

### 1. Crear Super Admin Invisible

```bash
node scripts/crear-super-admin.js
```

**Verificar:**

- `esVisible: false`
- `puedeSubirContenido: false`
- `role: "super_admin"`

---

### 2. Verificar que Admin NO es Visible

**Búsqueda:**

```http
GET /api/usuarios/buscar?q=superadmin
```

**Resultado esperado:** `[]` (array vacío)

**Perfil:**

```http
GET /api/perfil/nick/superadmin
```

**Resultado esperado:** `404 Not Found`

---

### 3. Verificar que Admin NO Puede Subir Música

**Login como admin:**

```http
POST /api/usuarios/login
{
  "email": "admin@tcgmusic.com",
  "password": "Admin123!"
}
```

**Intentar crear canción:**

```http
POST /api/canciones
Authorization: Bearer {token_admin}
{
  "titulo": "Test",
  "audioUrl": "https://...",
  "duracionSegundos": 180
}
```

**Resultado esperado:**

```json
{
  "ok": false,
  "message": "No tienes permisos para subir contenido musical"
}
```

---

### 4. Verificar Notificaciones de Moderación

**Login como admin:**

```http
POST /api/usuarios/login
{ "email": "admin@tcgmusic.com", "password": "..." }
```

**Suspender un usuario:**

```http
POST /api/moderacion/usuarios/{userId}/suspender
Authorization: Bearer {token_admin}
{
  "dias": 7,
  "razon": "Prueba de notificación"
}
```

**Login como usuario suspendido:**

```http
POST /api/usuarios/login
{ "email": "usuario@test.com", "password": "..." }
```

**Ver notificaciones:**

```http
GET /api/notificaciones
Authorization: Bearer {token_usuario}
```

**Resultado esperado:**

```json
{
  "notificaciones": [
    {
      "tipo": "moderacion_suspension",
      "mensaje": "🔒 Tu cuenta ha sido suspendida temporalmente por 7 días.\n\nMotivo: Prueba de notificación",
      "leida": false
    }
  ]
}
```

---

## 📊 Resumen de Cambios

### Modelos Actualizados

**usuarioModels.js:**

```javascript
esVisible: { type: Boolean, default: true }
puedeSubirContenido: { type: Boolean, default: true }
```

**notificacionModels.js:**

```javascript
tipo: {
  enum: [
    // ... tipos existentes
    "moderacion_advertencia",
    "moderacion_suspension",
    "moderacion_baneo",
    "moderacion_contenido_eliminado",
    "moderacion_reactivacion",
  ];
}
```

---

### Archivos Nuevos

1. `helpers/moderacionNotificaciones.js` - Sistema de notificaciones
2. `ADMIN_INVISIBLES.md` - Esta documentación

---

### Controladores Actualizados

1. `adminController.js` - Crear admins con `esVisible: false`
2. `moderacionController.js` - Enviar notificaciones en todas las acciones
3. `usuarioController.js` - Filtrar admins en búsquedas
4. `perfilController.js` - Filtrar admins en perfiles
5. `cancionController.js` - Validar permisos de subida
6. `albumController.js` - Validar permisos de subida

---

## ✅ Checklist de Funcionalidades

- ✅ Admins invisibles en búsquedas
- ✅ Admins sin perfil público
- ✅ Admins no pueden subir canciones
- ✅ Admins no pueden crear álbumes
- ✅ Notificación: Suspensión temporal
- ✅ Notificación: Baneo permanente
- ✅ Notificación: Canción eliminada
- ✅ Notificación: Álbum eliminado
- ✅ Notificación: Playlist eliminada
- ✅ Notificación: Comentario eliminado
- ✅ Notificación: Cuenta reactivada
- ✅ Mensajes incluyen razón de la acción

---

## 🎯 Resultado Final

**Antes:**

- Admins = Usuarios con permisos extras
- Sin notificaciones de moderación
- Podían subir música y tener perfil público

**Ahora:**

- Admins = Cuentas exclusivas de moderación
- Invisibles (no aparecen en búsquedas ni perfiles)
- No pueden subir contenido musical
- Todas las acciones generan notificaciones automáticas a los usuarios afectados
- Los usuarios siempre saben POR QUÉ fueron moderados

---

## 💡 Ventajas

1. **Separación clara de roles** - Admins solo moderan, no participan como artistas
2. **Transparencia** - Usuarios reciben notificaciones con razones claras
3. **Privacidad** - Admins trabajan en segundo plano sin perfil visible
4. **Profesionalismo** - Sistema de moderación serio y organizado
5. **Trazabilidad** - Todas las acciones quedan registradas con notificaciones
