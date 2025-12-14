import { ListMusic } from "lucide-react";

export function EstadoVacio() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
        <ListMusic size={48} className="text-green-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No tienes playlists guardadas</h3>
      <p className="text-neutral-400">
        Guarda playlists que te gusten para verlas aquí
      </p>
    </div>
  );
}
