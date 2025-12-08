# Sistema de Administradores - TCG Music

## Roles del Sistema

### 1. **Super Admin** 👑

- **Único en el sistema** - Solo puede existir uno
- **No puede ser eliminado** por nadie
- **No puede ser degradado** a otro rol
- Tiene acceso completo a todas las funcionalidades

**Permisos exclusivos:**

- ✅ Crear nuevos administradores
- ✅ Eliminar administradores (excepto a sí mismo)
- ✅ Promover usuarios normales a admin
- ✅ Degradar admins a usuarios normales
- ✅ Ver lista completa de administradores

### 2. **Admin** 🛡️

- Pueden existir múltiples admins
- Creados únicamente por el Super Admin
- Pueden ser eliminados por el Super Admin
- Tienen acceso a funciones de moderación

**Permisos:**

- ✅ Ver reportes de usuarios
- ✅ Moderar contenido (canciones, álbumes, playlists)
- ✅ Suspender/activar usuarios normales
- ❌ NO pueden crear otros admins
- ❌ NO pueden eliminar al Super Admin

### 3. **User** 👤

- Rol predeterminado para nuevos registros
- Pueden ser promovidos a Admin por el Super Admin
- Acceso estándar a la plataforma

---

## Crear el Super Admin Inicial

### Paso 1: Configurar credenciales

Edita el archivo `backend/scripts/crear-super-admin.js` y modifica estos valores:

```javascript
const datosAdmin = {
  nombre: "Super",
  apellidos: "Admin",
  nick: "superadmin", // ← Cambia esto
  nombreArtistico: "Super Admin",
  email: "superadmin@tcgmusic.com", // ← Cambia esto
  password: "Admin123!", // ← Cambia esto (contraseña segura)
  pais: "Global",
  fechaNacimiento: new Date("1990-01-01"),
  role: "super_admin",
};
```

### Paso 2: Ejecutar el script

```bash
cd backend
node scripts/crear-super-admin.js
```

**Salida esperada:**

```
✅ Conectado a MongoDB
🎉 Super Administrador creado exitosamente
==================================================
Nick: superadmin
Email: superadmin@tcgmusic.com
Password: Admin123!
==================================================
⚠️  IMPORTANTE: Guarda estas credenciales de forma segura
⚠️  Cambia la contraseña después del primer login
✅ Desconectado de MongoDB
```

**Si ya existe un Super Admin:**

```
⚠️  Ya existe un Super Administrador en el sistema
   Nick: superadmin
   Email: superadmin@tcgmusic.com
```

---

## API Endpoints - Gestión de Administradores

### Base URL: `/api/admin`

Todas las rutas requieren autenticación de **Super Admin**.

---

### 1. Listar todos los administradores

```http
GET /api/admin
Authorization: Bearer {token_super_admin}
```

**Respuesta exitosa:**

```json
{
  "status": "success",
  "total": 3,
  "administradores": [
    {
      "_id": "...",
      "nombre": "Super",
      "apellidos": "Admin",
      "nick": "superadmin",
      "email": "superadmin@tcgmusic.com",
      "role": "super_admin",
      "avatarUrl": "",
      "fechaCreacion": "2025-12-06T..."
    },
    {
      "_id": "...",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "nick": "juanp",
      "email": "juan@example.com",
      "role": "admin",
      "avatarUrl": "",
      "fechaCreacion": "2025-12-06T..."
    }
  ]
}
```

---

### 2. Crear un nuevo administrador

```http
POST /api/admin
Authorization: Bearer {token_super_admin}
Content-Type: application/json

{
  "nombre": "María",
  "apellidos": "González",
  "nick": "mariag",
  "email": "maria@example.com",
  "password": "SecurePass123!",
  "pais": "México",
  "fechaNacimiento": "1995-05-15"
}
```

**Respuesta exitosa:**

```json
{
  "status": "success",
  "message": "Administrador creado exitosamente",
  "administrador": {
    "_id": "...",
    "nombre": "María",
    "apellidos": "González",
    "nick": "mariag",
    "email": "maria@example.com",
    "role": "admin",
    "pais": "México",
    "fechaNacimiento": "1995-05-15T00:00:00.000Z"
  }
}
```

**Errores posibles:**

- `400` - Email o nick ya existe
- `400` - Faltan campos obligatorios
- `403` - No eres Super Admin

---

### 3. Eliminar un administrador

```http
DELETE /api/admin/{id}
Authorization: Bearer {token_super_admin}
```

**Respuesta exitosa:**

```json
{
  "status": "success",
  "message": "Administrador eliminado exitosamente"
}
```

**Errores posibles:**

- `403` - No se puede eliminar al Super Admin
- `404` - Administrador no encontrado
- `400` - El usuario no es un administrador

---

### 4. Promover usuario normal a Admin

```http
PUT /api/admin/{id}/promover
Authorization: Bearer {token_super_admin}
```

**Respuesta exitosa:**

```json
{
  "status": "success",
  "message": "Usuario promovido a Administrador exitosamente",
  "usuario": {
    "_id": "...",
    "nombre": "Carlos",
    "nick": "carlosx",
    "role": "admin"
  }
}
```

