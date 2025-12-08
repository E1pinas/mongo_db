# Resumen Ejecutivo - Sistema de Administración TCG Music

## 🎯 Sistema Implementado

Se ha creado un sistema completo de administración y moderación con dos niveles de permisos:

### Roles y Permisos

| Rol                | Gestionar Admins | Moderar Contenido | Suspender Usuarios | Ver Estadísticas |
| ------------------ | ---------------- | ----------------- | ------------------ | ---------------- |
| **Super Admin** 👑 | ✅               | ✅                | ✅                 | ✅               |
| **Admin** 🛡️       | ❌               | ✅                | ✅                 | ✅               |
| **User** 👤        | ❌               | ❌                | ❌                 | ❌               |

---

## 📚 Archivos Creados

### Backend

```
backend/
├── src/
│   ├── controllers/
│   │   ├── adminController.js          ← Gestión de admins (solo super_admin)
│   │   └── moderacionController.js     ← Moderación (admin + super_admin)
│   ├── middlewares/
│   │   ├── authAdmin.js                ← Middleware para admin/super_admin
│   │   └── authSuperAdmin.js           ← Middleware solo super_admin
│   └── routes/
│       ├── admin.routes.js             ← Rutas /api/admin
│       └── moderacion.routes.js        ← Rutas /api/moderacion
├── scripts/
│   └── crear-super-admin.js            ← Script para crear super admin
├── ADMIN_SYSTEM.md                      ← Documentación de admins
└── MODERACION_GUIDE.md                  ← Documentación de moderación
```

### Modelos Actualizados

- `usuarioModels.js` - Añadido rol `super_admin`

---

## 🚀 Inicio Rápido

### 1. Crear Super Admin (PRIMERA VEZ)

```bash
cd backend
node scripts/crear-super-admin.js
```

**Credenciales por defecto:**

```
Email: superadmin@tcgmusic.com
Password: Admin123!
Nick: superadmin
```

⚠️ **IMPORTANTE:** Cambia las credenciales en el archivo antes de ejecutar en producción.

---

### 2. Login como Super Admin

```bash
POST http://localhost:3900/api/usuarios/login
Content-Type: application/json

{
  "email": "superadmin@tcgmusic.com",
  "password": "Admin123!"
}
```

Guarda el token recibido.

---

### 3. Crear tu primer Admin

```bash
POST http://localhost:3900/api/admin
Authorization: Bearer {token_super_admin}
Content-Type: application/json

{
  "nombre": "Admin",
  "apellidos": "Principal",
  "nick": "admin1",
  "email": "admin@tcgmusic.com",
  "password": "Admin123!",
  "pais": "México",
  "fechaNacimiento": "1995-01-01"
}
```

---

## 📋 Endpoints Disponibles

### A. Gestión de Admins (`/api/admin`) - Solo Super Admin

| Método   | Endpoint                  | Descripción                      |
| -------- | ------------------------- | -------------------------------- |
| `GET`    | `/api/admin`              | Listar todos los administradores |
| `POST`   | `/api/admin`              | Crear nuevo admin                |
| `DELETE` | `/api/admin/:id`          | Eliminar admin                   |
| `PUT`    | `/api/admin/:id/promover` | Usuario → Admin                  |
| `PUT`    | `/api/admin/:id/degradar` | Admin → Usuario                  |

**Reglas:**

- ❌ El super_admin NO puede ser eliminado
- ❌ El super_admin NO puede ser degradado
- ✅ Solo el super_admin puede crear/eliminar admins

---

### B. Moderación (`/api/moderacion`) - Admin y Super Admin

#### 📊 Reportes

| Método | Endpoint                                | Descripción              |
| ------ | --------------------------------------- | ------------------------ |
| `GET`  | `/api/moderacion/reportes`              | Ver todos los reportes   |
| `GET`  | `/api/moderacion/reportes/estadisticas` | Estadísticas de reportes |
| `PUT`  | `/api/moderacion/reportes/:id/estado`   | Cambiar estado           |
| `POST` | `/api/moderacion/reportes/:id/resolver` | Resolver reporte         |

