import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Cancion } from "../../../types";
import { servicioAlbumes } from "../servicios/albumesApi";

interface UseCrearAlbumParams {
  onAlbumCreado: () => Promise<void>;
}

interface UseCrearAlbumResult {
  // Estados del formulario
  titulo: string;
  descripcion: string;
  generos: string[];
  fechaLanzamiento: string;
  esPrivado: boolean;
  portadaFile: File | null;
  portadaPreview: string;
  selectedSongs: string[];

  // Estados de búsqueda
  cancionesBuscadas: Cancion[];
  searchQuery: string;
  buscando: boolean;

  // Estados de creación
  creando: boolean;
  error: string;

  // Acciones
  setTitulo: (titulo: string) => void;
  setDescripcion: (descripcion: string) => void;
  setGeneros: (generos: string[]) => void;
  setFechaLanzamiento: (fecha: string) => void;
  setEsPrivado: (privado: boolean) => void;
  setPortadaFile: (file: File | null) => void;
  setPortadaPreview: (preview: string) => void;
  setSelectedSongs: (songs: string[]) => void;
  setError: (error: string) => void;

  manejarCambioPortada: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleGenero: (genero: string) => void;
  toggleCancion: (cancionId: string) => void;
  buscarCanciones: (query: string) => Promise<void>;
  resetearFormulario: () => void;
  crearAlbum: (e: React.FormEvent) => Promise<void>;
}

export const useCrearAlbum = ({
  onAlbumCreado,
}: UseCrearAlbumParams): UseCrearAlbumResult => {
  const navigate = useNavigate();

  // Estados del formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [generos, setGeneros] = useState<string[]>([]);
  const [fechaLanzamiento, setFechaLanzamiento] = useState("");
  const [esPrivado, setEsPrivado] = useState(false);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

  // Estados de búsqueda
  const [cancionesBuscadas, setCancionesBuscadas] = useState<Cancion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [buscando, setBuscando] = useState(false);

  // Estados de creación
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

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

  const toggleGenero = (genero: string) => {
    setGeneros((prev) =>
      prev.includes(genero)
        ? prev.filter((g) => g !== genero)
        : [...prev, genero]
    );
  };

  const toggleCancion = (cancionId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(cancionId)
        ? prev.filter((id) => id !== cancionId)
        : [...prev, cancionId]
    );
  };

  const buscarCanciones = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setCancionesBuscadas([]);
      return;
    }

    try {
      setBuscando(true);
      const resultados = await servicioAlbumes.buscarMisCanciones(query);
      setCancionesBuscadas(resultados);
    } catch (err) {
      console.error("Error al buscar canciones:", err);
    } finally {
      setBuscando(false);
    }
  };

  const resetearFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setGeneros([]);
    setFechaLanzamiento("");
    setEsPrivado(false);
    setPortadaFile(null);
    setPortadaPreview("");
    setSelectedSongs([]);
    setCancionesBuscadas([]);
    setSearchQuery("");
    setError("");
  };

  const crearAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }

    try {
      setCreando(true);

      // 1. Subir portada si existe
      let portadaUrl = "";
      if (portadaFile) {
        try {
          const imageData = await servicioAlbumes.subirImagen(portadaFile);
          portadaUrl = imageData.imagenUrl;
        } catch (uploadError: any) {
          setError(`Error al subir la imagen: ${uploadError.message}`);
          setCreando(false);
          return;
        }
      }

      // 2. Crear álbum
      const datosAlbum = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        portadaUrl: portadaUrl,
        generos: generos,
        fechaLanzamiento: fechaLanzamiento || undefined,
        esPrivado: esPrivado,
      };

      const nuevoAlbum = await servicioAlbumes.crearAlbum(datosAlbum);

      // 3. Agregar canciones seleccionadas
      await servicioAlbumes.agregarVariasCancionesAlAlbum(
        nuevoAlbum._id,
        selectedSongs
      );

      // Recargar álbumes
      await onAlbumCreado();
      resetearFormulario();

      // Navegar al álbum creado
      navigate(`/album/${nuevoAlbum._id}`);
    } catch (err: any) {
      console.error("Error al crear álbum:", err);
      setError(err.message || "Error al crear el álbum");
    } finally {
      setCreando(false);
    }
  };

  return {
    // Estados del formulario
    titulo,
    descripcion,
    generos,
    fechaLanzamiento,
    esPrivado,
    portadaFile,
    portadaPreview,
    selectedSongs,

    // Estados de búsqueda
    cancionesBuscadas,
    searchQuery,
    buscando,

    // Estados de creación
    creando,
    error,

    // Acciones
    setTitulo,
    setDescripcion,
    setGeneros,
    setFechaLanzamiento,
    setEsPrivado,
    setPortadaFile,
    setPortadaPreview,
    setSelectedSongs,
    setError,

    manejarCambioPortada,
    toggleGenero,
    toggleCancion,
    buscarCanciones,
    resetearFormulario,
    crearAlbum,
  };
};
