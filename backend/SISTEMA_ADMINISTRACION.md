# 🔐 Sistema de Administración - TCG Music

## 📋 Resumen del Sistema

### Roles del Sistema

1. **user** - Usuario normal (puede subir música, crear playlists, etc.)
2. **admin** - Administrador (moderación y gestión de contenido)
3. **super_admin** - Super Administrador (gestión total del sistema)

---

## 👑 Super Administrador

### Credenciales Actuales

```
Email: superadmin@tcgmusic.com
Nick: superadmin
Password: Admin123!
```

**⚠️ IMPORTANTE: Cambia la contraseña después del primer login**

### Características del Super Admin

- ✅ **NO puede ser eliminado** por nadie (ni siquiera por él mismo)
- ✅ **NO puede ser suspendido** ni baneado
- ✅ **NO puede ser degradado** a admin o user
- ✅ Es el **único** que puede crear el script `crear-super-admin.js`
- ✅ **Solo puede haber UNO** en el sistema

### Poderes Exclusivos del Super Admin

1. **Gestión de Administradores:**

   - Crear nuevos admins
   - Eliminar admins (NO puede eliminar a super_admin)
   - Promover usuarios normales a admin
   - Degradar admins a usuarios normales
   - Ver lista de todos los administradores

2. **Todas las funciones de moderación:**
   - Gestionar reportes
   - Suspender/banear usuarios (excepto admins y super_admin)
   - Eliminar contenido inapropiado
   - Ver estadísticas del sistema

---

## 👮 Administradores (admin)

### Creación de Admins

- **Solo el super_admin** puede crear admins
- Se crean desde la ruta: `POST /api/admin/`
- NO se puede crear un super_admin desde esta ruta

### Características de los Admins

- ✅ **NO pueden ser suspendidos** ni baneados
- ✅ **Pueden ser eliminados** solo por el super_admin
- ✅ **Pueden ser degradados** a usuarios normales por el super_admin
- ⛔ **NO pueden eliminar** a otros admins
- ⛔ **NO pueden crear** nuevos admins
- ⛔ **NO pueden eliminar** al super_admin

### Poderes de los Admins

1. **Moderación:**

   - Gestionar reportes de usuarios
   - Suspender usuarios normales
   - Banear usuarios normales
   - Eliminar contenido inapropiado (canciones, álbumes, playlists, posts)
   - Ver estadísticas de moderación

2. **Gestión de Contenido:**
   - Eliminar playlists/álbumes (propios y ajenos)
   - Moderar comentarios
   - Ver y gestionar reportes

---

## 🛡️ Protecciones del Sistema

### 1. Super Admin NO puede:

```javascript
// ❌ Ser eliminado
if (usuario.role === "super_admin") {
  return res.status(403).json({
    message: "No se puede eliminar al Super Administrador",
  });
}

// ❌ Ser degradado
if (usuario.role === "super_admin") {
  return res.status(403).json({
    message: "No se puede degradar al Super Administrador",
  });
}

// ❌ Ser suspendido o baneado
if (usuario.role === "super_admin") {
  throw new Error("No se puede suspender a un administrador");
}
```

### 2. Admins NO pueden:

```javascript
// ❌ Ser suspendidos o baneados
if (usuario.role === "admin" || usuario.role === "super_admin") {
  throw new Error("No se puede suspender a un administrador");
}

// ❌ Gestionar otros administradores (solo super_admin)
// Todas las rutas de /api/admin/* requieren authSuperAdmin
```

### 3. Usuarios Normales NO pueden:

- Acceder a rutas de administración
- Acceder a rutas de moderación
- Ver información de administradores

---

## 🔗 Rutas de Administración

### Gestión de Administradores (Solo Super Admin)

```
GET    /api/admin/          → Listar todos los administradores
POST   /api/admin/          → Crear nuevo administrador
DELETE /api/admin/:id       → Eliminar administrador
PUT    /api/admin/:id/promover → Promover usuario a admin
PUT    /api/admin/:id/degradar → Degradar admin a usuario
```

### Moderación (Admin y Super Admin)

```
GET    /api/moderacion/reportes          → Ver reportes
GET    /api/moderacion/reportes/:id      → Ver detalle de reporte
PUT    /api/moderacion/reportes/:id      → Actualizar estado de reporte
PUT    /api/moderacion/usuarios/:id/suspender → Suspender usuario
PUT    /api/moderacion/usuarios/:id/banear    → Banear usuario
PUT    /api/moderacion/usuarios/:id/reactivar → Reactivar usuario
DELETE /api/moderacion/contenido/:tipo/:id     → Eliminar contenido
```

---

## 🔒 Middlewares de Autenticación

### authSuperAdmin

```javascript
// Solo permite acceso a super_admin
if (decoded.role !== "super_admin") {
  return res.status(403).json({
    message: "Acceso denegado. Se requiere rol de Super Administrador",
  });
}
```

