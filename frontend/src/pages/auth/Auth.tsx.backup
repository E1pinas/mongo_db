import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts";
import logo from "../../assets/ba4da4b8-ae56-432b-aa57-1d21816bff67.png";

type AuthMode = "login" | "register";

const PAISES = [
  { code: "MX", nombre: "México" },
  { code: "ES", nombre: "España" },
  { code: "CO", nombre: "Colombia" },
  { code: "AR", nombre: "Argentina" },
  { code: "CL", nombre: "Chile" },
  { code: "PE", nombre: "Perú" },
  { code: "VE", nombre: "Venezuela" },
  { code: "EC", nombre: "Ecuador" },
  { code: "GT", nombre: "Guatemala" },
  { code: "CU", nombre: "Cuba" },
  { code: "BO", nombre: "Bolivia" },
  { code: "DO", nombre: "República Dominicana" },
  { code: "HN", nombre: "Honduras" },
  { code: "PY", nombre: "Paraguay" },
  { code: "SV", nombre: "El Salvador" },
  { code: "NI", nombre: "Nicaragua" },
  { code: "CR", nombre: "Costa Rica" },
  { code: "PA", nombre: "Panamá" },
  { code: "UY", nombre: "Uruguay" },
  { code: "PR", nombre: "Puerto Rico" },
  { code: "US", nombre: "Estados Unidos" },
  { code: "CA", nombre: "Canadá" },
  { code: "BR", nombre: "Brasil" },
  { code: "GB", nombre: "Reino Unido" },
  { code: "FR", nombre: "Francia" },
  { code: "DE", nombre: "Alemania" },
  { code: "IT", nombre: "Italia" },
  { code: "PT", nombre: "Portugal" },
  { code: "OTHER", nombre: "Otro" },
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading } = useAuth();

  // Calcular modo directamente desde la URL (sin estado)
  const mode: AuthMode =
    location.pathname === "/register" ? "register" : "login";

  // Usar sessionStorage para persistir errores entre re-renders
  const [errors, setErrorsState] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = sessionStorage.getItem("authErrors");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const setErrors = (newErrors: { [key: string]: string }) => {
    sessionStorage.setItem("authErrors", JSON.stringify(newErrors));
    setErrorsState(newErrors);
  };

  // Limpiar errores cuando cambia el modo
  useEffect(() => {
    const currentMode =
      location.pathname === "/register" ? "register" : "login";
    const savedMode = sessionStorage.getItem("authMode");

    if (savedMode && savedMode !== currentMode) {
      sessionStorage.removeItem("authErrors");
      sessionStorage.removeItem("registerFormData");
      setErrorsState({});
    }
    sessionStorage.setItem("authMode", currentMode);
  }, [location.pathname]);

  // Formulario de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Formulario de registro - usar sessionStorage para persistir datos
  const [registerData, setRegisterDataState] = useState(() => {
    try {
      const saved = sessionStorage.getItem("registerFormData");
      return saved
        ? JSON.parse(saved)
        : {
            nombre: "",
            apellidos: "",
            email: "",
            nick: "",
            password: "",
            confirmPassword: "",
            pais: "",
            fechaNacimiento: "",
          };
    } catch {
      return {
        nombre: "",
        apellidos: "",
        email: "",
        nick: "",
        password: "",
        confirmPassword: "",
        pais: "",
        fechaNacimiento: "",
      };
    }
  });

  const setRegisterData = (data: any) => {
    sessionStorage.setItem("registerFormData", JSON.stringify(data));
    setRegisterDataState(data);
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await login(loginData);
      navigate("/");
    } catch (err: any) {
      // Si el backend devuelve errores específicos por campo (email o nick duplicados)
      if (err.errors && typeof err.errors === "object") {
        const backendErrors: { [key: string]: string } = {};
        const fieldsToReset: any = {};

        // Mapear los errores del backend a nuestro formato
        if (err.errors.email) {
          backendErrors.email = err.errors.email;
          fieldsToReset.email = ""; // Marcar para limpiar
        }
        if (err.errors.nick) {
          backendErrors.nick = err.errors.nick;
          fieldsToReset.nick = ""; // Marcar para limpiar
        }

        // Limpiar solo los campos con error en una sola actualización
        if (Object.keys(fieldsToReset).length > 0) {
          setRegisterData((prev: any) => ({ ...prev, ...fieldsToReset }));
        }

        setErrors(backendErrors);
      } else {
        // Si es un error general
        setErrors({ general: err.message || "Error al registrarse" });
      }
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validaciones de campos vacíos
    if (!registerData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!registerData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios";
    }

    if (!registerData.nick.trim()) {
      newErrors.nick = "El usuario es obligatorio";
    } else if (registerData.nick.length < 3) {
      newErrors.nick = "El usuario debe tener al menos 3 caracteres";
    }

    if (!registerData.email.trim()) {
      newErrors.email = "El correo es obligatorio";
    } else if (!registerData.email.includes("@")) {
      newErrors.email = "El correo debe incluir el signo @";
    }

    if (!registerData.pais) {
      newErrors.pais = "Debes seleccionar un país";
    }

    if (!registerData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    }

    if (!registerData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (registerData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar tu contraseña";
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Normalizar nick: minúsculas y sin espacios
      const nickNormalizado = registerData.nick
        .toLowerCase()
        .replace(/\s+/g, "");

      await register({
        nombre: registerData.nombre,
        apellidos: registerData.apellidos,
        email: registerData.email,
        nick: nickNormalizado,
        password: registerData.password,
        pais: registerData.pais,
        fechaNacimiento: registerData.fechaNacimiento,
      });
      navigate("/");
    } catch (err: any) {
      // Si el backend devuelve errores específicos por campo (email o nick duplicados)
      if (err.errors && typeof err.errors === "object") {
        const backendErrors: { [key: string]: string } = {};
        const fieldsToReset: any = {};

        // Mapear los errores del backend a nuestro formato
        if (err.errors.email) {
          backendErrors.email = err.errors.email;
          fieldsToReset.email = ""; // Marcar para limpiar
        }
        if (err.errors.nick) {
          backendErrors.nick = err.errors.nick;
          fieldsToReset.nick = ""; // Marcar para limpiar
        }

        // Limpiar solo los campos con error en una sola actualización
        if (Object.keys(fieldsToReset).length > 0) {
          setRegisterData((prev: any) => ({ ...prev, ...fieldsToReset }));
        }

        setErrors(backendErrors);
      } else {
        // Si es un error general
        setErrors({ general: err.message || "Error al registrarse" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.vexels.com/media/users/3/102058/raw/efb18da597aa627e21dce33561bc9c40-fondo-colorido-de-la-musica.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo"
            className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-pink-400 mb-2">
            Bienvenido
          </h1>
          <p className="text-blue-200/60">Ingresa a tu cuenta</p>
        </div>

        {/* Formulario */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => {
                if (mode !== "login") {
                  setErrors({});
                  navigate("/login");
                }
              }}
              className={`px-4 py-2 font-semibold transition-all border-b-2 ${
                mode === "login"
                  ? "text-white border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => {
                if (mode !== "register") {
                  setErrors({});
                  navigate("/register");
                }
              }}
              className={`px-4 py-2 font-semibold transition-all border-b-2 ${
                mode === "register"
                  ? "text-white border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {/* Error message general para login */}
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-3 rounded-md text-sm mb-4">
                  {errors.general}
                </div>
              )}

              {/* Email/Username */}
              <div>
                <input
                  autoComplete="off"
                  type="text"
                  required
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="Ingresa tu correo o nombre de usuario"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <input
                  autoComplete="off"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="Ingresa tu contraseña"
                  disabled={isLoading}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              {/* Sign up link */}
              <div className="text-center pt-4 border-t border-white/10 mt-6">
                <p className="text-sm text-white/60">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      navigate("/register");
                    }}
                    className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 font-bold"
                  >
                    Regístrate
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form
              onSubmit={handleRegisterSubmit}
              className="space-y-4"
              noValidate
            >
              <p className="text-sm text-white/60 mb-4">
                Completa los datos para crear tu cuenta.
              </p>

              {/* Error general del servidor */}
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm text-white/60 font-medium mb-2">
                  Nombre completo *
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  required
                  value={registerData.nombre}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      nombre: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="Ej: Juan Carlos"
                  disabled={isLoading}
                />
                {errors.nombre && (
                  <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm text-white/60 font-medium mb-2">
                  Apellidos *
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  required
                  value={registerData.apellidos}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      apellidos: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="Ej: Pérez González"
                  disabled={isLoading}
                />
                {errors.apellidos && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.apellidos}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm text-white/60 font-medium mb-2">
                  Usuario *
                </label>
                <input
                  autoComplete="off"
                  type="text"
                  required
                  minLength={3}
                  value={registerData.nick}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      nick: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="Crea tu nombre de usuario único (mínimo 3 caracteres)"
                  disabled={isLoading}
                />
                {registerData.nick && (
                  <p className="text-xs text-slate-400 mt-1">
                    Se guardará como:{" "}
                    {registerData.nick.toLowerCase().replace(/\s+/g, "")}
                  </p>
                )}
                {errors.nick && (
                  <p className="text-red-400 text-xs mt-1">{errors.nick}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">
                  Email *
                </label>
                <input
                  autoComplete="off"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="tucorreo@ejemplo.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  País *
                </label>
                <select
                  required
                  value={registerData.pais}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, pais: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white"
                  disabled={isLoading}
                >
                  <option value="" className="bg-slate-800">
                    Selecciona tu país
                  </option>
                  {PAISES.map((pais) => (
                    <option
                      key={pais.code}
                      value={pais.code}
                      className="bg-slate-800"
                    >
                      {pais.nombre}
                    </option>
                  ))}
                </select>
                {errors.pais && (
                  <p className="text-red-400 text-xs mt-1">{errors.pais}</p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm text-white/60 font-medium mb-2">
                  Fecha de nacimiento *
                </label>
                <input
                  autoComplete="off"
                  type="date"
                  required
                  value={registerData.fechaNacimiento}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      fechaNacimiento: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white"
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.fechaNacimiento && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.fechaNacimiento}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Si eres menor de edad, no podrás escuchar contenido explícito
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-white/60 font-medium mb-2">
                  Contraseña *
                </label>
                <input
                  autoComplete="off"
                  type="password"
                  required
                  minLength={6}
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="Crea una contraseña segura (mínimo 6 caracteres)"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white/60">
                  Confirmar contraseña *
                </label>
                <input
                  autoComplete="off"
                  type="password"
                  required
                  minLength={6}
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-white placeholder:text-slate-300"
                  placeholder="Vuelve a escribir tu contraseña"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
