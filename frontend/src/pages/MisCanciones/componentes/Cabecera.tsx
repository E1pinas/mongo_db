interface CabeceraProps {
  totalCanciones: number;
}

export const Cabecera = ({ totalCanciones }: CabeceraProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-4">Mis Canciones</h1>
      <p className="text-neutral-400">
        {totalCanciones} {totalCanciones === 1 ? "canción" : "canciones"}
      </p>
    </div>
  );
};
