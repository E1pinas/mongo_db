# TCG Music - Frontend

Layout tipo Spotify construido con **React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router 7**

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── main.tsx                    # Punto de entrada, renderiza <App />
├── App.tsx                     # Configuración del router con createBrowserRouter
├── index.css                   # Estilos globales de Tailwind
├── vite-env.d.ts              # Tipos para variables de entorno
│
├── layouts/
│   └── ShellLayout.tsx        # Layout principal con Outlet
│
├── components/
│   └── layout/
│       ├── TopNav.tsx         # Barra superior fija con navegación
│       ├── SidebarLeft.tsx    # Sidebar izquierdo colapsable (biblioteca)
│       ├── SidebarRight.tsx   # Sidebar derecho colapsable (amigos/cola)
│       └── PlayerBar.tsx      # Reproductor fijo inferior
│
├── pages/
│   ├── Home.tsx               # Página de inicio (/)
│   ├── Albums.tsx             # Página de álbumes (/albums)
│   ├── Playlists.tsx          # Página de playlists (/playlists)
│   ├── Profile.tsx            # Página de perfil (/profile)
│   ├── Notifications.tsx      # Página de notificaciones (/notifications)
│   └── Requests.tsx           # Página de solicitudes (/requests)
│
├── services/                   # Servicios API (axios)
│   ├── api.ts                 # Configuración base de axios
│   ├── auth.service.ts        # Autenticación
│   ├── music.service.ts       # Canciones, álbumes, playlists
│   ├── user.service.ts        # Usuarios y comentarios
│   ├── notification.service.ts # Notificaciones
│   └── social.service.ts      # Seguidores y amistad
│
└── types/
    └── index.ts               # Tipos TypeScript del sistema
```

## 🎨 Arquitectura del Layout

### 1. ShellLayout (layouts/ShellLayout.tsx)

**Componente principal** que contiene toda la estructura:

```tsx
<div className="h-screen overflow-hidden">
  {" "}
  {/* Altura completa sin scroll global */}
  <TopNav /> {/* Fija arriba */}
  <div className="flex-1 grid">
    {" "}
    {/* Grid de 3 columnas */}
    <SidebarLeft isOpen={leftOpen} /> {/* Colapsable */}
    <main className="overflow-y-auto">
      {" "}
      {/* Solo esta área tiene scroll */}
      <Outlet /> {/* Páginas dinámicas */}
    </main>
    <SidebarRight isOpen={rightOpen} /> {/* Colapsable */}
  </div>
  <PlayerBar /> {/* Fijo abajo */}
