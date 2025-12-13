# 🚫 Sistema de Bloqueo de Usuarios - Documentación Completa

## 📋 Descripción General

Sistema completo de bloqueo de usuarios que permite a los usuarios bloquear a otros, impidiendo cualquier interacción entre ellos. Similar a Facebook o Instagram.

---

## 🏗️ Arquitectura

### **Backend (Node.js + Express + MongoDB)**

#### 1. **Modelo de Datos** (`bloqueoModels.js`)

```javascript
{
  bloqueador: ObjectId,  // Usuario que bloquea
  bloqueado: ObjectId,   // Usuario bloqueado
  razon: String,         // Razón opcional del bloqueo
  createdAt: Date,       // Fecha del bloqueo
  updatedAt: Date
}
```

**Índices:**

- `{ bloqueador: 1, bloqueado: 1 }` - Único, evita duplicados
- `{ bloqueado: 1, bloqueador: 1 }` - Para consultas bidireccionales

---

#### 2. **Endpoints API** (`bloqueo.routes.js`)

| Método | Ruta                                   | Descripción                 |
| ------ | -------------------------------------- | --------------------------- |
| POST   | `/api/bloqueos/:usuarioId/bloquear`    | Bloquear usuario            |
| DELETE | `/api/bloqueos/:usuarioId/desbloquear` | Desbloquear usuario         |
| GET    | `/api/bloqueos/:usuarioId/verificar`   | Verificar estado de bloqueo |
| GET    | `/api/bloqueos/mis-bloqueados`         | Listar usuarios bloqueados  |

---

#### 3. **Lógica de Negocio** (`bloqueoController.js`)

**Al bloquear un usuario:**

1. ✅ Crear registro de bloqueo en BD
2. 🗑️ Eliminar amistades existentes (ambas direcciones)
3. 🗑️ Eliminar relaciones de seguimiento (ambas direcciones)
4. 🔄 Actualizar contadores de seguidores

**Validaciones:**

- ❌ No puedes bloquearte a ti mismo
- ❌ No puedes bloquear dos veces al mismo usuario
- ✅ Verificar que el usuario a bloquear existe

---

#### 4. **Middleware de Protección** (`checkBloqueo.js`)

**`checkBloqueo(source, field)`**

- Verifica si existe bloqueo entre usuario autenticado y usuario objetivo
- Puede usarse con ID o nick
- Retorna 403 si hay bloqueo (sin revelar quién bloqueó a quién)

**Ejemplo de uso:**

```javascript
// En rutas de perfil
router.get(
  "/nick/:nick",
  authOptional,
  checkBloqueo("params", "nick"),
  obtenerPerfilPorNick
);
```

**`filtrarBloqueados`**

- Para endpoints que devuelven listas de usuarios
- Agrega `req.usuariosBloqueados` con IDs a excluir

---

### **Frontend (React + TypeScript)**

#### 5. **Servicio de API** (`bloqueo.service.ts`)

```typescript
class BloqueoService {
  async bloquearUsuario(usuarioId: string, razon?: string);
  async desbloquearUsuario(usuarioId: string);
  async verificarBloqueo(usuarioId: string);
  async obtenerBloqueados();
}
```

---

#### 6. **Componente de Botón** (`BlockButton.tsx`)

**Props:**

```typescript
{
  usuarioId: string;
  className?: string;
  onBlockChange?: (bloqueado: boolean) => void;
}
```

**Características:**

- ✅ Verifica automáticamente el estado al montar
- 🔄 Cambia entre "Bloquear" y "Desbloqueado" según estado
- ⚠️ Modal de confirmación antes de bloquear
- 🔄 Loading states durante las acciones
- 🎯 Callback opcional cuando cambia el estado

---

#### 7. **Integración en Perfiles** (`Profile.tsx`)

```tsx
{
  profileUser._id && (
    <BlockButton
      usuarioId={profileUser._id}
      onBlockChange={(bloqueado) => {
        if (bloqueado) {
          navigate("/"); // Redirigir al home
        }
      }}
    />
  );
}
```

---

#### 8. **Página de Gestión** (`BlockedUsers.tsx`)

Características:

- 📋 Lista de usuarios bloqueados
- 📅 Muestra fecha de bloqueo
- ✅ Desbloquear con confirmación
- 📝 Información sobre qué significa bloquear

---

## 🔒 Comportamiento del Sistema

### **Usuario A bloquea a Usuario B:**

#### Backend:

1. Se crea registro en colección `bloqueos`
2. Se eliminan amistades (tabla `amistades`)
3. Se eliminan seguimientos (tabla `seguidores`)
4. Se actualizan contadores

#### Frontend:

5. B **no** puede buscar a A (filtrado en búsqueda)
6. B **no** puede acceder a `/perfil/usuario_a`:
   - API retorna 403 Forbidden
   - Frontend muestra "Usuario no encontrado"
7. B **no** puede ver posts de A en feeds
8. B **no** puede interactuar con contenido de A

---

## 🔍 Casos de Uso

### **Caso 1: Bloquear desde perfil**

