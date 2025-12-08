# Sistema de Moderación - TCG Music

## Permisos de Moderación

### Admin y Super Admin 🛡️

Ambos roles tienen acceso a todas las funcionalidades de moderación:

- ✅ Ver y gestionar reportes
- ✅ Suspender/banear usuarios
- ✅ Eliminar contenido (canciones, álbumes, playlists, comentarios)
- ✅ Ver estadísticas de la plataforma
- ✅ Ver actividad reciente

**Diferencia principal:**

- **Super Admin:** Puede crear/eliminar admins + moderación
- **Admin:** Solo moderación (no puede gestionar otros admins)

---

## Base URL: `/api/moderacion`

Todas las rutas requieren autenticación de **Admin** o **Super Admin**.

---

## 📊 GESTIÓN DE REPORTES

### 1. Obtener todos los reportes

```http
GET /api/moderacion/reportes
Authorization: Bearer {token}

Query params (opcionales):
  - estado: pendiente | en_revision | resuelto | rechazado
  - tipoContenido: cancion | album | playlist | usuario | comentario
  - prioridad: baja | media | alta | urgente
  - page: número de página (default: 1)
  - limit: resultados por página (default: 20)
```

**Ejemplo:**

```http
GET /api/moderacion/reportes?estado=pendiente&prioridad=alta&page=1&limit=10
```

**Respuesta:**

```json
{
  "status": "success",
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "reportes": [
    {
      "_id": "...",
      "reportadoPor": {
        "_id": "...",
        "nick": "usuario123",
        "nombreArtistico": "Artista XYZ",
        "avatarUrl": "..."
      },
      "tipoContenido": "cancion",
      "contenidoId": "...",
      "motivo": "contenido_inapropiado",
      "descripcion": "Letra ofensiva",
      "estado": "pendiente",
      "prioridad": "alta",
      "createdAt": "2025-12-06T...",
      "contenidoDetalle": {
        "_id": "...",
        "titulo": "Canción Problemática",
        "artistas": [...],
        "portadaUrl": "..."
      }
    }
  ]
}
```

---

### 2. Estadísticas de reportes

```http
GET /api/moderacion/reportes/estadisticas
Authorization: Bearer {token}
```

**Respuesta:**

```json
{
  "status": "success",
  "estadisticas": {
    "total": 156,
    "porEstado": {
      "pendiente": 45,
      "en_revision": 12,
      "resuelto": 89,
      "rechazado": 10
    },
    "porTipo": {
      "cancion": 67,
      "usuario": 34,
      "comentario": 28,
      "album": 15,
      "playlist": 12
    },
    "porPrioridad": {
      "urgente": 5,
      "alta": 23,
      "media": 78,
      "baja": 50
    }
  }
}
```

---

### 3. Cambiar estado de un reporte

```http
PUT /api/moderacion/reportes/:id/estado
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "en_revision",  // pendiente | en_revision | resuelto | rechazado
  "prioridad": "alta"        // baja | media | alta | urgente (opcional)
}
```

**Respuesta:**

```json
{
  "status": "success",
  "message": "Estado del reporte actualizado",
  "reporte": {...}
}
```

---

### 4. Resolver un reporte

```http
POST /api/moderacion/reportes/:id/resolver
Authorization: Bearer {token}
Content-Type: application/json

{
  "accion": "suspender_usuario",  // ninguna | advertencia | eliminar_contenido | suspender_usuario | banear_usuario
  "nota": "Usuario suspendido por lenguaje ofensivo repetido",
  "duracionSuspension": 7  // Solo para suspender_usuario (días)
}
```

**Acciones disponibles:**

- `ninguna` - No tomar acción, solo marcar como resuelto
- `advertencia` - Registrar advertencia (no ejecuta acción)
- `eliminar_contenido` - Elimina la canción/álbum/playlist/comentario reportado
- `suspender_usuario` - Suspende al usuario por X días
- `banear_usuario` - Banea al usuario permanentemente

**Respuesta:**

