import { Disc } from "lucide-react";

export function EstadoVacio() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
        <Disc size={48} className="text-orange-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No tienes álbumes guardados</h3>
      <p className="text-neutral-400">
        Guarda álbumes que te gusten para verlos aquí
      </p>
    </div>
  );
}
