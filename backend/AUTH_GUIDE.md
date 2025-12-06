# 🔐 Sistema de Autenticación con JWT y Cookies

## 📌 Funcionamiento

1. **Registro/Login**: El servidor crea un JWT y lo envía en:

   - Cookie `token` (httpOnly, secure)
   - Respuesta JSON (para almacenamiento opcional en frontend)

2. **Requests protegidos**: El middleware `authUsuario` verifica el token desde:

   - Cookie `token` (preferido)
   - Header `Authorization: Bearer {token}` (alternativa)

3. **Redirección**: Si no hay token o es inválido, el backend responde con:
   ```json
   {
     "ok": false,
     "message": "Acceso denegado",
     "redirectTo": "/login"
   }
   ```

---

## 🚀 Endpoints de Autenticación

### 1. Registro

**POST** `/api/usuarios/registro`

```javascript
// Request
{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "nick": "juanperez",
  "email": "juan@example.com",
  "password": "password123",
  "pais": "MX",
  "fechaNacimiento": "1995-05-20"
}

// Response (200)
{
  "ok": true,
  "message": "Usuario registrado correctamente",
  "usuario": {
    "_id": "673d2a1b5f8e9c001234abcd",
    "nombre": "Juan",
    "nick": "juanperez",
    "email": "juan@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

// Cookie automática: token=eyJhbGciOiJIUzI1NiIs...
```

### 2. Login

**POST** `/api/usuarios/login`

```javascript
// Request
{
  "email": "juan@example.com",
  "password": "password123"
}

// Response (200)
{
  "ok": true,
  "message": "Sesión iniciada correctamente",
  "usuario": {
    "_id": "673d2a1b5f8e9c001234abcd",
    "nombre": "Juan",
    "nick": "juanperez",
    "email": "juan@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

// Cookie automática: token=eyJhbGciOiJIUzI1NiIs...
```

### 3. Logout

**POST** `/api/usuarios/logout`

```javascript
// Headers: Cookie con token (automático)

// Response (200)
{
  "ok": true,
  "message": "Sesión cerrada correctamente",
  "redirectTo": "/login"
}

// Cookie eliminada automáticamente
```

### 4. Obtener Perfil

**GET** `/api/usuarios/perfil`

```javascript
// Headers: Cookie con token (automático)

// Response (200)
{
  "ok": true,
  "usuario": {
    "_id": "673d2a1b5f8e9c001234abcd",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "nick": "juanperez",
    "email": "juan@example.com",
    "avatarUrl": "https://...",
    "pais": "MX"
  }
}

// Error sin autenticación (401)
{
  "ok": false,
  "message": "Acceso denegado. No se proporcionó token de autenticación",
  "redirectTo": "/login"
}
```

---

## 💻 Implementación Frontend

### Opción 1: Con Cookies (Recomendado)

El navegador envía automáticamente las cookies en cada request. **No necesitas hacer nada especial**.

```javascript
// React/Next.js ejemplo

// 1. Login
const login = async (email, password) => {
  const response = await fetch("http://localhost:3001/api/usuarios/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ⚠️ IMPORTANTE: Envía cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.message);
  }

  // Cookie ya está guardada automáticamente
  return data.usuario;
};

// 2. Hacer request protegido
const getMiPerfil = async () => {
  const response = await fetch("http://localhost:3001/api/usuarios/perfil", {
    credentials: "include", // ⚠️ Incluye cookie automáticamente
  });

  const data = await response.json();

  if (!data.ok) {
    // Redirigir a login si no está autenticado
    window.location.href = data.redirectTo || "/login";
    return;
  }

  return data.usuario;
};

// 3. Logout
const logout = async () => {
  await fetch("http://localhost:3001/api/usuarios/logout", {
    method: "POST",
    credentials: "include",
  });

  // Redirigir a login
  window.location.href = "/login";
};

// 4. Verificar si está autenticado (en cada carga de página)
const verificarAutenticacion = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/usuarios/perfil", {
      credentials: "include",
    });

    const data = await response.json();

    if (!data.ok) {
      // No autenticado, redirigir a login
      window.location.href = "/login";
      return null;
    }

    return data.usuario;
  } catch (error) {
    window.location.href = "/login";
    return null;
  }
};
```

