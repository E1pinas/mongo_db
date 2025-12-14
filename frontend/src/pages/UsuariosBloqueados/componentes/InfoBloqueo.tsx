export const InfoBloqueo = () => {
  return (
    <div className="mt-8 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <span className="text-blue-500">ℹ️</span>
        ¿Qué significa bloquear?
      </h3>
      <ul className="text-sm text-neutral-400 space-y-1">
        <li>• Los usuarios bloqueados no pueden ver tu perfil</li>
        <li>• No pueden encontrarte en búsquedas</li>
        <li>• No pueden enviarte solicitudes de amistad ni seguirte</li>
        <li>
          • Se eliminarán las relaciones existentes (amistades, seguimiento)
        </li>
        <li>• Puedes desbloquearlos en cualquier momento desde aquí</li>
      </ul>
    </div>
  );
};