### authAdmin

```javascript
// Permite acceso a admin Y super_admin
if (decoded.role !== "admin" && decoded.role !== "super_admin") {
  return res.status(403).json({
    message: "Acceso denegado. Se requiere rol de Administrador",
  });
}
```

### authUsuario

```javascript
// Permite acceso a cualquier usuario autenticado (user, admin, super_admin)
```

---

## 📝 Crear Super Admin

### Script de Creación

```bash
cd backend
node scripts/crear-super-admin.js
```

### Comportamiento del Script

- ✅ Verifica si ya existe un super_admin
- ✅ Solo permite crear UNO
- ✅ Encripta la contraseña con bcrypt
- ✅ Crea usuario con role: "super_admin"
- ✅ Lo hace invisible (esVisible: false)
- ✅ Deshabilita subir contenido (puedeSubirContenido: false)

### Modificar Datos del Super Admin

Edita el archivo: `backend/scripts/crear-super-admin.js`

```javascript
const datosAdmin = {
  nombre: "Super",
  apellidos: "Admin",
  nick: "superadmin",
  nombreArtistico: "Super Admin",
  email: "superadmin@tcgmusic.com",
  password: "Admin123!", // ⚠️ CAMBIAR ESTA CONTRASEÑA
  pais: "Global",
  fechaNacimiento: new Date("1990-01-01"),
  role: "super_admin",
  esVisible: false,
  puedeSubirContenido: false,
};
```

---

## 🎯 Jerarquía de Permisos

```
super_admin (Solo UNO)
    ├── Gestionar administradores (crear, eliminar, promover, degradar)
    ├── Todas las funciones de moderación
    └── NO puede ser eliminado ni modificado

admin (Múltiples)
    ├── Funciones de moderación
    ├── Gestionar contenido
    ├── NO pueden gestionar otros admins
    └── Pueden ser eliminados solo por super_admin

user (Todos los demás)
    ├── Usar la plataforma normalmente
    ├── Subir música (si puedeSubirContenido = true)
    └── Pueden ser moderados por admins y super_admin
```

---

## 🚨 Casos de Uso

### Crear Primer Super Admin

```bash
# Primera vez instalando el sistema
node scripts/crear-super-admin.js
```

### Crear Nuevos Administradores

```bash
# Como super_admin, desde el frontend o API:
POST /api/admin/
{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "nick": "juanadmin",
  "email": "juan@admin.com",
  "password": "password123",
  "pais": "España",
  "fechaNacimiento": "1995-01-15"
}
```

### Eliminar Administrador

```bash
# Como super_admin:
DELETE /api/admin/675773f8e66c52b1e58b19c3
```

### Promover Usuario a Admin

```bash
# Como super_admin:
PUT /api/admin/675773f8e66c52b1e58b19c3/promover
```

### Degradar Admin a Usuario

```bash
# Como super_admin:
PUT /api/admin/675773f8e66c52b1e58b19c3/degradar
```

---

## ✅ Verificación del Sistema

### Comandos de Verificación

```bash
# Ver usuarios en MongoDB
mongosh
use tcg_music_dev
db.usuarios.find({ role: "super_admin" })
db.usuarios.find({ role: "admin" })

# Contar administradores
db.usuarios.countDocuments({ role: { $in: ["admin", "super_admin"] } })
```

### Verificar Protecciones

1. Intenta eliminar al super_admin → Debe fallar
2. Intenta degradar al super_admin → Debe fallar
3. Intenta suspender a un admin → Debe fallar
4. Intenta crear admin sin ser super_admin → Debe fallar

---

## 🔄 Recuperar Super Admin Eliminado

Si por error se elimina el super_admin desde la base de datos:

```bash
# Volver a ejecutar el script
cd backend
node scripts/crear-super-admin.js
```

⚠️ El script solo creará uno nuevo si NO existe ningún super_admin en la BD.

---

## 📚 Archivos Relacionados

- `backend/scripts/crear-super-admin.js` - Script de creación
- `backend/src/controllers/adminController.js` - Gestión de admins
- `backend/src/controllers/moderacionController.js` - Funciones de moderación
- `backend/src/middlewares/authSuperAdmin.js` - Verificación super_admin
- `backend/src/middlewares/authAdmin.js` - Verificación admin
- `backend/src/routes/admin.routes.js` - Rutas de gestión de admins
- `backend/src/routes/moderacion.routes.js` - Rutas de moderación
- `backend/src/models/usuarioModels.js` - Modelo con roles

---

## 🎉 Resumen

✅ **Super Admin creado exitosamente**
✅ **Solo el super_admin puede crear/eliminar admins**
✅ **Nadie puede eliminar al super_admin**
✅ **Admins y super_admin NO pueden ser suspendidos/baneados**
✅ **Todas las funciones de moderación funcionan para ambos roles**
✅ **Sistema completamente protegido**

---

**Última actualización:** 10 de Diciembre, 2025