### Opción 2: Con Token en Header (Alternativa)

Si no puedes usar cookies, guarda el token en `localStorage` o `sessionStorage`.

```javascript
// 1. Login y guardar token
const login = async (email, password) => {
  const response = await fetch("http://localhost:3001/api/usuarios/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.ok) {
    // Guardar token en localStorage
    localStorage.setItem("token", data.token);
    return data.usuario;
  }

  throw new Error(data.message);
};

// 2. Hacer request protegido con token
const getMiPerfil = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  const response = await fetch("http://localhost:3001/api/usuarios/perfil", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!data.ok) {
    // Token inválido o expirado
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  return data.usuario;
};

// 3. Logout
const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
```

---

## 🛡️ Protección de Rutas en Frontend

### React Router Ejemplo

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Hook personalizado para verificar autenticación
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/usuarios/perfil",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.ok) {
          setUser(data.usuario);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verificarAuth();
  }, []);

  return { user, loading };
};

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Uso en rutas
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/registro" element={<Registro />} />

  {/* Rutas protegidas */}
  <Route
    path="/inicio"
    element={
      <ProtectedRoute>
        <Inicio />
      </ProtectedRoute>
    }
  />

  <Route
    path="/perfil"
    element={
      <ProtectedRoute>
        <Perfil />
      </ProtectedRoute>
    }
  />
</Routes>;
```

### Next.js Middleware Ejemplo

```javascript
// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token");
  const url = request.nextUrl.clone();

  // Rutas protegidas
  const protectedPaths = ["/inicio", "/perfil", "/biblioteca", "/upload"];
  const isProtected = protectedPaths.some((path) =>
    url.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Si está en login pero tiene token, redirigir a inicio
  if (url.pathname === "/login" && token) {
    url.pathname = "/inicio";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 🔧 Configuración CORS

Para que las cookies funcionen con frontend en otro dominio:

```javascript
// index.js
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // ⚠️ IMPORTANTE: Permite cookies
  })
);
```

Y en el `.env`:

```env
FRONTEND_URL=http://localhost:3000
```

---

## 📝 Resumen de Flujo

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ 1. POST /api/usuarios/login
       │    { email, password }
       │
       ▼
┌──────────────┐
│   Backend    │
│   - Verifica │
│   - Crea JWT │
│   - Set Cookie│
└──────┬───────┘
       │
       │ 2. Response { ok: true, usuario, token }
       │    + Cookie: token=...
       │
       ▼
┌─────────────┐
│   Frontend  │
│  (Cookie    │
│   guardada) │
└──────┬──────┘
       │
       │ 3. GET /api/usuarios/perfil
       │    (Cookie enviada automáticamente)
       │
       ▼
┌──────────────┐
│   Backend    │
│ authUsuario  │
│ middleware   │
│   - Lee cookie│
│   - Verifica │
└──────┬───────┘
       │
       │ 4. Response { ok: true, usuario }
       │
       ▼
┌─────────────┐
│   Frontend  │
│   Renderiza │
│   contenido │
└─────────────┘
```

---

## ⚠️ Importante

1. **Cookie httpOnly**: No es accesible desde JavaScript (protege contra XSS)
2. **Cookie secure**: Solo se envía por HTTPS en producción
3. **SameSite strict**: Protege contra CSRF
4. **Duración**: 7 días por defecto
5. **credentials: 'include'**: Necesario en fetch para enviar cookies cross-origin

---

## 🐛 Solución de Problemas

### "Acceso denegado. No se proporcionó token"

- ✅ Verifica que uses `credentials: 'include'` en fetch
- ✅ Verifica configuración CORS con `credentials: true`
- ✅ Revisa que la cookie no haya expirado

### "Token inválido o expirado"

- ✅ Haz login nuevamente
- ✅ Verifica que `JWT_SECRET` sea el mismo en .env

### Cookie no se guarda

- ✅ Verifica que frontend y backend estén en el mismo dominio o configurados correctamente
- ✅ En desarrollo local, usa `localhost` en ambos (no `127.0.0.1`)
- ✅ Verifica que no uses `secure: true` en desarrollo HTTP
