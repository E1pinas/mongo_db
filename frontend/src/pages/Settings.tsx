import { useState, FormEvent, useRef } from "react";
import { useAuth } from "../contexts";
import { X, Camera, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

export default function Settings() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Refs para los inputs de archivo
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nick: user?.nick || "",
    nombreArtistico: user?.nombreArtistico || "",
    bio: user?.bio || "",
    instagram: user?.redes?.instagram || "",
    tiktok: user?.redes?.tiktok || "",
    youtube: user?.redes?.youtube || "",
    x: user?.redes?.x || "",
  });

  // Configuración de privacidad
  const [privacySettings, setPrivacySettings] = useState({
    perfilPublico: user?.privacy?.perfilPublico ?? true,
    recibirSolicitudes: user?.privacy?.recibirSolicitudesAmistad ?? true,
  });

  // Previews de imágenes
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.avatarUrl || ""
  );
  const [bannerPreview, setBannerPreview] = useState<string>(
    user?.bannerUrl || ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("La imagen no puede superar los 5MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("La imagen no puede superar los 5MB");
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Validar nick antes de enviar
      const nickRegex = /^[a-zA-Z0-9_]+$/;
      if (!nickRegex.test(formData.nick)) {
        throw new Error(
          "El nombre de usuario solo puede contener letras, números y guión bajo (_). Sin espacios."
        );
      }

      if (formData.nick.length < 3 || formData.nick.length > 30) {
        throw new Error(
          "El nombre de usuario debe tener entre 3 y 30 caracteres."
        );
      }

      const errors: string[] = [];
      const successes: string[] = [];

      // 1. Subir avatar si hay archivo nuevo
      if (avatarFile) {
        try {
          await authService.uploadAvatar(avatarFile);
          successes.push("Avatar actualizado");
        } catch (error: any) {
          console.error("Error subiendo avatar:", error);
          errors.push(
            "No se pudo subir el avatar (problema de conexión con R2)"
          );
        }
      }

      // 2. Subir banner si hay archivo nuevo
      if (bannerFile) {
        try {
          await authService.uploadBanner(bannerFile);
          successes.push("Banner actualizado");
        } catch (error: any) {
          console.error("Error subiendo banner:", error);
          errors.push(
            "No se pudo subir el banner (problema de conexión con R2)"
          );
        }
      }

      // 3. Actualizar datos del perfil (nick, bio) - esto siempre debe funcionar
      try {
        console.log("Intentando actualizar perfil con:", {
          nick: formData.nick,
          descripcion: formData.bio,
        });

        await authService.updateProfile({
          nick: formData.nick,
          descripcion: formData.bio,
          nombreArtistico: formData.nombreArtistico,
          redes: {
            instagram: formData.instagram,
            tiktok: formData.tiktok,
            youtube: formData.youtube,
            x: formData.x,
          },
        });

        console.log("Perfil actualizado exitosamente");
        successes.push("Perfil actualizado");
      } catch (error: any) {
        console.error("Error actualizando perfil:", error);
        console.error("Detalles del error:", {
          message: error.message,
          response: error.response,
          stack: error.stack,
        });
        errors.push(`Perfil: ${error.message || "Error desconocido"}`);
      }

      // 4. Actualizar configuración de privacidad
      try {
        await authService.updatePrivacySettings({
          perfilPublico: privacySettings.perfilPublico,
          recibirSolicitudesAmistad: privacySettings.recibirSolicitudes,
        });
        successes.push("Privacidad actualizada");
      } catch (error: any) {
        console.error("Error actualizando privacidad:", error);
        errors.push(`Privacidad: ${error.message || "Error desconocido"}`);
      }

      // Mostrar resultado
      if (successes.length > 0) {
        setMessage(`✓ ${successes.join(", ")}`);
        await refreshProfile();

        // Redirigir al perfil después de 1.5 segundos
        setTimeout(() => {
          navigate(`/profile/${formData.nick}`);
        }, 1500);
      }

      if (errors.length > 0) {
        const errorMsg = errors.join(". ");
        if (successes.length === 0) {
          throw new Error(errorMsg);
        } else {
          setMessage(`${message}\n⚠️ ${errorMsg}`);
        }
      }
    } catch (error: any) {
      setMessage(error.message || "Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h1 className="text-xl font-bold">Editar perfil</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Mensaje */}
            {message && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  message.includes("Error")
                    ? "bg-red-500/10 border border-red-500/50 text-red-500"
                    : "bg-green-500/10 border border-green-500/50 text-green-500"
                }`}
              >
                {message}
              </div>
            )}

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Banner del perfil
              </label>
              <div className="relative h-48 bg-neutral-800 rounded-lg overflow-hidden group">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-600 to-orange-800">
                    <Camera size={48} className="text-white/50" />
                  </div>
                )}

                {/* Botones de edición */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-4 py-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Camera size={16} />
                    Cambiar
                  </button>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <X size={16} />
                      Quitar
                    </button>
                  )}
                </div>

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Recomendado: 1500x500px, máximo 5MB
              </p>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Foto de perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full bg-neutral-800 overflow-hidden group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
                      <span className="text-3xl font-bold text-white">
                        {user?.nick.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Overlay con botón */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="p-2 bg-neutral-900/90 hover:bg-neutral-800 rounded-full transition-colors"
                    >
                      <Camera size={20} />
                    </button>
                  </div>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors mb-2"
                  >
                    Subir foto
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors ml-2"
                    >
                      Quitar foto
                    </button>
                  )}
                  <p className="text-xs text-neutral-500 mt-2">
                    Recomendado: imagen cuadrada, máximo 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Nombre de usuario */}
            <div>
              <label htmlFor="nick" className="block text-sm font-medium mb-2">
                Nombre de usuario (único)
              </label>
              <input
                id="nick"
                type="text"
                value={formData.nick}
                onChange={(e) =>
                  setFormData({ ...formData, nick: e.target.value })
                }
                placeholder="Tu nombre de usuario"
                pattern="^[a-zA-Z0-9_]+$"
                minLength={3}
                maxLength={30}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-neutral-500 mt-2">
                3-30 caracteres. Solo letras, números y guión bajo (_). Sin
                espacios.
              </p>
            </div>

            {/* Nombre artístico */}
            <div>
              <label
                htmlFor="nombreArtistico"
                className="block text-sm font-medium mb-2"
              >
                Nombre para mostrar
              </label>
              <input
                id="nombreArtistico"
                type="text"
                value={formData.nombreArtistico}
                onChange={(e) =>
                  setFormData({ ...formData, nombreArtistico: e.target.value })
                }
                placeholder="New Jeans, Bad Bunny, etc."
                maxLength={50}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500 mt-2">
                Puede contener espacios y caracteres especiales. Máximo 50
                caracteres.
              </p>
            </div>

            {/* Biografía */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2">
                Biografía
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Cuéntanos sobre ti..."
                rows={4}
                maxLength={200}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500 mt-2 text-right">
                {formData.bio.length}/200 caracteres
              </p>
            </div>

            {/* Redes Sociales */}
            <div className="space-y-4 pt-4 border-t border-neutral-800">
              <h3 className="text-lg font-semibold">Redes Sociales</h3>

              {/* Instagram */}
              <div>
                <label
                  htmlFor="instagram"
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                >
                  <span className="text-pink-500">📷</span>
                  Instagram
                </label>
                <input
                  id="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  placeholder="tu_usuario"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* TikTok */}
              <div>
                <label
                  htmlFor="tiktok"
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                >
                  <span>🎵</span>
                  TikTok
                </label>
                <input
                  id="tiktok"
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktok: e.target.value })
                  }
                  placeholder="@tu_usuario"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* YouTube */}
              <div>
                <label
                  htmlFor="youtube"
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                >
                  <span className="text-red-500">▶️</span>
                  YouTube
                </label>
                <input
                  id="youtube"
                  type="text"
                  value={formData.youtube}
                  onChange={(e) =>
                    setFormData({ ...formData, youtube: e.target.value })
                  }
                  placeholder="@tu_canal"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* X (Twitter) */}
              <div>
                <label
                  htmlFor="x"
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                >
                  <span>𝕏</span>X (Twitter)
                </label>
                <input
                  id="x"
                  type="text"
                  value={formData.x}
                  onChange={(e) =>
                    setFormData({ ...formData, x: e.target.value })
                  }
                  placeholder="@tu_usuario"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Configuración de privacidad */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Privacidad</h3>

              {/* Perfil público */}
              <label className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                <div>
                  <p className="text-sm font-medium">Perfil público</p>
                  <p className="text-xs text-neutral-400">
                    Permitir que cualquiera vea tu perfil
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.perfilPublico}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      perfilPublico: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-green-500 focus:ring-2 focus:ring-green-500"
                />
              </label>

              {/* Recibir solicitudes de amistad */}
              <label className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
                <div>
                  <p className="text-sm font-medium">
                    Recibir solicitudes de amistad
                  </p>
                  <p className="text-xs text-neutral-400">
                    Permitir que otros usuarios te envíen solicitudes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.recibirSolicitudes}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      recibirSolicitudes: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-green-500 focus:ring-2 focus:ring-green-500"
                />
              </label>
            </div>

            {/* Botón para ver usuarios bloqueados */}
            <div className="pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => navigate("/blocked-users")}
                className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-red-500">🚫</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Usuarios bloqueados</p>
                    <p className="text-xs text-neutral-400">
                      Administra tu lista de bloqueos
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
