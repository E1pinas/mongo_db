import { EmptyState } from "../../../components/common";

interface EstadosVaciosProps {
  hayBusqueda: boolean;
  searchQuery: string;
  onSubir: () => void;
  onLimpiarBusqueda: () => void;
}

export const EstadosVacios = ({
  hayBusqueda,
  searchQuery,
  onSubir,
  onLimpiarBusqueda,
}: EstadosVaciosProps) => {
  if (hayBusqueda) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">
          No se encontraron canciones con "{searchQuery}"
        </p>
        <button
          onClick={onLimpiarBusqueda}
          className="text-blue-400 hover:underline mt-4"
        >
          Ver todas las canciones
        </button>
      </div>
    );
  }

  return (
    <EmptyState
      title="Aún no tienes canciones"
      description="Sube tu primera canción para comenzar"
      actionLabel="Subir Canción"
      onAction={onSubir}
    />
  );
};
