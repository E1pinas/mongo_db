export const CabeceraNotificaciones = () => {
  return (
    <div className="mb-8 relative">
      <div className="absolute inset-0 bg-linear-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 blur-3xl" />
      <div className="relative">
        <h1 className="text-5xl font-black mb-3 bg-linear-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          Notificaciones
        </h1>
        <p className="text-neutral-400 text-lg">
          Mantente al día con tu actividad
        </p>
      </div>
    </div>
  );
};
