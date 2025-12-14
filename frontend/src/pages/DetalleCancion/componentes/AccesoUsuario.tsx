import { LogIn, UserPlus } from "lucide-react";

interface AccesoUsuarioProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const AccesoUsuario = ({ onLogin, onRegister }: AccesoUsuarioProps) => {
  return (
    <>
      <div className="relative py-3 sm:py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gradient-to-r from-transparent via-neutral-600 to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-neutral-900 px-3 sm:px-4 py-1 text-xs sm:text-sm font-bold text-neutral-300 border border-neutral-700 rounded-full">
            Accede a todo
          </span>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        <button
          onClick={onRegister}
          className="w-full group relative px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-xl hover:shadow-blue-500/40 overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-center gap-2">
            <UserPlus size={18} className="sm:hidden" />
            <UserPlus size={20} className="hidden sm:block" />
            <span>Crear Cuenta Nueva</span>
          </div>
        </button>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-transparent border-2 border-neutral-600 hover:border-white hover:bg-white/5 rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-[0.98]"
        >
          <LogIn size={16} className="sm:hidden" />
          <LogIn size={18} className="hidden sm:block" />
          <span>Iniciar Sesión</span>
        </button>
      </div>
    </>
  );
};
