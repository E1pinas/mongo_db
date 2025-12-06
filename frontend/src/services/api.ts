import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Configuración base de axios
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3900/api",
  timeout: 30000,
  withCredentials: true, // Importante para enviar cookies JWT
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para requests - agregar token si existe
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // El token se maneja automáticamente por las cookies httpOnly
    // Pero si necesitas enviar el token en el header también:
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper para crear FormData (subir archivos)
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};

// Helper para manejar errores de API
export const handleApiError = (
  error: any
): { message: string; errors?: any } => {
  if (error.response?.data) {
    return {
      message:
        error.response.data.message ||
        error.response.data.mensaje ||
        error.response.data.error ||
        "Ha ocurrido un error",
      errors: error.response.data.errors,
    };
  }
  if (error.message) {
    return { message: error.message };
  }
  return { message: "Ha ocurrido un error inesperado" };
};
