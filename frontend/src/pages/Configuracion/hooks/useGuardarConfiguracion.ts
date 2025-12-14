import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts";
import { authService } from "../../../services/auth.service";
import type {
  DatosFormularioPerfil,
  ConfiguracionPrivacidad,
  ArchivosImagenes,
} from "../tipos";

interface UseGuardarConfiguracionParams {
  formData: DatosFormularioPerfil;
  privacySettings: ConfiguracionPrivacidad;
  archivos: ArchivosImagenes;
}

export const useGuardarConfiguracion = ({
  formData,
  privacySettings,
  archivos,
}: UseGuardarConfiguracionParams) => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const validarNick = (nick: string): boolean => {
    const nickRegex = /^[a-zA-Z0-9_]+$/;
    if (!nickRegex.test(nick)) {
      setMensaje(
        "El nombre de usuario solo puede contener letras, números y guión bajo (_). Sin espacios."
      );
      return false;
    }

    if (nick.length < 3 || nick.length > 30) {
      setMensaje("El nombre de usuario debe tener entre 3 y 30 caracteres.");
      return false;
    }

    return true;
  };

  const guardarCambios = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setGuardando(true);
    setMensaje("");

    try {
      if (!validarNick(formData.nick)) {
        setGuardando(false);
        return;
      }

      const errors: string[] = [];
      const successes: string[] = [];

      // 1. Subir avatar
      if (archivos.avatarFile) {
        try {
          await authService.uploadAvatar(archivos.avatarFile);
          successes.push("Avatar actualizado");
        } catch (error: any) {
          console.error("Error subiendo avatar:", error);
          errors.push(
            "No se pudo subir el avatar (problema de conexión con R2)"
          );
        }
      }

      // 2. Subir banner
      if (archivos.bannerFile) {
        try {
          await authService.uploadBanner(archivos.bannerFile);
          successes.push("Banner actualizado");
        } catch (error: any) {
          console.error("Error subiendo banner:", error);
          errors.push(
            "No se pudo subir el banner (problema de conexión con R2)"
          );
        }
      }

      // 3. Actualizar perfil
      try {
        const nickNormalizado = formData.nick.toLowerCase().replace(/\s+/g, "");

        await authService.updateProfile({
          nick: nickNormalizado,
          descripcion: formData.bio,
          nombreArtistico: formData.nombreArtistico,
          redes: {
            instagram: formData.instagram,
            tiktok: formData.tiktok,
            youtube: formData.youtube,
            x: formData.x,
          },
        });

        successes.push("Perfil actualizado");
      } catch (error: any) {
        console.error("Error actualizando perfil:", error);
        errors.push(`Perfil: ${error.message || "Error desconocido"}`);
      }

      // 4. Actualizar privacidad
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
        setMensaje(`✓ ${successes.join(", ")}`);
        await refreshProfile();

        const nickNormalizado = formData.nick.toLowerCase().replace(/\s+/g, "");
        setTimeout(() => {
          navigate(`/perfil/${nickNormalizado}`);
        }, 1500);
      }

      if (errors.length > 0) {
        const errorMsg = errors.join(". ");
        if (successes.length === 0) {
          throw new Error(errorMsg);
        } else {
          setMensaje((prev) => `${prev}\n⚠️ ${errorMsg}`);
        }
      }
    } catch (error: any) {
      setMensaje(error.message || "Error al actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  return {
    guardando,
    mensaje,
    guardarCambios,
  };
};
