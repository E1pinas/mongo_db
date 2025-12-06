import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { musicService } from "../services/music.service";

const GENEROS = [
  "rock",
  "pop",
  "jazz",
  "electronic",
  "hiphop",
  "classical",
  "reggaeton",
  "indie",
  "latino",
  "urbano",
];

export default function UploadSong() {
  const navigate = useNavigate();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    generos: [] as string[],
    esPrivada: false,
    esExplicita: false,
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [portadaPreview, setPortadaPreview] = useState<string>("");
  const [duracionSegundos, setDuracionSegundos] = useState(0);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("audio/")) {
      setError("Por favor selecciona un archivo de audio válido");
      return;
    }

    // Validar tamaño (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("El archivo de audio no debe superar los 50MB");
      return;
    }

    setAudioFile(file);
    setError("");

    // Crear preview y obtener duración
    const url = URL.createObjectURL(file);
    setAudioPreview(url);

    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setDuracionSegundos(Math.floor(audio.duration));
    });
  };

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La portada no debe superar los 5MB");
      return;
    }

    setPortadaFile(file);
    setError("");

    // Crear preview
    const url = URL.createObjectURL(file);
    setPortadaPreview(url);
  };

  const handleGenreToggle = (genero: string) => {
    setFormData((prev) => ({
      ...prev,
      generos: prev.generos.includes(genero)
        ? prev.generos.filter((g) => g !== genero)
        : [...prev.generos, genero],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!formData.titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }

    if (!audioFile) {
      setError("Debes seleccionar un archivo de audio");
      return;
    }

    if (duracionSegundos === 0) {
      setError("No se pudo obtener la duración del audio");
      return;
    }

    setUploading(true);

    try {
      // Subir canción completa
      const cancion = await musicService.uploadCompleteSong({
        audio: audioFile,
        portada: portadaFile || undefined,
        titulo: formData.titulo.trim(),
        duracionSegundos,
        generos: formData.generos.join(","),
        esPrivada: formData.esPrivada,
        esExplicita: formData.esExplicita,
      });

      console.log("Canción subida:", cancion);
      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      console.error("Error al subir canción:", err);
      setError(err.message || "Error al subir la canción");
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subir Canción</h1>
        <p className="text-neutral-400">Comparte tu música con el mundo</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
          <p className="text-green-400 font-semibold">
            ✓ Canción subida correctamente
          </p>
          <p className="text-sm text-neutral-300 mt-1">Redirigiendo...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Archivo de Audio */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Archivo de Audio <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => audioInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-500 transition-colors"
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="hidden"
            />
            {audioFile ? (
              <div>
                <p className="text-green-400 font-semibold mb-2">
                  ✓ {audioFile.name}
                </p>
                <p className="text-sm text-neutral-400">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {duracionSegundos > 0 && (
                  <p className="text-sm text-neutral-400 mt-1">
                    Duración: {formatDuration(duracionSegundos)}
                  </p>
                )}
                {audioPreview && (
                  <audio
                    ref={audioRef}
                    src={audioPreview}
                    controls
                    className="mt-4 w-full max-w-md mx-auto"
                  />
                )}
              </div>
            ) : (
              <div>
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                <p className="text-neutral-300 font-semibold">
                  Click para seleccionar un archivo de audio
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  MP3, WAV, FLAC, AAC, OGG (Máx. 50MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Portada (opcional) */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Portada (opcional)
          </label>
          <div className="flex items-start gap-4">
            <div
              onClick={() => portadaInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 rounded-lg p-4 cursor-pointer hover:border-neutral-500 transition-colors flex-1"
            >
              <input
                ref={portadaInputRef}
                type="file"
                accept="image/*"
                onChange={handlePortadaChange}
                className="hidden"
              />
              {portadaFile ? (
                <div className="flex items-center gap-4">
                  {portadaPreview && (
                    <img
                      src={portadaPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-green-400 font-semibold">
                      ✓ {portadaFile.name}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {(portadaFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className="w-8 h-8 mx-auto mb-2 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-neutral-300">
                    Click para subir imagen
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    JPG, PNG, WebP (Máx. 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
            placeholder="Nombre de tu canción"
            className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
            maxLength={150}
          />
        </div>

        {/* Géneros */}
        <div>
          <label className="block text-sm font-semibold mb-3">Géneros</label>
          <div className="flex flex-wrap gap-2">
            {GENEROS.map((genero) => (
              <button
                key={genero}
                type="button"
                onClick={() => handleGenreToggle(genero)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.generos.includes(genero)
                    ? "bg-blue-500 text-white"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {genero}
              </button>
            ))}
          </div>
        </div>

        {/* Opciones */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.esPrivada}
              onChange={(e) =>
                setFormData({ ...formData, esPrivada: e.target.checked })
              }
              className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 focus:ring-blue-400"
            />
            <div>
              <span className="font-semibold">Canción Privada</span>
              <p className="text-sm text-neutral-400">
                Solo tú podrás ver y reproducir esta canción
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.esExplicita}
              onChange={(e) =>
                setFormData({ ...formData, esExplicita: e.target.checked })
              }
              className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 focus:ring-blue-400"
            />
            <div>
              <span className="font-semibold">Contenido Explícito</span>
              <p className="text-sm text-neutral-400">
                Marca si contiene lenguaje o temas para adultos (+18)
              </p>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={uploading}
            className="px-6 py-3 rounded-lg font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={uploading || !audioFile || !formData.titulo.trim()}
            className="flex-1 px-6 py-3 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Subiendo..." : "Subir Canción"}
          </button>
        </div>
      </form>
    </div>
  );
}
