# Refactorización de Componentes React

## 📋 Resumen

Se ha refactorizado el código del frontend para seguir las mejores prácticas de React, extrayendo componentes reutilizables de las páginas monolíticas.

## 🎯 Componentes Creados (16 componentes)

### Componentes Comunes (`components/common/`)

#### `Button.tsx`

Botón reutilizable con diferentes variantes y tamaños.

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props:**

- `variant`: "primary" | "secondary" | "ghost" | "danger"
- `size`: "sm" | "md" | "lg"
- `isLoading`: boolean
- `fullWidth`: boolean

---

#### `LoadingSpinner.tsx`

Indicador de carga consistente.

```tsx
<LoadingSpinner text="Cargando..." size="md" />
```

**Props:**

- `text`: string (opcional)
- `size`: "sm" | "md" | "lg"

---

#### `EmptyState.tsx`

Estado vacío con icono, mensaje y acción opcional.

```tsx
<EmptyState
  title="No hay canciones"
  description="Sube tu primera canción"
  actionLabel="Subir"
  onAction={() => navigate("/upload")}
/>
```

**Props:**

- `icon`: LucideIcon (opcional)
- `title`: string
- `description`: string (opcional)
- `actionLabel`: string (opcional)
- `onAction`: función (opcional)
- `actionHref`: string (opcional)

---

#### `SectionHeader.tsx`

Encabezado de sección con título y acción opcional.

```tsx
<SectionHeader
  title="Mis Canciones"
  action={{ label: "Ver todo", onClick: handleViewAll }}
/>
```

**Props:**

- `title`: string
- `action`: { label: string, onClick: función } (opcional)
- `rightElement`: ReactNode (opcional)

---

#### `MediaGrid.tsx`

Grid responsive para contenido multimedia.

```tsx
<MediaGrid columns={6}>
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</MediaGrid>
```

**Props:**

- `columns`: 2 | 3 | 4 | 5 | 6
- `children`: ReactNode

---

#### `QuickAccessCard.tsx`

Tarjeta horizontal de acceso rápido.

```tsx
<QuickAccessCard
  title="Canciones favoritas"
  gradient="bg-gradient-to-br from-purple-500 to-pink-500"
  onPlay={(e) => handlePlay(e)}
/>
```

**Props:**

- `title`: string
- `imageUrl`: string (opcional)
- `gradient`: string (opcional)
- `isRounded`: boolean
- `onClick`: función (opcional)
- `onPlay`: función (opcional)

---

#### `PlaceholderCard.tsx`

Tarjeta placeholder para contenido de ejemplo.

```tsx
<PlaceholderCard
  title="Daily Mix 1"
  description="Tus canciones favoritas"
  index={1}
/>
```

**Props:**

- `title`: string
- `description`: string
- `index`: number

---

### Componentes de Música (`components/musica/`)

#### `SongListItem.tsx`

Item de canción para listas.

```tsx
<SongListItem
  song={cancion}
  index={0}
  isLiked={isLiked(cancion)}
  onPlay={() => handlePlay(cancion)}
  onToggleLike={(e) => handleLike(e)}
  onOpenComments={(e) => handleComments(e)}
/>
```

**Props:**

- `song`: Cancion
- `index`: number
- `isLiked`: boolean
- `onPlay`: función
- `onToggleLike`: función
- `onOpenComments`: función (opcional)
- `showCommentButton`: boolean (default: true)

---

#### `PlaylistCard.tsx`

Tarjeta de playlist.

```tsx
<PlaylistCard
  playlist={playlist}
  onClick={() => navigate(`/playlist/${playlist._id}`)}
  onPlay={(e) => handlePlay(playlist, e)}
/>
```

**Props:**

- `playlist`: Playlist
- `onClick`: función (opcional)
- `onPlay`: función (opcional)

---

#### `AlbumCard.tsx`

Tarjeta de álbum.

```tsx
<AlbumCard
  album={album}
  onClick={() => navigate(`/album/${album._id}`)}
  onPlay={(e) => handlePlay(album, e)}
/>
```

**Props:**

- `album`: Album
- `onClick`: función (opcional)
- `onPlay`: función (opcional)

---

