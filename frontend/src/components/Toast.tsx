import { useEffect } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "error",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    error: "bg-red-500/10 border-red-500/50 text-red-400",
    success: "bg-green-500/10 border-green-500/50 text-green-400",
    info: "bg-blue-500/10 border-blue-500/50 text-blue-400",
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div
        className={`${colors[type]} border rounded-lg p-4 shadow-2xl max-w-md flex items-start gap-3 backdrop-blur-sm`}
      >
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <p className="flex-1 text-sm text-white leading-relaxed whitespace-pre-line">
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
