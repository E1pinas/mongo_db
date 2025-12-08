# Guía de Uso de Componentes Reutilizables

## 🎨 Ejemplos Prácticos

### Ejemplo 1: Página de Álbumes

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { musicService } from "../services/music.service";
import {
  LoadingSpinner,
  EmptyState,
  SectionHeader,
  MediaGrid,
} from "../components/common";
import { AlbumCard } from "../components/musica";
import type { Album } from "../types";

export default function Albums() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await musicService.getMyAlbums();
      setAlbums(data);
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando álbumes..." />;

  if (albums.length === 0) {
    return (
      <EmptyState
        title="No tienes álbumes"
        description="Crea tu primer álbum"
        actionLabel="Crear Álbum"
        actionHref="/create-album"
      />
    );
  }

  return (
    <div className="p-6">
      <SectionHeader
        title="Mis Álbumes"
        action={{
          label: "Crear álbum",
          onClick: () => navigate("/create-album"),
        }}
      />

      <MediaGrid columns={5}>
        {albums.map((album) => (
          <AlbumCard
            key={album._id}
            album={album}
            onClick={() => navigate(`/album/${album._id}`)}
            onPlay={(e) => {
              e.stopPropagation();
              // Reproducir álbum
            }}
          />
        ))}
      </MediaGrid>
    </div>
  );
}
```

### Ejemplo 2: Lista de Canciones Favoritas

```tsx
import { useState, useEffect } from "react";
import { musicService } from "../services/music.service";
import { usePlayer } from "../contexts/PlayerContext";
import { useAuth } from "../contexts";
import {
  LoadingSpinner,
  EmptyState,
  SectionHeader,
  Button,
} from "../components/common";
import { SongListItem } from "../components/musica";
import type { Cancion } from "../types";

export default function LikedSongs() {
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const [songs, setSongs] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLikedSongs = async () => {
    try {
      setLoading(true);
      const data = await musicService.getLikedSongs();
      setSongs(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await musicService.toggleLike(songId);
    loadLikedSongs(); // Recargar
  };

  const isLiked = (song: Cancion) =>
    user ? song.likes?.includes(user._id) : false;

  if (loading) return <LoadingSpinner />;

  if (songs.length === 0) {
    return (
      <EmptyState
        title="No tienes canciones favoritas"
        description="Dale me gusta a tus canciones favoritas"
      />
    );
  }

  return (
    <div className="p-6">
      <SectionHeader
        title="Canciones que te gustan"
        rightElement={
          <Button onClick={() => playQueue(songs, 0)}>Reproducir todo</Button>
        }
      />

      <div className="space-y-2">
        {songs.map((song, index) => (
          <SongListItem
            key={song._id}
            song={song}
            index={index}
            isLiked={isLiked(song)}
            onPlay={() => playQueue(songs, index)}
            onToggleLike={(e) => handleToggleLike(song._id, e)}
            showCommentButton={false}
          />
        ))}
      </div>
    </div>
  );
}
```

### Ejemplo 3: Búsqueda con Resultados

```tsx
import { useState } from "react";
import { Search } from "lucide-react";
import { musicService } from "../services/music.service";
import {
  LoadingSpinner,
  EmptyState,
  MediaGrid,
  Button,
} from "../components/common";
import { SongListItem, PlaylistCard, AlbumCard } from "../components/musica";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const data = await musicService.search(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">Buscar</h1>

      {/* Barra de búsqueda */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="¿Qué quieres escuchar?"
            className="w-full pl-12 pr-4 py-3 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
        <Button onClick={handleSearch} isLoading={loading}>
          Buscar
        </Button>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && !results && (
        <EmptyState
          title="Busca música"
          description="Encuentra canciones, álbumes y playlists"
        />
      )}

      {!loading && results && (
        <>
          {/* Canciones */}
          {results.songs?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Canciones</h2>
              <div className="space-y-2">
                {results.songs.slice(0, 5).map((song, index) => (
                  <SongListItem
                    key={song._id}
                    song={song}
                    index={index}
                    {...songProps}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Álbumes */}
          {results.albums?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Álbumes</h2>
              <MediaGrid columns={5}>
                {results.albums.map((album) => (
                  <AlbumCard key={album._id} album={album} {...albumProps} />
                ))}
              </MediaGrid>
            </section>
          )}

          {/* Playlists */}
          {results.playlists?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Playlists</h2>
              <MediaGrid columns={5}>
                {results.playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist._id}
                    playlist={playlist}
                    {...playlistProps}
                  />
                ))}
              </MediaGrid>
            </section>
          )}
        </>
      )}
    </div>
  );
}
```

## 💡 Tips de Uso

### 1. Combinar componentes

```tsx
<MediaGrid columns={6}>
  {loading ? (
    <LoadingSpinner />
  ) : items.length === 0 ? (
    <EmptyState title="No hay contenido" />
  ) : (
    items.map((item) => <Card key={item.id} {...item} />)
  )}
</MediaGrid>
```

### 2. Usar variantes de Button

```tsx
<div className="flex gap-2">
  <Button variant="primary">Guardar</Button>
  <Button variant="secondary">Cancelar</Button>
  <Button variant="ghost">Ver más</Button>
  <Button variant="danger">Eliminar</Button>
</div>
```

### 3. Estados de carga

```tsx
<Button isLoading={saving} onClick={handleSave}>
  Guardar cambios
</Button>
```

### 4. Grids responsivos

```tsx
{
  /* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */
}
<MediaGrid columns={4}>
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</MediaGrid>;
```

## 🎯 Mejores Prácticas

1. **No duplicar componentes**: Si necesitas el mismo diseño, usa el componente existente
2. **Props opcionales**: Usa props opcionales para flexibilidad
3. **Composición**: Combina componentes pequeños para crear interfaces complejas
4. **Consistencia**: Usa siempre los mismos componentes para las mismas funcionalidades
5. **Tipado**: Siempre tipea las props de tus componentes