```json
{
  "status": "success",
  "message": "Reporte resuelto exitosamente",
  "reporte": {
    "_id": "...",
    "estado": "resuelto",
    "resolucion": {
      "accion": "suspender_usuario",
      "nota": "Usuario suspendido por lenguaje ofensivo repetido",
      "resueltoPor": "...",
      "fechaResolucion": "2025-12-06T..."
    }
  }
}
```

---

## 👥 GESTIÓN DE USUARIOS

### 5. Obtener todos los usuarios

```http
GET /api/moderacion/usuarios
Authorization: Bearer {token}

Query params (opcionales):
  - buscar: término de búsqueda (nick, nombre, email)
  - role: user | admin | super_admin
  - estaActivo: true | false
  - suspendido: true | false
  - page: número de página (default: 1)
  - limit: resultados por página (default: 20)
```

**Ejemplo:**

```http
GET /api/moderacion/usuarios?buscar=juan&estaActivo=true&page=1
```

**Respuesta:**

```json
{
  "status": "success",
  "total": 1248,
  "page": 1,
  "totalPages": 63,
  "usuarios": [
    {
      "_id": "...",
      "nick": "juanp",
      "nombreArtistico": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "estaActivo": true,
      "suspendidoHasta": null,
      "avatarUrl": "...",
      "estadisticas": {
        "reproduccionesTotales": 1245,
        "totalSeguidores": 89,
        "totalCancionesSubidas": 12
      },
      "createdAt": "2025-01-15T...",
      "ultimoIngreso": "2025-12-05T..."
    }
  ]
}
```

---

### 6. Suspender usuario

```http
POST /api/moderacion/usuarios/:id/suspender
Authorization: Bearer {token}
Content-Type: application/json

{
  "dias": 7,  // Duración de la suspensión (default: 7)
  "razon": "Violación de términos de servicio"
}
```

**Respuesta:**

```json
{
  "status": "success",
  "message": "Usuario suspendido por 7 días",
  "usuario": {
    "_id": "...",
    "nick": "usuario123",
    "suspendidoHasta": "2025-12-13T..."
  },
  "razon": "Violación de términos de servicio"
}
```

**Restricciones:**

- ❌ No se puede suspender a admins o super_admin
- ✅ Se puede suspender a usuarios normales

---

### 7. Banear usuario (permanente)

```http
POST /api/moderacion/usuarios/:id/banear
Authorization: Bearer {token}
Content-Type: application/json

{
  "razon": "Actividad fraudulenta confirmada"
}
```

**Respuesta:**

```json
{
  "status": "success",
  "message": "Usuario baneado permanentemente",
  "usuario": {
    "_id": "...",
    "nick": "usuario123",
    "estaActivo": false
  },
  "razon": "Actividad fraudulenta confirmada"
}
```

**Diferencia entre suspender y banear:**

- **Suspender:** Temporal, el usuario podrá acceder después de X días
- **Banear:** Permanente, `estaActivo = false`, no puede iniciar sesión nunca

**Restricciones:**

- ❌ No se puede banear a admins o super_admin
- ✅ Se puede banear a usuarios normales

---

### 8. Reactivar usuario

```http
POST /api/moderacion/usuarios/:id/reactivar
Authorization: Bearer {token}
```

**Respuesta:**

```json
{
  "status": "success",
  "message": "Usuario reactivado exitosamente",
  "usuario": {
    "_id": "...",
    "nick": "usuario123",
    "estaActivo": true,
    "suspendidoHasta": null
  }
}
```

**Funcionalidad:**

- Quita suspensiones temporales
- Reactiva usuarios baneados
- Resetea `suspendidoHasta` a `null`
- Cambia `estaActivo` a `true`

---

## 🗑️ GESTIÓN DE CONTENIDO

### 9. Eliminar canción

```http
DELETE /api/moderacion/canciones/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "razon": "Contenido que viola derechos de autor"
}
```

**Respuesta:**

```json
{
  "status": "success",
  "message": "Canción eliminada exitosamente",
  "razon": "Contenido que viola derechos de autor"
}
```

---

### 10. Eliminar álbum

```http
DELETE /api/moderacion/albumes/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "razon": "Material inapropiado"
}
```

**Respuesta:**

