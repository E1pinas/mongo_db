export const CabeceraSubirCancion = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 p-8 mb-8 border border-white/10">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-black bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Subir Canción
            </h1>
            <p className="text-neutral-400 mt-1">
              Comparte tu música con el mundo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