#### 👥 Usuarios

| Método | Endpoint                                 | Descripción                 |
| ------ | ---------------------------------------- | --------------------------- |
| `GET`  | `/api/moderacion/usuarios`               | Listar usuarios con filtros |
| `POST` | `/api/moderacion/usuarios/:id/suspender` | Suspender temporalmente     |
| `POST` | `/api/moderacion/usuarios/:id/banear`    | Banear permanentemente      |
| `POST` | `/api/moderacion/usuarios/:id/reactivar` | Reactivar usuario           |

#### 🗑️ Contenido

| Método   | Endpoint                          | Descripción                |
| -------- | --------------------------------- | -------------------------- |
| `DELETE` | `/api/moderacion/canciones/:id`   | Eliminar canción           |
| `DELETE` | `/api/moderacion/albumes/:id`     | Eliminar álbum + canciones |
| `DELETE` | `/api/moderacion/playlists/:id`   | Eliminar playlist          |
| `DELETE` | `/api/moderacion/comentarios/:id` | Eliminar comentario        |

#### 📈 Estadísticas

| Método | Endpoint                       | Descripción            |
| ------ | ------------------------------ | ---------------------- |
| `GET`  | `/api/moderacion/estadisticas` | Stats de la plataforma |
| `GET`  | `/api/moderacion/actividad`    | Actividad reciente     |

---

## 🎬 Casos de Uso Comunes

### Caso 1: Usuario reportado por contenido inapropiado

```bash
# 1. Login como admin
POST /api/usuarios/login
{ "email": "admin@tcgmusic.com", "password": "..." }

# 2. Ver reportes pendientes
GET /api/moderacion/reportes?estado=pendiente

# 3. Cambiar a "en revisión"
PUT /api/moderacion/reportes/{reporteId}/estado
{ "estado": "en_revision" }

# 4. Resolver eliminando el contenido
POST /api/moderacion/reportes/{reporteId}/resolver
{
  "accion": "eliminar_contenido",
  "nota": "Contenido viola políticas de la plataforma"
}
```

---

### Caso 2: Usuario con comportamiento abusivo

```bash
# 1. Buscar al usuario
GET /api/moderacion/usuarios?buscar=usuario_problematico

# 2. Primera vez: Suspender 7 días
POST /api/moderacion/usuarios/{userId}/suspender
{
  "dias": 7,
  "razon": "Primer aviso por lenguaje ofensivo"
}

# 3. Si reincide: Banear permanentemente
POST /api/moderacion/usuarios/{userId}/banear
{
  "razon": "Reincidencia en comportamiento abusivo"
}
```

---

### Caso 3: Promover usuario a moderador

```bash
# Login como super_admin
POST /api/usuarios/login
{ "email": "superadmin@tcgmusic.com", "password": "..." }

# Opción A: Crear admin nuevo
POST /api/admin
{
  "nombre": "Moderador",
  "apellidos": "Nuevo",
  "nick": "mod2",
  "email": "mod2@tcgmusic.com",
  "password": "SecurePass123!",
  "pais": "España",
  "fechaNacimiento": "1998-05-20"
}

# Opción B: Promover usuario existente
PUT /api/admin/{userId}/promover
```

---

## 🔒 Restricciones de Seguridad

### ✅ Permitido

- Super admin puede crear/eliminar admins
- Admin puede suspender/banear usuarios normales
- Admin puede eliminar contenido reportado
- Admin puede ver estadísticas de la plataforma

### ❌ Prohibido

- Admin **NO** puede crear otros admins
- Admin **NO** puede suspender/banear a otros admins
- **Nadie** puede eliminar al super_admin
- **Nadie** puede degradar al super_admin
- Admin **NO** puede suspender al super_admin

---

## 📊 Tipos de Reportes Soportados

