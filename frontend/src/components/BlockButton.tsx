import { useState, useEffect } from "react";
import { Ban, Unlock } from "lucide-react";
import { bloqueoService } from "../services/bloqueo.service";

interface BlockButtonProps {
  usuarioId: string;
  className?: string;
  onBlockChange?: (bloqueado: boolean) => void;
}

export default function BlockButton({
  usuarioId,
  className = "",
  onBlockChange,
}: BlockButtonProps) {
  const [bloqueado, setBloqueado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [razonBloqueo, setRazonBloqueo] = useState("");

  useEffect(() => {
    verificarEstadoBloqueo();
  }, [usuarioId]);

  const verificarEstadoBloqueo = async () => {
    try {
      setLoading(true);
      const estado = await bloqueoService.verificarBloqueo(usuarioId);
      setBloqueado(estado.yoBloqueo);
    } catch (error: any) {
      console.error("Error al verificar bloqueo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBloquear = async () => {
    try {
      setActionLoading(true);
      await bloqueoService.bloquearUsuario(
        usuarioId,
        razonBloqueo.trim() || undefined
      );
      setBloqueado(true);
      setShowConfirm(false);
      setRazonBloqueo("");
      onBlockChange?.(true);
    } catch (error: any) {
      console.error("Error al bloquear:", error);
      alert(error.response?.data?.mensaje || "Error al bloquear usuario");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDesbloquear = async () => {
    try {
      setActionLoading(true);
      await bloqueoService.desbloquearUsuario(usuarioId);
      setBloqueado(false);
      onBlockChange?.(false);
    } catch (error: any) {
      console.error("Error al desbloquear:", error);
      alert(error.response?.data?.mensaje || "Error al desbloquear usuario");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (bloqueado) {
    // Usuario está bloqueado - mostrar botón de desbloquear
    return (
      <button
        onClick={handleDesbloquear}
        disabled={actionLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Unlock size={18} />
        {actionLoading ? "Desbloqueando..." : "Desbloqueado"}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={actionLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Ban size={18} />
        Bloquear
      </button>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">¿Bloquear usuario?</h3>
            <div className="space-y-3 mb-6 text-sm text-neutral-300">
              <p>Al bloquear a este usuario:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>No podrá ver tu perfil</li>
                <li>No podrá encontrarte en búsquedas</li>
                <li>Se eliminarán las relaciones de amistad y seguimiento</li>
                <li>No podrá interactuar contigo</li>
              </ul>
            </div>

            {/* Campo de razón */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Razón del bloqueo (opcional)
              </label>
              <textarea
                value={razonBloqueo}
                onChange={(e) => setRazonBloqueo(e.target.value)}
                placeholder="Ej: Spam, acoso, contenido inapropiado..."
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {razonBloqueo.length}/200 caracteres
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBloquear}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Bloqueando..." : "Sí, bloquear"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
