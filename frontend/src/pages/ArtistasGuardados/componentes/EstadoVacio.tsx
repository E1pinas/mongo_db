import { User } from "lucide-react";

export function EstadoVacio() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
        <User size={48} className="text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No sigues a ningún artista</h3>
      <p className="text-neutral-400">
        Sigue a artistas que te gusten para verlos aquí
      </p>
    </div>
  );
}
