import api, { handleApiError } from "./api";
import type {
  AuthResponse,
  Usuario,
  LoginForm,
  RegisterForm,
  ApiResponse,
} from "../types";

export const authService = {
  // Registro de nuevo usuario
  async register(data: RegisterForm): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/usuarios/registro", data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Mapear descripcion a bio
      if (response.data.usuario) {
        response.data.usuario = {
          ...response.data.usuario,
          bio: response.data.usuario.descripcion || "",
        } as Usuario;
      }

      return response.data;
    } catch (error: any) {
      const errorData = handleApiError(error);
      const errorObj = new Error(errorData.message) as any;
      errorObj.errors = errorData.errors;
      throw errorObj;
    }
  },

  // Login de usuario
  async login(data: LoginForm): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/usuarios/login", data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Mapear descripcion a bio
      if (response.data.usuario) {
        response.data.usuario = {
          ...response.data.usuario,
          bio: response.data.usuario.descripcion || "",
        } as Usuario;
      }

      return response.data;
    } catch (error: any) {
      const errorData = handleApiError(error);
      const errorObj = new Error(errorData.message) as any;
      errorObj.errors = errorData.errors;
      throw errorObj;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post("/usuarios/logout");
      localStorage.removeItem("token");
    } catch (error: any) {
      // Siempre limpiar el token aunque falle
      localStorage.removeItem("token");
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener perfil actual
  async getProfile(): Promise<Usuario> {
    try {
      const response = await api.get<any>("/usuarios/perfil");
      // El backend devuelve { ok: true, usuario: {...} }
      const userData = response.data.usuario;

      // Mapear descripcion (backend) a bio (frontend)
      return {
        ...userData,
        bio: userData.descripcion || "",
      };
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Obtener perfil por nick (público)
  async getProfileByNick(nick: string): Promise<Usuario> {
    try {
      console.log("🔍 Frontend: Buscando perfil por nick:", nick);
      const response = await api.get<any>(`/perfil/nick/${nick}`);
      console.log("✅ Frontend: Perfil recibido:", response.data.usuario?.nick);
      console.log(
        "🆔 Frontend: ID del perfil recibido:",
        response.data.usuario?._id
      );
      const userData = response.data.usuario;

      // Mapear descripcion a bio
      const mappedUser = {
        ...userData,
        bio: userData.descripcion || "",
      };

      console.log("📦 Frontend: Usuario mapeado:", mappedUser);
      console.log("🆔 Frontend: ID después del mapeo:", mappedUser._id);

      return mappedUser;
    } catch (error: any) {
      console.error(
        "❌ Frontend: Error al buscar perfil:",
        error.response?.data || error
      );
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  // Actualizar perfil (nick, descripcion, nombreArtistico, redes)
  async updateProfile(data: {
    nick?: string;
    descripcion?: string;
    nombreArtistico?: string;
    redes?: {
      instagram?: string;
      tiktok?: string;
      youtube?: string;
      x?: string;
    };
  }): Promise<Usuario> {
    try {
      console.log("📤 Enviando actualización de perfil:", data);
      const response = await api.patch<any>("/usuarios/perfil", data);
      console.log("📥 Respuesta del backend:", response.data);

      const userData = response.data.usuario;

      // Mapear descripcion a bio
      return {
        ...userData,
        bio: userData.descripcion || "",
      };
    } catch (error: any) {
      console.error("❌ Error en updateProfile:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);

      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Subir avatar
  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("imagen", file);

      const response = await api.post<any>("/perfil/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.avatarUrl;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Subir banner
  async uploadBanner(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("imagen", file);

      const response = await api.post<any>("/perfil/banner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.bannerUrl;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar avatar
  async deleteAvatar(): Promise<void> {
    try {
      await api.delete("/perfil/avatar");
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Eliminar banner
  async deleteBanner(): Promise<void> {
    try {
      await api.delete("/perfil/banner");
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Actualizar configuración de privacidad
  async updatePrivacySettings(settings: {
    perfilPublico?: boolean;
    recibirSolicitudesAmistad?: boolean;
    mostrarUltimoIngreso?: boolean;
    mostrarEstadoConectado?: boolean;
  }): Promise<void> {
    try {
      await api.patch("/usuarios/privacy", { privacy: settings });
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },

  // Buscar usuarios por nick o nombre artístico
  async searchUsers(query: string): Promise<Usuario[]> {
    try {
      const response = await api.get(
        `/usuarios/buscar?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error: any) {
      const errorData = handleApiError(error);
      throw new Error(errorData.message);
    }
  },
};
