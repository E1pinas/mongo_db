import { useState, useEffect } from "react";
import { musicService } from "../../../services/music.service";
import { albumService } from "../../../services/album.service";
import { playlistService } from "../../../services/playlist.service";
import { followerService } from "../../../services/follower.service";
import type { DatosInicio, EstadoCarga } from "../tipos";
import type { Cancion, Usuario } from "../../../types";

export const useDatosInicio = () => {
  const [datos, setDatos] = useState<DatosInicio>({
    misCanciones: [],
    albumesRecientes: [],
    playlistsPopulares: [],
    usuariosSugeridos: [],
  });
  const [estado, setEstado] = useState<EstadoCarga>({
    cargando: true,
    error: "",
  });

  useEffect(() => {
    cargarDatos();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cargarDatos();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const cargarDatos = async () => {
    try {
      setEstado({ cargando: true, error: "" });
      await Promise.all([
        cargarMisCanciones(),
        cargarAlbumesRecientes(),
        cargarPlaylistsPopulares(),
        cargarUsuariosSugeridos(),
      ]);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setEstado({
        cargando: false,
        error: err.message || "Error al cargar contenido",
      });
    } finally {
      setEstado((prev) => ({ ...prev, cargando: false }));
    }
  };

  const cargarMisCanciones = async () => {
    try {
      const canciones = await musicService.getMySongs();
      setDatos((prev) => ({ ...prev, misCanciones: canciones }));
    } catch (err: any) {
      console.error("Error loading songs:", err);
    }
  };

  const cargarAlbumesRecientes = async () => {
    try {
      const albums = await albumService.getPublicAlbums();
      setDatos((prev) => ({ ...prev, albumesRecientes: albums.slice(0, 6) }));
    } catch (err: any) {
      console.error("Error loading albums:", err);
    }
  };

  const cargarPlaylistsPopulares = async () => {
    try {
      const playlists = await playlistService.getPublicPlaylists();
      const sorted = playlists
        .sort(
          (a, b) => (b.seguidores?.length || 0) - (a.seguidores?.length || 0)
        )
        .slice(0, 6);
      setDatos((prev) => ({ ...prev, playlistsPopulares: sorted }));
    } catch (err: any) {
      console.error("Error loading playlists:", err);
    }
  };

  const cargarUsuariosSugeridos = async () => {
    try {
      const usuarios = await followerService.getSuggestedUsers();
      setDatos((prev) => ({
        ...prev,
        usuariosSugeridos: usuarios.slice(0, 6),
      }));
    } catch (err: any) {
      console.error("Error loading suggested users:", err);
    }
  };

  return {
    ...datos,
    ...estado,
    setMisCanciones: (canciones: Cancion[]) =>
      setDatos((prev) => ({ ...prev, misCanciones: canciones })),
    setUsuariosSugeridos: (fn: (prev: Usuario[]) => Usuario[]) =>
      setDatos((prev) => ({
        ...prev,
        usuariosSugeridos: fn(prev.usuariosSugeridos),
      })),
  };
};
