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
      setError(
        err.response?.data?.message ||
          err.response?.data?.mensaje ||
          "Error al enviar el reporte"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-md w-full shadow-2xl border border-red-500/20 overflow-hidden">
        {success ? (
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Flag className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              ¡Reporte enviado!
            </h3>
            <p className="text-neutral-400">
              Gracias por ayudarnos a mantener la comunidad segura.
              <br />
              Un moderador revisará tu reporte pronto.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-linear-to-r from-red-600 to-pink-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Flag className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Reportar</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Info */}
              <div className="bg-neutral-800/50 rounded-xl p-4 mb-5 border border-neutral-700/50">
                <p className="text-sm text-neutral-400 mb-1">
                  Estás reportando: <span className="text-neutral-500">xd</span>
                </p>
                <p className="text-base font-semibold text-white">
                  {nombreContenido}
                </p>
                <p className="text-xs text-neutral-500 mt-1 capitalize">
                  Tipo: {tipoContenido}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Motivo */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2.5">
                    Motivo del reporte *
                  </label>
                  <select
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
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
                  <label className="block text-sm font-semibold text-white mb-2.5">
                    Descripción adicional (opcional)
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Proporciona más detalles sobre el reporte..."
                    className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl border border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none resize-none transition-all placeholder:text-neutral-500"
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    {descripcion.length}/1000 caracteres
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar reporte"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
