import { useState } from "react";
import { ToastType } from "../../../components/common/Toast";

export const useNotificacionToast = () => {
  const [mensaje, setMensaje] = useState<string>("");
  const [tipo, setTipo] = useState<ToastType>("info");
  const [mostrar, setMostrar] = useState(false);

  const mostrarNotificacionToast = (
    nuevoMensaje: string,
    nuevoTipo: ToastType
  ) => {
    setMensaje(nuevoMensaje);
    setTipo(nuevoTipo);
    setMostrar(true);
  };

  const ocultarNotificacionToast = () => {
    setMostrar(false);
  };

  return {
    mensaje,
    tipo,
    mostrar,
    mostrarNotificacionToast,
    ocultarNotificacionToast,
  };
};
