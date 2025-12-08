import { useState } from "react";
import { X, Flag, AlertTriangle } from "lucide-react";
import { reporteService } from "../../services/reporte.service";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoContenido: "cancion" | "album" | "playlist" | "usuario" | "comentario";
  contenidoId: string;
  nombreContenido: string;
}

const MOTIVOS = [
  { value: "spam", label: "Spam o publicidad no deseada" },
  { value: "contenido_inapropiado", label: "Contenido inapropiado u ofensivo" },
  { value: "derechos_autor", label: "Violación de derechos de autor" },
  { value: "incitacion_odio", label: "Incitación al odio o violencia" },
  { value: "acoso", label: "Acoso o intimidación" },
  { value: "informacion_falsa", label: "Información falsa o engañosa" },
  { value: "otro", label: "Otro motivo" },
];

export const ReportModal = ({
  isOpen,
  onClose,
  tipoContenido,
  contenidoId,
  nombreContenido,
}: ReportModalProps) => {
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo) {
      setError("Debes seleccionar un motivo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await reporteService.crearReporte({
        tipoContenido,
        contenidoId,
        motivo,
        descripcion: descripcion.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMotivo("");
        setDescripcion("");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || "Error al enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white">Reportar</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Reporte enviado
            </h3>
            <p className="text-gray-400">
              Gracias por tu reporte. Será revisado por un moderador.
            </p>
          </div>
        ) : (
          <>
            {/* Info */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300">
                Estás reportando:{" "}
                <span className="font-semibold text-white">
                  {nombreContenido}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tipo: {tipoContenido}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motivo del reporte *
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  {MOTIVOS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción adicional (opcional)
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Proporciona más detalles sobre el reporte..."
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {descripcion.length}/1000 caracteres
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar reporte"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
