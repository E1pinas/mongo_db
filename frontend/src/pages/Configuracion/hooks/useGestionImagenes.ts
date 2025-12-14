import { useState, useRef } from "react";
import { useAuth } from "../../../contexts";
import type { ArchivosImagenes } from "../tipos";

export const useGestionImagenes = () => {
  const { user } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [archivos, setArchivos] = useState<ArchivosImagenes>({
    avatarFile: null,
    bannerFile: null,
    avatarPreview: user?.avatarUrl || "",
    bannerPreview: user?.bannerUrl || "",
  });

  const [errorImagen, setErrorImagen] = useState("");

  const manejarCambioAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorImagen("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorImagen("La imagen no puede superar los 5MB");
      return;
    }

    setArchivos((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
    setErrorImagen("");
  };

  const manejarCambioBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorImagen("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorImagen("La imagen no puede superar los 5MB");
      return;
    }

    setArchivos((prev) => ({
      ...prev,
      bannerFile: file,
      bannerPreview: URL.createObjectURL(file),
    }));
    setErrorImagen("");
  };

  const eliminarAvatar = () => {
    setArchivos((prev) => ({
      ...prev,
      avatarFile: null,
      avatarPreview: "",
    }));
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const eliminarBanner = () => {
    setArchivos((prev) => ({
      ...prev,
      bannerFile: null,
      bannerPreview: "",
    }));
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  return {
    archivos,
    errorImagen,
    avatarInputRef,
    bannerInputRef,
    manejarCambioAvatar,
    manejarCambioBanner,
    eliminarAvatar,
    eliminarBanner,
  };
};
