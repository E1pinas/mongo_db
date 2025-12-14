import { useState } from "react";
import type { DatosAlbum } from "../tipos";

export const useDatosAlbum = () => {
  const [datos, setDatos] = useState<DatosAlbum>({
    titulo: "",
    descripcion: "",
    generos: [],
    fechaLanzamiento: "",
    esPrivado: false,
  });

  const actualizarCampo = <K extends keyof DatosAlbum>(
    campo: K,
    valor: DatosAlbum[K]
  ) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleGenero = (genero: string) => {
    setDatos((prev) => ({
      ...prev,
      generos: prev.generos.includes(genero)
        ? prev.generos.filter((g) => g !== genero)
        : [...prev.generos, genero],
    }));
  };

  return {
    datos,
    actualizarCampo,
    toggleGenero,
  };
};