</div>
```

**Claves de Tailwind que aseguran el layout:**

- `h-screen` → Altura completa del viewport (100vh)
- `overflow-hidden` → Previene scroll global
- `flex-1` → Hace que el área central ocupe el espacio disponible
- `overflow-y-auto` → Solo el `<main>` tiene scroll vertical
- `grid` → Sistema de columnas responsivo para sidebars + main

### 2. Estado de Colapso

Gestión con hooks de React:

```tsx
const [leftOpen, setLeftOpen] = useState(true); // 260px ↔ 76px
const [rightOpen, setRightOpen] = useState(true); // 300px ↔ 0px
const [leftMobileOpen, setLeftMobileOpen] = useState(false); // Overlay móvil
```

### 3. Responsive Design

**Mobile (<1024px):**

- Sidebar izquierdo → Overlay absoluto con backdrop (toggle con hamburguesa)
- Sidebar derecho → Completamente oculto
- Solo el área central visible por defecto

**Desktop (≥1024px):**

- Sidebar izquierdo → Sticky colapsable (260px ↔ 76px)
- Sidebar derecho → Visible en xl (≥1024px), colapsable (300px ↔ 0px)
- Grid de 3 columnas funcional

**Breakpoints Tailwind:**

- `sm: 640px` → Small screens
- `md: 768px` → Medium screens
- `lg: 1024px` → Large screens (sidebars funcionales)
- `xl: 1280px` → Extra large (sidebar derecho visible)

## 🔧 Integración con React Router

### En `App.tsx`:

```tsx
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ShellLayout from "./layouts/ShellLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ShellLayout />, // Layout wrapper
    children: [
      // Todas las páginas usan el mismo layout
      { index: true, element: <Home /> },
      { path: "albums", element: <Albums /> },
      { path: "playlists", element: <Playlists /> },
      { path: "profile", element: <Profile /> },
      { path: "notifications", element: <Notifications /> },
      { path: "requests", element: <Requests /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

### En `main.tsx`:

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

## 🎯 Características Implementadas

### TopNav (Barra Superior)

- ✅ Logo y navegación principal con NavLink
- ✅ Active styling automático (bg-neutral-800 en ruta activa)
- ✅ Botones para colapsar sidebars (desktop)
- ✅ Botón hamburguesa (móvil)
- ✅ Buscador global
- ✅ Badge de notificaciones no leídas

### SidebarLeft (Biblioteca)

- ✅ Colapso 260px ↔ 76px (desktop)
- ✅ Overlay con backdrop (móvil)
- ✅ Filtros: Listas, Artistas, Álbumes
- ✅ Lista de playlists recientes
- ✅ Iconos solo cuando está colapsado
- ✅ Scroll interno si contenido es largo

### SidebarRight (Amigos/Cola)

- ✅ Solo visible en xl (≥1024px)
- ✅ Colapso 300px ↔ 0px
- ✅ Lista de amigos en línea con indicador verde
- ✅ Cola de reproducción actual
- ✅ Siguiente en cola

### PlayerBar (Reproductor)

- ✅ Controles: play/pause, skip, shuffle, repeat
- ✅ Barra de progreso con tiempo
- ✅ Información de canción actual
- ✅ Control de volumen
- ✅ Botones: letra, cola, pantalla completa
- ✅ Layout grid de 3 columnas responsivo

### Páginas

- ✅ **Home**: Accesos rápidos + secciones "Hecho para ti" y "Nuevos lanzamientos"
- ✅ **Albums**: Grid de álbumes con filtros por género
- ✅ **Playlists**: Tus playlists + recomendadas, botón crear playlist
- ✅ **Profile**: Banner, avatar, estadísticas, tabs (Popular, Álbumes, Playlists)
- ✅ **Notifications**: Lista de notificaciones con tipos (música, social, comentarios)
- ✅ **Requests**: Solicitudes de amistad (recibidas, enviadas, amigos) + sugerencias

## 🔌 Integración con Backend

### Variables de Entorno

Crea `.env` en la raíz con:

```env
VITE_API_URL=http://localhost:3900/api
VITE_R2_PUBLIC_URL=https://pub-tu-bucket.r2.dev
```

### Servicios API Disponibles

**authService** (`services/auth.service.ts`):

- `register()` - Registro de usuario
- `login()` - Login con JWT
- `logout()` - Cerrar sesión
- `getProfile()` - Perfil actual

**musicService** (`services/music.service.ts`):

- `searchSongs()` - Buscar canciones globales
- `searchMySongs()` - Buscar en mis canciones
- `uploadCompleteSong()` - Subir canción con audio/imagen
- `createAlbum()` - Crear álbum
- `createPlaylist()` - Crear playlist

**userService** (`services/user.service.ts`):

- `searchUsers()` - Buscar usuarios por nick
- `getUserProfile()` - Perfil público
- `updateAvatar()` - Actualizar avatar
- `updateBanner()` - Actualizar banner

**notificationService** (`services/notification.service.ts`):

- `getNotifications()` - Todas las notificaciones
- `markAsRead()` - Marcar como leída
- `markAllAsRead()` - Marcar todas como leídas

**socialService** (`services/social.service.ts`):

- `followUser()` - Seguir usuario
- `sendFriendRequest()` - Enviar solicitud de amistad
- `acceptFriendRequest()` - Aceptar solicitud

## 🎨 Paleta de Colores

```css
/* Fondos */
bg-black          → Negro puro (#000000)
bg-neutral-900    → Gris muy oscuro (panel central)
bg-neutral-950    → Casi negro (sidebars, topbar)
bg-neutral-800    → Gris oscuro (hover, activo)
bg-neutral-700    → Gris medio (placeholders)

/* Acentos */
bg-green-500      → Verde Spotify (botones primarios, play)
bg-purple-500     → Morado (gradientes)
bg-pink-500       → Rosa (gradientes)
bg-blue-500       → Azul (gradientes)

/* Texto */
text-white        → Blanco (#ffffff)
text-neutral-400  → Gris claro (texto secundario)
text-neutral-500  → Gris medio (texto terciario)
```

## 📝 Próximos Pasos

### Pendiente de implementación:

1. **Contexts (Estado Global)**:

   - AuthContext → Usuario autenticado
   - PlayerContext → Estado del reproductor
   - NotificationContext → Notificaciones en tiempo real

2. **Protección de Rutas**:

   - PrivateRoute → Requiere autenticación
   - PublicRoute → Solo no autenticados (login/register)

3. **Páginas de Autenticación**:

   - `/login` → Formulario de login
   - `/register` → Formulario de registro

4. **Reproductor Funcional**:

   - Integrar Web Audio API
   - Gestión de cola de reproducción
   - Controles funcionales (play/pause/skip)

5. **Búsqueda en Tiempo Real**:

   - Debounce en input de búsqueda
   - Resultados instantáneos

6. **Panel de Administración** (opcional):
   - `/admin` → Dashboard admin
   - Gestión de usuarios, contenido, reportes

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (http://localhost:5173)
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linting con ESLint
```

## 📚 Dependencias Principales

- **react** 19.2.0
- **react-dom** 19.2.0
- **react-router-dom** 7.9.6
- **axios** 1.13.2
- **tailwindcss** 4.1.17
- **lucide-react** (iconos)
- **vite** 7.2.4
- **typescript** 5.9.3

## 🎓 Notas Técnicas

### Scroll Behavior

Solo el `<main>` central tiene scroll (`overflow-y-auto`). Los sidebars y barras fijas mantienen su posición:

```tsx
<main className="overflow-y-auto bg-neutral-900">
  <Outlet /> {/* Páginas con contenido scrolleable */}
</main>
```

### Grid Responsivo

El layout usa CSS Grid con columnas dinámicas:

```tsx
// Mobile: 1 columna (solo main)
// Desktop lg: 2 columnas (left + main)
// Desktop xl: 3 columnas (left + main + right)
className =
  "grid grid-cols-1 lg:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr_auto]";
```

### Transiciones Suaves

Todos los elementos colapsables usan:

```tsx
className = "transition-all duration-300"; // Anima cambios de width/height
```

### Overlay Móvil

El sidebar izquierdo en móvil usa posición absoluta con backdrop:

```tsx
{
  isMobileOpen && (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
  );
}
```

---

**¡Layout completo y listo para usar!** 🎉

Puedes empezar a integrar la lógica de negocio, contexts y autenticación sobre esta base sólida.
