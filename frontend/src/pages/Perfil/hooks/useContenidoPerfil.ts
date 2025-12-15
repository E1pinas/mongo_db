import { useState } from "react";
import { servicioPerfil } from "../servicios";
import type { Cancion, Album, Playlist, Usuario } from "../../../types";
import type { TipoPestaña } from "../tipos";

export const useContenidoPerfil = (
  usuarioPerfilId: string | undefined,
  usuarioPerfil: any = null
) => {
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [albumes, setAlbumes] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [seguidores, setSeguidores] = useState<Usuario[]>([]);
  const [seguidos, setSeguidos] = useState<Usuario[]>([]);
  const [cargandoContenido, setCargandoContenido] = useState(false);

  const cargarContenido = async (pestaña: TipoPestaña) => {
    if (!usuarioPerfilId) return;

    try {
      setCargandoContenido(true);

      switch (pestaña) {
        case "canciones":
          // Usar datos que ya vienen del perfil (ya filtrados por backend)
          if (usuarioPerfil?.misCanciones) {
            setCanciones(usuarioPerfil.misCanciones);
          }
          break;

        case "albumes":
          // Usar datos que ya vienen del perfil (ya filtrados por backend)
          if (usuarioPerfil?.misAlbumes) {
            setAlbumes(usuarioPerfil.misAlbumes);
          }
          break;

        case "playlists":
          // Usar datos que ya vienen del perfil (ya filtrados por backend)
          if (usuarioPerfil?.playlistsCreadas) {
            setPlaylists(usuarioPerfil.playlistsCreadas);
          }
          break;

        case "seguidores":
          const seguidoresData = await servicioPerfil.obtenerSeguidores(
            usuarioPerfilId
          );
          setSeguidores(seguidoresData);
          break;

        case "siguiendo":
          const seguidosData = await servicioPerfil.obtenerSeguidos(
            usuarioPerfilId
          );
          setSeguidos(seguidosData);
          break;

        case "posts":
          // Los posts se cargan directamente en el componente PostFeed
          break;
      }
    } catch (error) {
      console.error("Error al cargar contenido:", error);
    } finally {
      setCargandoContenido(false);
    }
  };

  return {
    canciones,
    albumes,
    playlists,
    seguidores,
    seguidos,
    cargandoContenido,
    cargarContenido,
    setCanciones,
    setAlbumes,
    setPlaylists,
  };
};
