import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const configs = {
    success: {
      icon: CheckCircle,
      bgGradient: "from-green-600/90 to-green-500/90",
      borderColor: "border-green-400/30",
      iconColor: "text-green-300",
    },
    error: {
      icon: XCircle,
      bgGradient: "from-red-600/90 to-red-500/90",
      borderColor: "border-red-400/30",
      iconColor: "text-red-300",
    },
    warning: {
      icon: AlertCircle,
      bgGradient: "from-yellow-600/90 to-yellow-500/90",
      borderColor: "border-yellow-400/30",
      iconColor: "text-yellow-300",
    },
    info: {
      icon: Info,
      bgGradient: "from-blue-600/90 to-blue-500/90",
      borderColor: "border-blue-400/30",
      iconColor: "text-blue-300",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] max-w-md animate-slide-in-right`}
    >
      <div
        className={`bg-gradient-to-r ${config.bgGradient} backdrop-blur-md rounded-xl border ${config.borderColor} shadow-2xl p-4 flex items-start gap-3`}
      >
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <p className="text-white text-sm flex-1 leading-relaxed whitespace-pre-line">
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