### Tipos de contenido reportable

- `cancion` - Canciones
- `album` - Álbumes
- `playlist` - Playlists
- `usuario` - Perfiles de usuario
- `comentario` - Comentarios

### Motivos de reporte

- `spam` - Contenido spam
- `contenido_inapropiado` - Material inapropiado
- `derechos_autor` - Violación de copyright
- `incitacion_odio` - Discurso de odio
- `acoso` - Acoso o bullying
- `informacion_falsa` - Fake news
- `otro` - Otros motivos

### Acciones de resolución

- `ninguna` - No tomar acción
- `advertencia` - Registrar advertencia
- `eliminar_contenido` - Eliminar el contenido
- `suspender_usuario` - Suspensión temporal
- `banear_usuario` - Baneo permanente

---

## 📈 Monitoreo Diario Sugerido

### Rutina matutina del admin

```bash
# 1. Ver estadísticas generales
GET /api/moderacion/estadisticas

# 2. Reportes urgentes
GET /api/moderacion/reportes?prioridad=urgente&estado=pendiente

# 3. Actividad reciente
GET /api/moderacion/actividad?limit=50

# 4. Usuarios suspendidos (revisar si termina suspensión)
GET /api/moderacion/usuarios?suspendido=true
```

---

## 🧪 Testing Rápido

### Con curl

```bash
# Login
curl -X POST http://localhost:3900/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@tcgmusic.com","password":"Admin123!"}'

# Listar admins (reemplaza TOKEN)
curl http://localhost:3900/api/admin \
  -H "Authorization: Bearer TOKEN"

# Ver estadísticas
curl http://localhost:3900/api/moderacion/estadisticas \
  -H "Authorization: Bearer TOKEN"
```

### Con Postman/Thunder Client

Importa esta colección básica:

```json
{
  "name": "TCG Music - Admin",
  "requests": [
    {
      "name": "Login Super Admin",
      "method": "POST",
      "url": "{{baseUrl}}/api/usuarios/login",
      "body": {
        "email": "superadmin@tcgmusic.com",
        "password": "Admin123!"
      }
    },
    {
      "name": "Listar Admins",
      "method": "GET",
      "url": "{{baseUrl}}/api/admin",
      "headers": {
        "Authorization": "Bearer {{token}}"
      }
    },
    {
      "name": "Ver Reportes",
      "method": "GET",
      "url": "{{baseUrl}}/api/moderacion/reportes",
      "headers": {
        "Authorization": "Bearer {{token}}"
      }
    }
  ]
}
```

---

## 🎓 Documentación Completa

- **ADMIN_SYSTEM.md** - Sistema de roles y gestión de admins
- **MODERACION_GUIDE.md** - Guía completa de moderación

---

## ⚠️ Recordatorios Importantes

1. **Primera vez:** Ejecuta `node scripts/crear-super-admin.js`
2. **Cambiar credenciales:** Edita el script antes de ejecutar en producción
3. **Backup:** El super_admin es único, guarda bien las credenciales
4. **Seguridad:** Usa contraseñas fuertes para todos los admins
5. **Testing:** Prueba en desarrollo antes de desplegar a producción

---

## 🚀 Despliegue a Producción

### Variables de entorno necesarias

Asegúrate de tener en Render/Vercel:

```env
NODE_ENV=production
MONGODB_URI_PROD=mongodb+srv://...
JWT_SECRET=tu_secret_muy_seguro
# ... otras variables
```

### Crear super_admin en producción

```bash
# Conectar a tu servidor
ssh tu_servidor

# O ejecutar en Render Shell
cd /ruta/backend
NODE_ENV=production node scripts/crear-super-admin.js
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del servidor
2. Verifica que el token no haya expirado
3. Confirma que el usuario tiene el rol correcto
4. Consulta la documentación completa en `ADMIN_SYSTEM.md` y `MODERACION_GUIDE.md`

---

✅ **Sistema completamente funcional y listo para usar**
