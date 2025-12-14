import { useState } from "react";
import type { ConfiguracionPrivacidad } from "../tipos";

export const useConfiguracionPrivacidad = () => {
  const [privacySettings, setPrivacySettings] =
    useState<ConfiguracionPrivacidad>({
      perfilPublico: true,
      recibirSolicitudes: true,
    });

  const actualizarPrivacidad = (
    campo: keyof ConfiguracionPrivacidad,
    valor: boolean
  ) => {
    setPrivacySettings((prev) => ({ ...prev, [campo]: valor }));
  };

  return {
    privacySettings,
    actualizarPrivacidad,
    setPrivacySettings,
  };
};