```json
{
  "status": "success",
  "message": "Álbum y sus canciones eliminados exitosamente",
  "razon": "Material inapropiado"
}
```

**Nota:** Al eliminar un álbum también se eliminan todas sus canciones.

---

### 11. Eliminar playlist

```http
DELETE /api/moderacion/playlists/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "razon": "Playlist con contenido spam"
}
```

---

### 12. Eliminar comentario

```http
DELETE /api/moderacion/comentarios/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "razon": "Lenguaje ofensivo"
}
```

---

## 📈 ESTADÍSTICAS Y ACTIVIDAD

### 13. Estadísticas de la plataforma

```http
GET /api/moderacion/estadisticas
Authorization: Bearer {token}
```

**Respuesta:**

```json
{
  "status": "success",
  "estadisticas": {
    "usuarios": {
      "total": 1248,
      "activos": 1189,
      "suspendidos": 34,
      "nuevosUltimos30Dias": 156
    },
    "contenido": {
      "canciones": 5678,
      "albumes": 890,
      "playlists": 2345
    },
    "reportes": {
      "total": 156,
      "pendientes": 45
    }
  }
}
```

---

### 14. Actividad reciente

```http
GET /api/moderacion/actividad?limit=50
Authorization: Bearer {token}
```

**Respuesta:**

```json
{
  "status": "success",
  "actividad": {
    "nuevosUsuarios": [
      {
        "_id": "...",
        "nick": "newuser123",
        "nombreArtistico": "New Artist",
        "avatarUrl": "...",
        "createdAt": "2025-12-06T..."
      }
    ],
    "nuevasCanciones": [
      {
        "_id": "...",
        "titulo": "Nueva Canción",
        "artistas": [...],
        "createdAt": "2025-12-06T..."
      }
    ],
    "nuevosReportes": [
      {
        "_id": "...",
        "tipoContenido": "usuario",
        "motivo": "spam",
        "reportadoPor": {...},
        "createdAt": "2025-12-06T..."
      }
    ]
  }
}
```

---

## 🔄 Flujos de Trabajo Comunes

### Flujo 1: Resolver un reporte de contenido inapropiado

```bash
# 1. Ver reportes pendientes
GET /api/moderacion/reportes?estado=pendiente&prioridad=alta

# 2. Cambiar a "en revisión"
PUT /api/moderacion/reportes/{reporteId}/estado
{
  "estado": "en_revision"
}

# 3. Revisar el contenido (usar contenidoDetalle del reporte)

# 4. Resolver el reporte
POST /api/moderacion/reportes/{reporteId}/resolver
{
  "accion": "eliminar_contenido",
  "nota": "Contenido confirmado como inapropiado según términos de servicio"
}
```

---

### Flujo 2: Suspender usuario problemático

```bash
# 1. Buscar al usuario
GET /api/moderacion/usuarios?buscar=usuario123

# 2. Ver sus reportes
GET /api/moderacion/reportes?tipoContenido=usuario

# 3. Suspender por 7 días
POST /api/moderacion/usuarios/{userId}/suspender
{
  "dias": 7,
  "razon": "Múltiples reportes por acoso"
}

# 4. Si reincide, banear permanentemente
POST /api/moderacion/usuarios/{userId}/banear
{
  "razon": "Reincidencia en comportamiento de acoso"
}
```

---

### Flujo 3: Monitoreo diario

```bash
# 1. Ver estadísticas generales
GET /api/moderacion/estadisticas

# 2. Ver estadísticas de reportes
GET /api/moderacion/reportes/estadisticas

# 3. Ver actividad reciente
GET /api/moderacion/actividad?limit=100

# 4. Ver reportes urgentes
GET /api/moderacion/reportes?prioridad=urgente&estado=pendiente
```

---

## 🔐 Seguridad

### Validación de permisos

```javascript
// El middleware authAdmin valida automáticamente:
if (role !== "admin" && role !== "super_admin") {
  return 403 Forbidden
}
```

### Protecciones implementadas

- ❌ Admins NO pueden suspender/banear a otros admins
- ❌ Admins NO pueden suspender/banear al super admin
- ✅ Solo super_admin puede gestionar roles (crear/eliminar admins)
- ✅ Todos los admins pueden moderar contenido y usuarios normales