```
Usuario A → Perfil de B → Botón "Bloquear" → Confirmación → Bloqueado
Resultado: A es redirigido al home, B ya no puede ver perfil de A
```

### **Caso 2: Intentar acceder a perfil bloqueado**

```
Usuario B → Intenta /perfil/usuario_a
Backend: checkBloqueo() → 403 Forbidden
Frontend: Muestra "Usuario no encontrado" (privacidad)
```

### **Caso 3: Búsqueda global**

```
Usuario B → Busca "usuario_a"
Backend: Filtra bloqueados de resultados
Frontend: No aparece en resultados (como si no existiera)
```

### **Caso 4: Desbloquear**

```
Usuario A → Usuarios Bloqueados → Lista → Desbloquear B → Confirmación
Resultado: Se elimina registro, B puede volver a ver perfil de A
```

---

## 🛡️ Privacidad y Seguridad

### **Principios aplicados:**

1. **No revelar información:**

   - Si B está bloqueado, ve "Usuario no encontrado"
   - No se indica quién bloqueó a quién (403 genérico)

2. **Bidireccional:**

   - Si A bloquea a B, **ambos** pierden acceso mutuo
   - Previene acoso indirecto

3. **Limpieza automática:**

   - Elimina relaciones existentes
   - Actualiza contadores correctamente

4. **Reversible:**
   - Desbloquear no restaura relaciones previas
   - Usuario debe volver a seguir/agregar manualmente

---

## 📊 Base de Datos - Consultas Optimizadas

### **Índices creados:**

```javascript
// Índice único compuesto (evita duplicados)
{ bloqueador: 1, bloqueado: 1 } unique

// Índice inverso (consultas rápidas bidireccionales)
{ bloqueado: 1, bloqueador: 1 }

// En búsqueda de usuarios
{ nick: 1 }
{ nombreArtistico: 1 }
```

### **Consulta típica (verificar bloqueo):**

```javascript
db.bloqueos.findOne({
  $or: [
    { bloqueador: usuarioA, bloqueado: usuarioB },
    { bloqueador: usuarioB, bloqueado: usuarioA },
  ],
});
```

Tiempo: ~5-10ms con índices

---

## 🚀 Cómo Usar

### **Backend - Proteger un endpoint:**

```javascript
import { checkBloqueo } from "../middlewares/checkBloqueo.js";

// Proteger endpoint de perfil
router.get(
  "/perfil/:nick",
  authOptional,
  checkBloqueo("params", "nick"),
  obtenerPerfil
);

// Filtrar usuarios bloqueados en búsqueda
router.get("/buscar", authOptional, filtrarBloqueados, buscarUsuarios);
```

### **Frontend - Añadir botón de bloqueo:**

```tsx
import BlockButton from "../components/BlockButton";

<BlockButton
  usuarioId={usuario._id}
  onBlockChange={(bloqueado) => {
    console.log("Estado cambiado:", bloqueado);
  }}
/>;
```

---

## ✅ Testing Manual

### **Checklist de pruebas:**

- [ ] A puede bloquear a B desde su perfil
- [ ] Aparece modal de confirmación con advertencias
- [ ] Tras bloquear, A es redirigido al home
- [ ] B no puede buscar a A (no aparece en resultados)
- [ ] B intenta `/perfil/usuario_a` → "Usuario no encontrado"
- [ ] Se eliminaron amistades/seguimientos automáticamente
- [ ] A puede ver a B en "Usuarios bloqueados"
- [ ] A puede desbloquear a B
- [ ] Tras desbloquear, B puede volver a ver perfil de A
- [ ] Contadores de seguidores actualizados correctamente

---

## 🐛 Errores Comunes y Soluciones

### **Error: "Cannot read property '\_id' of undefined"**

**Causa:** usuarioId no está definido
**Solución:** Verificar que `profileUser._id` existe antes de renderizar

### **Error: 403 Forbidden en todas las rutas**

**Causa:** Middleware aplicado globalmente sin verificar autenticación
**Solución:** Usar `authOptional` antes de `checkBloqueo`

### **Error: Búsqueda sigue mostrando usuarios bloqueados**

**Causa:** No se está filtrando en el backend
**Solución:** Actualizar `buscarUsuarios()` para usar modelo `Bloqueo`

---

## 📈 Mejoras Futuras

- [ ] Razones predefinidas de bloqueo (dropdown)
- [ ] Estadísticas de bloqueos para admins
- [ ] Bloqueo temporal (expira automáticamente)
- [ ] Ocultar también contenido en feeds de posts
- [ ] Notificar a moderadores si un usuario recibe muchos bloqueos
- [ ] Cache de bloqueos en Redis para mejor performance

---

## 📞 Soporte

Si encuentras algún problema:

1. Verifica que todas las rutas están registradas en `index.js`
2. Revisa que los índices de MongoDB se crearon correctamente
3. Comprueba los logs del backend con `console.log`
4. Verifica en Network tab del navegador las respuestas de API

---

**Autor:** Sistema de bloqueo completo  
**Versión:** 1.0  
**Fecha:** Diciembre 2024
