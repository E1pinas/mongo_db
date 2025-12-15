import { useState, useEffect } from "react";
import type { Cancion, Usuario } from "../../../types";
import { servicioListas } from "../servicios/listasApi";
import { friendshipService } from "../../../services/friendship.service";
import { musicService } from "../../../services/music.service";

interface UseCrearPlaylistParams {
  onPlaylistCreada: () => Promise<void>;
}

interface UseCrearPlaylistResult {
  nombre: string;
  descripcion: string;
  esPublica: boolean;
  esColaborativa: boolean;
  portadaFile: File | null;
  portadaPreview: string;
  cancionesBuscadas: Cancion[];
  selectedSongs: string[];
  searchQuery: string;
  buscando: boolean;
  creando: boolean;
  error: string;
  mensajeExito: string;
  mensajeError: string;
  amigos: Usuario[];
  busquedaAmigo: string;
  cargandoAmigos: boolean;
  invitandoId: string | null;
  invitados: string[];
  amigosSeleccionados: string[];
  setNombre: (nombre: string) => void;
  setDescripcion: (descripcion: string) => void;
  setEsPublica: (publica: boolean) => void;
  setEsColaborativa: (colaborativa: boolean) => void;
  setPortadaFile: (file: File | null) => void;
  setPortadaPreview: (preview: string) => void;
  setSearchQuery: (query: string) => void;
  setError: (error: string) => void;
  setBusquedaAmigo: (busqueda: string) => void;
  toggleAmigoSeleccionado: (amigoId: string) => void;
  manejarInvitar: (amigoId: string, playlistId: string) => Promise<void>;
  manejarCambioPortada: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleCancion: (cancionId: string) => void;
  buscarCanciones: () => Promise<void>;
  resetearFormulario: () => void;
  crearPlaylist: (e: React.FormEvent) => Promise<string | null>;
}

export const useCrearPlaylist = ({
  onPlaylistCreada,
}: UseCrearPlaylistParams): UseCrearPlaylistResult => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esPublica, setEsPublica] = useState(true);
  const [esColaborativa, setEsColaborativa] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState("");
  const [cancionesBuscadas, setCancionesBuscadas] = useState<Cancion[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

  // Estado para amigos
  const [amigos, setAmigos] = useState<Usuario[]>([]);
  const [busquedaAmigo, setBusquedaAmigo] = useState("");
  const [cargandoAmigos, setCargandoAmigos] = useState(false);
  const [invitandoId, setInvitandoId] = useState<string | null>(null);
  const [invitados, setInvitados] = useState<string[]>([]);
  const [amigosSeleccionados, setAmigosSeleccionados] = useState<string[]>([]);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const limpiarExito = () => setMensajeExito("");
  const limpiarError = () => setMensajeError("");

  // Cargar amigos cuando se activa el modo colaborativo
  useEffect(() => {
    const cargarAmigos = async () => {
      if (esColaborativa && amigos.length === 0) {
        setCargandoAmigos(true);
        try {
          const listaAmigos = await friendshipService.getFriends();
          setAmigos(listaAmigos);
        } catch (error) {
          console.error("Error al cargar amigos:", error);
        } finally {
          setCargandoAmigos(false);
        }
      }
    };
    cargarAmigos();
  }, [esColaborativa, amigos.length]);

  const manejarCambioPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      return;
    }

    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
    setError("");
  };

  const buscarCanciones = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    try {
      setBuscando(true);
      console.log("Buscando canciones:", searchQuery);
      const results = await servicioListas.buscarCanciones(searchQuery);
      console.log("Resultados encontrados:", results);
      setCancionesBuscadas(results);
    } catch (err: any) {
      console.error("Error searching songs:", err);
      setError(err.message || "Error al buscar canciones");
    } finally {
      setBuscando(false);
    }
  };

  const toggleCancion = (cancionId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(cancionId)
        ? prev.filter((id) => id !== cancionId)
        : [...prev, cancionId]
    );
  };

  const toggleAmigoSeleccionado = (amigoId: string) => {
    setAmigosSeleccionados((prev) =>
      prev.includes(amigoId)
        ? prev.filter((id) => id !== amigoId)
        : [...prev, amigoId]
    );
  };

  const manejarInvitar = async (amigoId: string, playlistId: string) => {
    setInvitandoId(amigoId);
    try {
      await musicService.inviteCollaborator(playlistId, amigoId);
      setInvitados([...invitados, amigoId]);
      setMensajeExito("Colaborador invitado correctamente");
    } catch (error: any) {
      setMensajeError(error.message || "Error al invitar colaborador");
    } finally {
      setInvitandoId(null);
    }
  };

  const resetearFormulario = () => {
    setNombre("");
    setDescripcion("");
    setEsPublica(true);
    setEsColaborativa(false);
    setPortadaFile(null);
    setPortadaPreview("");
    setSelectedSongs([]);
    setCancionesBuscadas([]);
    setSearchQuery("");
    setError("");
  };

  const crearPlaylist = async (e: React.FormEvent): Promise<string | null> => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El título de la playlist es obligatorio");
      return null;
    }

    try {
      setCreando(true);
      setError("");

      // 1. Subir portada si existe
      let portadaUrl = "";
      if (portadaFile) {
        try {
          const imageData = await servicioListas.subirImagen(portadaFile);
          portadaUrl = imageData.imagenUrl;
        } catch (uploadError: any) {
          setError(
            uploadError.message || "Error al subir la imagen de portada"
          );
          setCreando(false);
          return null;
        }
      }

      // 2. Crear la playlist
      const nuevaPlaylist = await servicioListas.crearPlaylist({
        titulo: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        esPublica,
        esColaborativa,
        portadaUrl: portadaUrl || undefined,
      });

      // 3. Agregar canciones seleccionadas
      if (selectedSongs.length > 0 && nuevaPlaylist._id) {
        await servicioListas.agregarVariasCancionesAPlaylist(
          nuevaPlaylist._id,
          selectedSongs
        );
      }

      // 4. Invitar amigos seleccionados
      if (amigosSeleccionados.length > 0 && nuevaPlaylist._id) {
        for (const amigoId of amigosSeleccionados) {
          try {
            await musicService.inviteCollaborator(nuevaPlaylist._id, amigoId);
          } catch (error) {
            console.error(`Error invitando a ${amigoId}:`, error);
          }
        }
      }

      // Recargar playlists
      await onPlaylistCreada();
      resetearFormulario();

      return nuevaPlaylist._id;
    } catch (err: any) {
      console.error("Error creating playlist:", err);
      setError(err.message || "Error al crear playlist");
      return null;
    } finally {
      setCreando(false);
    }
  };

  return {
    nombre,
    descripcion,
    esPublica,
    esColaborativa,
    portadaFile,
    portadaPreview,
    cancionesBuscadas,
    selectedSongs,
    searchQuery,
    buscando,
    creando,
    error,
    amigos,
    busquedaAmigo,
    cargandoAmigos,
    invitandoId,
    invitados,
    amigosSeleccionados,
    setNombre,
    setDescripcion,
    setEsPublica,
    setEsColaborativa,
    setPortadaFile,
    setPortadaPreview,
    setSearchQuery,
    setError,
    setBusquedaAmigo,
    toggleAmigoSeleccionado,
    manejarInvitar,
    manejarCambioPortada,
    toggleCancion,
    buscarCanciones,
    resetearFormulario,
    crearPlaylist,
    mensajeExito,
    mensajeError,
    limpiarExito,
    limpiarError,
  };
};
