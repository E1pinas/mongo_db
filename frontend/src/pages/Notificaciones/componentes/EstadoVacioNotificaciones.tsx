import type { TipoFiltro } from "../tipos";

interface EstadoVacioNotificacionesProps {
  filtro: TipoFiltro;
}

export const EstadoVacioNotificaciones = ({
  filtro,
}: EstadoVacioNotificacionesProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-600"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-neutral-300 mb-2">
        No hay notificaciones
      </h3>
      <p className="text-neutral-500 text-center">
        {filtro === "todas"
          ? "Estarás al día con tu actividad"
          : `No hay notificaciones de ${filtro}`}
      </p>
    </div>
  );
};
