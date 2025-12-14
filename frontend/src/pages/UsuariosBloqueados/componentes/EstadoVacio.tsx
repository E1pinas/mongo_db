import { Ban } from "lucide-react";

export const EstadoVacio = () => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Ban size={32} className="text-neutral-600" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No hay usuarios bloqueados</h2>
      <p className="text-neutral-400">
        Cuando bloquees a alguien, aparecerá aquí
      </p>
    </div>
  );
};