**Errores posibles:**

- `400` - El usuario ya es administrador
- `404` - Usuario no encontrado

---

### 5. Degradar Admin a usuario normal

```http
PUT /api/admin/{id}/degradar
Authorization: Bearer {token_super_admin}
```

**Respuesta exitosa:**

```json
{
  "status": "success",
  "message": "Administrador degradado a usuario normal",
  "usuario": {
    "_id": "...",
    "nombre": "Carlos",
    "nick": "carlosx",
    "role": "user"
  }
}
```

**Errores posibles:**

- `403` - No se puede degradar al Super Admin
- `400` - El usuario no es un administrador
- `404` - Usuario no encontrado

---

## Reglas de Seguridad

### ✅ Permitido

- Super Admin puede crear múltiples Admins
- Super Admin puede eliminar cualquier Admin
- Super Admin puede promover usuarios a Admin
- Super Admin puede degradar Admins a usuarios

### ❌ Prohibido

- **Nadie** puede eliminar al Super Admin
- **Nadie** puede degradar al Super Admin
- Admins **NO** pueden crear otros admins
- Admins **NO** pueden modificar roles
- Usuarios normales **NO** pueden acceder a `/api/admin`

---

## Flujo de Trabajo Recomendado

### 1. Configuración Inicial

```bash
# 1. Editar credenciales en crear-super-admin.js
# 2. Ejecutar script
node scripts/crear-super-admin.js

# 3. Login como Super Admin
POST /api/usuarios/login
{
  "email": "superadmin@tcgmusic.com",
  "password": "Admin123!"
}

# 4. Guardar el token recibido
```

### 2. Crear Administradores

```bash
# Con el token del Super Admin
POST /api/admin
Authorization: Bearer {token}
{
  "nombre": "Moderador",
  "apellidos": "Sistema",
  "nick": "mod1",
  "email": "mod1@tcgmusic.com",
  "password": "ModPass123!",
  "pais": "España",
  "fechaNacimiento": "1998-03-20"
}
```

### 3. Gestionar Administradores

```bash
# Listar todos
GET /api/admin

# Promover usuario existente
PUT /api/admin/{userId}/promover

# Eliminar admin
DELETE /api/admin/{adminId}

# Degradar admin
PUT /api/admin/{adminId}/degradar
```

---

## Ejemplo de Uso con Postman/Thunder Client

### Colección de Requests

**1. Login Super Admin**

```
POST http://localhost:3900/api/usuarios/login
Body:
{
  "email": "superadmin@tcgmusic.com",
  "password": "Admin123!"
}

Guardar el token de la respuesta
```

**2. Crear Admin**

```
POST http://localhost:3900/api/admin
Headers:
  Authorization: Bearer {token}
Body:
{
  "nombre": "Admin",
  "apellidos": "Prueba",
  "nick": "admintest",
  "email": "admin@test.com",
  "password": "Test123!",
  "pais": "Argentina",
  "fechaNacimiento": "2000-01-01"
}
```

**3. Listar Admins**

```
GET http://localhost:3900/api/admin
Headers:
  Authorization: Bearer {token}
```

---

## Testing

### Probar la creación del Super Admin

```bash
node scripts/crear-super-admin.js
```

### Probar endpoints con curl

```bash
# Login
curl -X POST http://localhost:3900/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@tcgmusic.com","password":"Admin123!"}'

# Listar admins (con el token obtenido)
curl http://localhost:3900/api/admin \
  -H "Authorization: Bearer {tu_token}"
```

---

## Notas Importantes

⚠️ **Seguridad:**

- El Super Admin debe tener una contraseña muy fuerte
- Cambia la contraseña predeterminada inmediatamente
- Nunca compartas las credenciales del Super Admin
- Guarda las credenciales en un gestor de contraseñas seguro

⚠️ **Base de datos:**

- Solo puede existir UN super_admin en todo el sistema
- Si ejecutas el script dos veces, te avisará que ya existe
- Para cambiar el super_admin, debes modificarlo directamente en MongoDB

⚠️ **Producción:**

- Ejecuta el script en producción también: `NODE_ENV=production node scripts/crear-super-admin.js`
- Usa contraseñas diferentes para desarrollo y producción
- Considera usar variables de entorno para las credenciales del script

---

## Solución de Problemas

### Error: "Ya existe un Super Administrador"

**Solución:** El script detectó que ya existe un super_admin. Si necesitas crear uno nuevo:

1. Elimina el super_admin existente desde MongoDB Compass
2. Vuelve a ejecutar el script

### Error: "No se encontró la variable de entorno MONGODB_URI"

**Solución:** Verifica que tu archivo `.env` tenga:

```env
NODE_ENV=development
MONGODB_URI_DEV=mongodb://127.0.0.1:27017/tcg_music
MONGODB_URI_PROD=mongodb+srv://...
```

### Error 403: "Acceso denegado"

**Solución:** Verifica que:

1. Estás usando el token del Super Admin (no de un admin normal)
2. El token no ha expirado
3. El header `Authorization: Bearer {token}` está correcto
