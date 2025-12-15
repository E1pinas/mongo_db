import { useState, useEffect } from "react";
import { servicioPerfil } from "../servicios";
import type { Usuario } from "../../../types";

export const useDatosPerfil = (
  nick: string | undefined,
  usuarioActual: Usuario | null
) => {
  const [usuarioPerfil, setUsuarioPerfil] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState<{
    tipo: "no_encontrado" | "privado" | "no_disponible";
    mensaje: string;
  } | null>(null);

  const cargarPerfil = async () => {
    try {
      setCargando(true);
      setErrorPerfil(null);

      let datosUsuario: Usuario | null = null;

      // Si no hay nick en la URL, mostrar el perfil actual (cargar desde backend)
      if (!nick && usuarioActual) {
        try {
          datosUsuario = await servicioPerfil.obtenerPerfilPorNick(
            usuarioActual.nick
          );
        } catch (error) {
          console.error("Error al cargar propio perfil:", error);
          datosUsuario = usuarioActual;
        }
      }
      // Siempre cargar desde el backend para obtener datos poblados
      else if (nick) {
        try {
          datosUsuario = await servicioPerfil.obtenerPerfilPorNick(nick);
        } catch (error: any) {
          console.error("Error al cargar perfil por nick:", error);

          // Bloqueo - mostrar "Usuario no encontrado" para privacidad
          if (
            error.response?.status === 403 ||
            error.response?.data?.bloqueado ||
            error.message.includes("403") ||
            error.message.includes("bloqueado")
          ) {
            setUsuarioPerfil(null);
            setCargando(false);
            return;
          }

          // Perfil privado
          if (error.message.includes("privado")) {
            setErrorPerfil({
              tipo: "privado",
              mensaje: "Este perfil es privado. Solo los amigos pueden verlo.",
            });
            setUsuarioPerfil(null);
            setCargando(false);
            return;
          }

          // Usuario no encontrado
          setUsuarioPerfil(null);
          setCargando(false);
          return;
        }
      }

      setUsuarioPerfil(datosUsuario);

      // Agregar al historial de recientes (solo si no es tu propio perfil)
      if (datosUsuario && datosUsuario._id !== usuarioActual?._id) {
        await servicioPerfil.agregarARecientes(datosUsuario._id);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setErrorPerfil({
        tipo: "no_disponible",
        mensaje: "No se pudo cargar el perfil. Por favor, intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, [nick, usuarioActual]);

  return {
    usuarioPerfil,
    cargando,
    errorPerfil,
    recargarPerfil: cargarPerfil,
  };
};
