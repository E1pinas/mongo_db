import { useState, useEffect } from "react";
import { X, Music } from "lucide-react";
import type { Cancion } from "../../types";

interface EditSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    titulo: string;
    generos: string[];
    esPrivada: boolean;
    esExplicita: boolean;
  }) => Promise<void>;
  song: Cancion;
}

const GENRES = [
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

/**
 * EditSongModal - Modal para editar información de una canción
 */

export default function EditSongModal({
  isOpen,
  onClose,
  onSave,
  song,
}: EditSongModalProps) {
  const [titulo, setTitulo] = useState(song?.titulo || "");
  const [generos, setGeneros] = useState<string[]>(song?.generos || []);
  const [esPrivada, setEsPrivada] = useState(song?.esPrivada || false);
  const [esExplicita, setEsExplicita] = useState(song?.esExplicita || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && song) {
      setTitulo(song.titulo);
      setGeneros(song.generos || []);
      setEsPrivada(song.esPrivada || false);
      setEsExplicita(song.esExplicita || false);
      setError("");
    }
  }, [isOpen, song]);

  const toggleGenero = (genero: string) => {
    setGeneros((prev) =>
      prev.includes(genero)
        ? prev.filter((g) => g !== genero)
        : [...prev, genero]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError("El título es requerido");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({ titulo, generos, esPrivada, esExplicita });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar la canción");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-neutral-800">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-md border-b border-neutral-800/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Music size={24} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Editar Canción
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-4 py-3 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Título */}
            <div>
              <label className="block text-sm font-bold mb-2 text-neutral-200">
                Título de la canción *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Mi nueva canción"
                className="w-full px-4 py-3.5 bg-neutral-800/50 border-2 border-neutral-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-neutral-500"
                disabled={saving}
                required
              />
            </div>

            {/* Géneros */}
            <div>
              <label className="block text-sm font-bold mb-3 text-neutral-200">
                Géneros
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genero) => (
                  <button
                    key={genero}
                    type="button"
                    onClick={() => toggleGenero(genero)}
                    disabled={saving}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      generos.includes(genero)
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-neutral-800/70 text-neutral-300 hover:bg-neutral-700 hover:scale-105"
                    }`}
                  >
                    {genero.charAt(0).toUpperCase() + genero.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones */}
            <div className="space-y-3 p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/30 transition-colors">
                <input
                  type="checkbox"
                  id="esPrivada"
                  checked={esPrivada}
                  onChange={(e) => setEsPrivada(e.target.checked)}
                  className="w-5 h-5 rounded accent-purple-500"
                />
                <label
                  htmlFor="esPrivada"
                  className="text-sm cursor-pointer flex-1"
                >
                  <span className="font-semibold text-white">
                    Canción privada
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Solo tú podrás verla y reproducirla
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-700/30 transition-colors">
                <input
                  type="checkbox"
                  id="esExplicita"
                  checked={esExplicita}
                  onChange={(e) => setEsExplicita(e.target.checked)}
                  className="w-5 h-5 rounded accent-red-500"
                />
                <label
                  htmlFor="esExplicita"
                  className="text-sm cursor-pointer flex-1"
                >
                  <span className="font-semibold text-white">
                    Contenido explícito
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Marca si contiene lenguaje o temas explícitos
                  </p>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Botones fijos */}
        <div className="sticky bottom-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 p-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || !titulo.trim()}
              className="flex-1 px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
