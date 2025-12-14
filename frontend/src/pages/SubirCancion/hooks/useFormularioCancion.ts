import { useState } from "react";
import type { DatosFormularioCancion } from "../tipos";

export const useFormularioCancion = () => {
  const [formData, setFormData] = useState<DatosFormularioCancion>({
    titulo: "",
    generos: [],
    esPrivada: false,
    esExplicita: false,
  });

  const actualizarTitulo = (titulo: string) => {
    setFormData((prev) => ({ ...prev, titulo }));
  };

  const toggleGenero = (genero: string) => {
    setFormData((prev) => ({
      ...prev,
      generos: prev.generos.includes(genero)
        ? prev.generos.filter((g) => g !== genero)
        : [...prev.generos, genero],
    }));
  };

  const actualizarEsPrivada = (esPrivada: boolean) => {
    setFormData((prev) => ({ ...prev, esPrivada }));
  };

  const actualizarEsExplicita = (esExplicita: boolean) => {
    setFormData((prev) => ({ ...prev, esExplicita }));
  };

  return {
    formData,
    actualizarTitulo,
    toggleGenero,
    actualizarEsPrivada,
    actualizarEsExplicita,
  };
};
