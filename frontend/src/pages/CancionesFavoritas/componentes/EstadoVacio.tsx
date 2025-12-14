import { Heart } from "lucide-react";

export const EstadoVacio = () => {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
        <Heart size={48} className="text-pink-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2">No tienes canciones favoritas</h3>
      <p className="text-neutral-400">
        Dale like a las canciones que te gusten para verlas aquí
      </p>
    </div>
  );
};
