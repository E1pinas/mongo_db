import { useState } from "react";
import { authService } from "../../services/auth.service";

interface WelcomeModalProps {
  onComplete: () => void;
}

export default function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [nombreArtistico, setNombreArtistico] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [perfilPublico, setPerfilPublico] = useState(true);
  const [recibirSolicitudes, setRecibirSolicitudes] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreArtistico.trim()) {
      setError("El nombre artístico es obligatorio");
      return;
    }

    if (nombreArtistico.length < 2) {
      setError("El nombre artístico debe tener al menos 2 caracteres");
      return;
    }

    if (nombreArtistico.length > 50) {
      setError("El nombre artístico no puede superar los 50 caracteres");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Primero actualizar el perfil de texto y privacidad
      await authService.updateProfile({
        nombreArtistico: nombreArtistico.trim(),
        descripcion: bio.trim() || undefined,
      });

      // Actualizar configuración de privacidad
      await authService.updatePrivacySettings({
        perfilPublico,
        recibirSolicitudesAmistad: recibirSolicitudes,
      });

      // Si hay avatar, subirlo después
      if (avatarFile) {
        await authService.uploadAvatar(avatarFile);
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Completa tu perfil</h2>
          <button
            type="button"
            disabled
            className="px-4 py-1.5 bg-white text-black rounded-full font-medium text-sm cursor-not-allowed opacity-50"
          >
            Guardar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Banner del perfil */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Banner del perfil
            </label>
            <div className="relative h-40 bg-linear-to-br from-orange-600 to-orange-800 rounded-lg flex items-center justify-center">
              <div className="text-neutral-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Recomendado: 1500x500px, máximo 5MB
            </p>
          </div>

          {/* Foto de perfil */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Foto de perfil
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">R</span>
                  )}
                </div>
              </div>
              <label className="cursor-pointer">
                <span className="text-sm font-medium hover:underline">
                  Subir foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Recomendado: imagen cuadrada, máximo 5MB
            </p>
          </div>

          {/* Nombre de usuario (único) - Deshabilitado */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de usuario (único)
            </label>
            <input
              type="text"
              disabled
              placeholder="reze1"
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-500 cursor-not-allowed"
            />
            <p className="text-xs text-neutral-500 mt-1">
              3-30 caracteres. Solo letras, números y guión bajo (_). Sin
              espacios.
            </p>
          </div>

          {/* Nombre artístico (OBLIGATORIO) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre para mostrar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombreArtistico}
              onChange={(e) => setNombreArtistico(e.target.value)}
              placeholder="New Jeans, Bad Bunny, etc."
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-neutral-500 mt-1">
              Puede contener espacios y caracteres especiales. Máximo 50
              caracteres.
            </p>
          </div>

          {/* Biografía (Opcional) */}
          <div>
            <label className="block text-sm font-medium mb-2">Biografía</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white resize-none"
              rows={4}
              maxLength={200}
            />
            <p className="text-xs text-neutral-500 mt-1 text-right">
              {bio.length}/200 caracteres
            </p>
          </div>

          {/* Configuración de privacidad */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-neutral-300">
              Configuración de privacidad
            </h3>

            {/* Perfil público */}
            <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
              <div>
                <p className="text-sm font-medium">Perfil público</p>
                <p className="text-xs text-neutral-400">
                  Permitir que cualquiera vea tu perfil
                </p>
              </div>
              <input
                type="checkbox"
                checked={perfilPublico}
                onChange={(e) => setPerfilPublico(e.target.checked)}
                className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-green-500 focus:ring-2 focus:ring-green-500"
              />
            </label>

            {/* Recibir solicitudes de amistad */}
            <label className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors">
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
                checked={recibirSolicitudes}
                onChange={(e) => setRecibirSolicitudes(e.target.checked)}
                className="w-5 h-5 rounded bg-neutral-700 border-neutral-600 text-green-500 focus:ring-2 focus:ring-green-500"
              />
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Botón de envío real */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-full transition-colors"
          >
            {isLoading ? "Guardando..." : "Guardar y continuar"}
          </button>

          <p className="text-xs text-neutral-400 text-center">
            <span className="text-red-500">*</span> Campo obligatorio. Este será
            el nombre que verán todos los usuarios.
          </p>
        </form>
      </div>
    </div>
  );
}