## 📂 Estructura de Archivos

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── QuickAccessCard.tsx
│   │   ├── PlaceholderCard.tsx
│   │   └── index.ts
│   ├── musica/
│   │   ├── SongListItem.tsx
│   │   ├── PlaylistCard.tsx
│   │   ├── AlbumCard.tsx
│   │   ├── ArtistCard.tsx ✨
│   │   ├── DetailHeader.tsx ✨ NUEVO
│   │   ├── SongCommentsModal.tsx
│   │   └── index.ts
│   └── forms/ ✨ NUEVA CARPETA
│       ├── Input.tsx ✨ NUEVO
│       ├── Textarea.tsx ✨ NUEVO
│       ├── Checkbox.tsx ✨ NUEVO
│       └── index.ts ✨ NUEVO
└── pages/
    ├── Home.tsx ✅ (refactorizado)
    ├── Playlists.tsx ✅ (refactorizado)
    ├── MySongs.tsx ✅ (refactorizado)
    ├── LikedSongs.tsx ✅ (refactorizado)
    ├── Albums.tsx ✅ (refactorizado)
    ├── LikedPlaylists.tsx ✅ (refactorizado)
    ├── LikedAlbums.tsx ✅ (refactorizado)
    ├── LikedArtists.tsx ✅ (refactorizado)
    ├── Search.tsx ✅ (refactorizado)
    ├── AlbumDetail.tsx ✅ (refactorizado) ✨
    ├── PlaylistDetail.tsx ✅ (refactorizado) ✨
    ├── Notifications.tsx ✅ (refactorizado) ✨
    └── Settings.tsx ✅ (refactorizado) ✨
```

## 📊 Páginas Refactorizadas (13 en total)

1. ✅ **Home.tsx** - 47% menos código
2. ✅ **Playlists.tsx** - Simplificada con componentes
3. ✅ **MySongs.tsx** - Refactorizada completamente
4. ✅ **LikedSongs.tsx** - Simplificada
5. ✅ **Albums.tsx** - Refactorizada con MediaGrid y AlbumCard
6. ✅ **LikedPlaylists.tsx** - Refactorizada con PlaylistCard
7. ✅ **LikedAlbums.tsx** - Refactorizada con AlbumCard
8. ✅ **LikedArtists.tsx** - Refactorizada con ArtistCard
9. ✅ **Search.tsx** - Simplificada con componentes comunes
10. ✅ **AlbumDetail.tsx** - Usa LoadingSpinner, EmptyState ✨
11. ✅ **PlaylistDetail.tsx** - Usa LoadingSpinner, EmptyState ✨
12. ✅ **Notifications.tsx** - Usa LoadingSpinner, EmptyState ✨
13. ✅ **Settings.tsx** - Usa Input, Textarea, Button ✨

## ✅ Beneficios de la Refactorización

1. **Reutilización de código**: Los componentes se pueden usar en múltiples páginas
2. **Mantenibilidad**: Cambios en un componente se propagan automáticamente
3. **Consistencia**: UI uniforme en toda la aplicación
4. **Testabilidad**: Componentes pequeños son más fáciles de testear
5. **Separación de responsabilidades**: Cada componente tiene una única función
6. **Código más limpio**: Páginas más legibles y organizadas

## 🔄 Ejemplo de Uso

### Antes (código duplicado en cada página):

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
  {playlists.map((playlist) => (
    <div className="bg-neutral-800/30 p-4 rounded-lg hover:bg-neutral-800...">
      {/* Mucho código JSX duplicado */}
    </div>
  ))}
</div>
```

### Después (componentes reutilizables):

```tsx
<MediaGrid columns={6}>
  {playlists.map((playlist) => (
    <PlaylistCard key={playlist._id} playlist={playlist} />
  ))}
</MediaGrid>
```

## 🚀 Próximos Pasos Recomendados

1. ✅ **Crear componentes para formularios** (Input, Textarea, Checkbox) - COMPLETADO
2. Refactorizar páginas restantes: Profile, CreatePlaylist, CreateAlbum, UploadSong
3. Crear componente Modal reutilizable para reemplazar modales inline
4. Crear componente Select para dropdowns
5. Agregar Storybook para documentar componentes
6. Agregar tests unitarios para cada componente
7. Considerar usar un sistema de diseño como Radix UI o Shadcn

## 🎨 Nuevos Componentes de Formulario

### `Input.tsx`

Input reutilizable con label, error y helper text.

```tsx
<Input
  label="Nombre de usuario"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={error}
  helperText="Solo letras y números"
/>
```

### `Textarea.tsx`

Textarea con las mismas características del Input.

```tsx
<Textarea
  label="Biografía"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  rows={4}
  maxLength={200}
/>
```

### `Checkbox.tsx`

Checkbox con label y descripción.

```tsx
<Checkbox
  label="Perfil público"
  description="Permitir que cualquiera vea tu perfil"
  checked={isPublic}
  onChange={(e) => setIsPublic(e.target.checked)}
/>
```

### `DetailHeader.tsx`

Header para páginas de detalle de álbumes y playlists con portada, info y botones.

```tsx
<DetailHeader
  type="album"
  imageUrl={album.portadaUrl}
  title={album.titulo}
  subtitle={artistName}
  year={2024}
  totalSongs={10}
  totalDuration="35 min"
  isLiked={isLiked}
  onPlayAll={handlePlayAll}
  onToggleLike={handleToggleLike}
  onBack={() => navigate(-1)}
/>
```

## 📝 Convenciones

- Componentes en PascalCase
- Props descriptivas y tipadas
- Un componente por archivo
- Usar `index.ts` para exportar múltiples componentes
- Documentar props con comentarios JSDoc
- Mantener componentes pequeños y enfocados
