import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../../contexts/PlayerContext";
import type { Playlist } from "../../../types";
import MediaGrid from "../../../components/common/MediaGrid";
import PlaylistCard from "../../../components/musica/PlaylistCard";
import EmptyState from "../../../components/common/EmptyState";
import { servicioListas } from "../servicios/listasApi";

interface ListaPlaylistsProps {
  titulo: string;
  descripcion: string;
  playlists: Playlist[];
  colorGradiente?: string;
  mensajeVacio?: string;
  accionVacia?: () => void;
  labelAccionVacia?: string;
}

export const ListaPlaylists = ({
  titulo,
  descripcion,
  playlists,
  colorGradiente = "from-green-400 to-blue-500",
  mensajeVacio,
  accionVacia,
  labelAccionVacia,
}: ListaPlaylistsProps) => {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();

  const manejarReproducirPlaylist = async (
    playlist: Playlist,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (Array.isArray(playlist.canciones) && playlist.canciones.length > 0) {
      if (typeof playlist.canciones[0] === "string") {
        try {
          const fullPlaylist = await servicioListas.obtenerPlaylistPorId(
            playlist._id
          );
          const songs = fullPlaylist.canciones.filter(
            (c) => typeof c !== "string" && c.titulo
          );
          if (songs.length > 0) {
            playQueue(songs as any[], 0);
          }
        } catch (error) {
          console.error("Error loading playlist:", error);
        }
      } else {
        const songs = playlist.canciones.filter(
          (c) => typeof c !== "string" && c.titulo
        );
        if (songs.length > 0) {
          playQueue(songs as any[], 0);
        }
      }
    }
  };

  const manejarClickPlaylist = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  if (playlists.length === 0 && mensajeVacio) {
    return (
      <EmptyState
        title="Aún no tienes playlists"
        description={mensajeVacio}
        actionLabel={labelAccionVacia}
        onAction={accionVacia}
      />
    );
  }

  if (playlists.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2
          className={`mb-2 bg-linear-to-r ${colorGradiente} bg-clip-text text-3xl font-bold text-transparent`}
        >
          {titulo}
        </h2>
        <p className="text-neutral-400">{descripcion}</p>
      </div>
      <MediaGrid>
        {playlists
          .filter((playlist) => playlist && playlist._id && playlist.titulo)
          .map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onClick={() => manejarClickPlaylist(playlist._id)}
              onPlay={(e) => manejarReproducirPlaylist(playlist, e)}
            />
          ))}
      </MediaGrid>
    </section>
  );
};
