import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/auth.service";
import type { Usuario, LoginForm, RegisterForm } from "../types";

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfileSetup: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeProfileSetup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Cargar perfil al iniciar si hay token
  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
          // NO mostrar el modal si está haciendo login, solo si viene de registro reciente
          setNeedsProfileSetup(false);
        } catch (error) {
          console.error("Error loading user:", error);
          // NO eliminar el token aquí - mantener la sesión
          // Solo eliminar si es error 401 (no autorizado)
          if ((error as any)?.response?.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.usuario);
      // Notificar al reproductor que hay un nuevo usuario
      window.dispatchEvent(new CustomEvent("user-login"));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.usuario);
      // Notificar al reproductor que hay un nuevo usuario
      window.dispatchEvent(new CustomEvent("user-login"));
      // Siempre mostrar el modal después del registro exitoso
      setNeedsProfileSetup(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-lanzar el error para que Auth.tsx lo maneje
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      // Notificar al reproductor que se cerró sesión
      window.dispatchEvent(new CustomEvent("user-logout"));
      // NO eliminar playerState - cada usuario tiene su propio estado guardado
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    }
  };

  const completeProfileSetup = () => {
    setNeedsProfileSetup(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || authService.isAuthenticated(),
        isLoading,
        needsProfileSetup,
        login,
        register,
        logout,
        refreshProfile,
        completeProfileSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
