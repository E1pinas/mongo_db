import { useState } from "react";
import { useAuth } from "../../../contexts";
import type { DatosFormularioPerfil } from "../tipos";

export const useFormularioPerfil = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<DatosFormularioPerfil>({
    nick: user?.nick || "",
    nombreArtistico: user?.nombreArtistico || "",
    bio: user?.bio || "",
    instagram: user?.redes?.instagram || "",
    tiktok: user?.redes?.tiktok || "",
    youtube: user?.redes?.youtube || "",
    x: user?.redes?.x || "",
  });

  const actualizarCampo = (
    campo: keyof DatosFormularioPerfil,
    valor: string
  ) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  return {
    formData,
    actualizarCampo,
    setFormData,
  };
};
