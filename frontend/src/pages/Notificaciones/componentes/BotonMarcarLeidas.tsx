interface BotonMarcarLeidasProps {
  onMarcarTodasLeidas: () => Promise<void>;
}

export const BotonMarcarLeidas = ({
  onMarcarTodasLeidas,
}: BotonMarcarLeidasProps) => {
  return (
    <div className="flex justify-end mb-6">
      <button
        onClick={onMarcarTodasLeidas}
        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-green-500/30"
      >
        ✓ Marcar todas como leídas
      </button>
    </div>
  );
};