---

## 📋 Códigos de Estado

| Código | Significado                             |
| ------ | --------------------------------------- |
| `200`  | Operación exitosa                       |
| `201`  | Recurso creado                          |
| `400`  | Petición inválida (datos incorrectos)   |
| `401`  | No autenticado (token inválido/ausente) |
| `403`  | No autorizado (no es admin/super_admin) |
| `404`  | Recurso no encontrado                   |
| `500`  | Error del servidor                      |

---

## 🧪 Testing con Postman

### Collection completa

**1. Login como Admin**

```json
POST http://localhost:3900/api/usuarios/login
{
  "email": "admin@test.com",
  "password": "Admin123!"
}

// Guardar el token
```

**2. Ver reportes pendientes**

```json
GET http://localhost:3900/api/moderacion/reportes?estado=pendiente
Headers:
  Authorization: Bearer {token}
```

**3. Resolver reporte eliminando contenido**

```json
POST http://localhost:3900/api/moderacion/reportes/{reporteId}/resolver
Headers:
  Authorization: Bearer {token}
Body:
{
  "accion": "eliminar_contenido",
  "nota": "Violación confirmada de políticas de contenido"
}
```

**4. Suspender usuario**

```json
POST http://localhost:3900/api/moderacion/usuarios/{userId}/suspender
Headers:
  Authorization: Bearer {token}
Body:
{
  "dias": 14,
  "razon": "Comportamiento abusivo repetido"
}
```

**5. Ver estadísticas**

```json
GET http://localhost:3900/api/moderacion/estadisticas
Headers:
  Authorization: Bearer {token}
```

---

## 🎯 Mejores Prácticas

### Para Moderadores

1. **Priorizar reportes urgentes** - Revisar primero `prioridad=urgente`
2. **Documentar decisiones** - Siempre incluir `nota` al resolver reportes
3. **Suspensiones progresivas** - Primera vez: advertencia, Segunda: 7 días, Tercera: 30 días, Reincidencia: baneo
4. **Revisar contexto** - Antes de eliminar contenido, verificar el contexto completo

### Para Administradores

1. **Revisar actividad diaria** - Llamar `/moderacion/actividad` al inicio del día
2. **Monitorear estadísticas** - Revisar tendencias de reportes semanalmente
3. **Backup antes de eliminar** - Considerar hacer backup antes de eliminar contenido masivo
4. **Comunicación** - Mantener registro de razones de moderación para transparencia

---

## ❓ Solución de Problemas

### Error 403: "Acceso denegado"

**Causa:** El usuario no es admin o super_admin  
**Solución:** Verificar el rol en el token JWT, promover usuario a admin si es necesario

### Error: "No se puede suspender a un administrador"

**Causa:** Intentando suspender/banear a un admin o super_admin  
**Solución:** Solo usuarios con `role=user` pueden ser suspendidos/baneados

### Reporte no encuentra contenido

**Causa:** El contenido fue eliminado manualmente o por otro admin  
**Solución:** Marcar reporte como resuelto con acción "ninguna"

### Token expirado

**Causa:** JWT expiró después de 24h  
**Solución:** Hacer login nuevamente para obtener nuevo token

---

## 📝 Notas Adicionales

- Los reportes resueltos se mantienen en la base de datos para auditoría
- Las suspensiones se levantan automáticamente cuando `suspendidoHasta` < fecha actual
- Los usuarios baneados (`estaActivo=false`) no pueden iniciar sesión
- Al eliminar un álbum, todas sus canciones también se eliminan
- Las estadísticas se calculan en tiempo real (sin caché)

---

## 🚀 Próximas Funcionalidades (Sugeridas)

- [ ] Notificaciones automáticas a usuarios suspendidos
- [ ] Log de auditoría de acciones de moderación
- [ ] Dashboard visual de estadísticas
- [ ] Sistema de apelaciones para usuarios suspendidos
- [ ] Filtros de contenido automáticos con IA
- [ ] Reportes programados (reporte semanal de moderación)
