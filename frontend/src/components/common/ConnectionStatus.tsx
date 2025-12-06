import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConnectionStatusProps {
  isOnline?: boolean;
  lastConnection?: string;
  showTime?: boolean;
}

export default function ConnectionStatus({
  isOnline,
  lastConnection,
  showTime = true,
}: ConnectionStatusProps) {
  const getTimeAgo = () => {
    if (!lastConnection) return "";

    try {
      const time = formatDistanceToNow(new Date(lastConnection), {
        addSuffix: true,
        locale: es,
      });
      return time;
    } catch {
      return "";
    }
  };

  if (isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-green-400">En línea</span>
      </div>
    );
  }

  if (!showTime || !lastConnection) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-gray-500 rounded-full" />
        <span className="text-gray-400">Desconectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-2 h-2 bg-gray-500 rounded-full" />
      <span className="text-gray-400">Desconectado {getTimeAgo()}</span>
    </div>
  );
}
