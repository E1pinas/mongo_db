import Bloqueo from "../models/bloqueoModels.js";

/**
 * Middleware para verificar si existe un bloqueo entre dos usuarios
 * Impide el acceso si:
 * - El usuario actual bloqueó al usuario objetivo
 * - El usuario objetivo bloqueó al usuario actual
 *
 * Uso: checkBloqueo('params', 'usuarioId')
 * o:   checkBloqueo('params', 'nick')
 */
export const checkBloqueo = (source = "params", field = "usuarioId") => {
  return async (req, res, next) => {
    try {
      // Si no hay usuario autenticado, permitir continuar
      // (el endpoint decidirá si requiere auth o no)
      if (!req.usuario || !req.usuario.id) {
        return next();
      }

      const usuarioActualId = req.usuario.id;
      let usuarioObjetivoId = req[source][field];

      // Si el field es 'nick', necesitamos buscar el ID del usuario
      if (field === "nick" || field === "perfilNick") {
        const { Usuario } = await import("../models/usuarioModels.js");
        const usuario = await Usuario.findOne({
          nick: usuarioObjetivoId,
        }).select("_id");

        if (!usuario) {
          return res.status(404).json({
            mensaje: "Usuario no encontrado",
          });
        }

        usuarioObjetivoId = usuario._id.toString();
      }

      // No verificar si es el mismo usuario
      if (usuarioActualId === usuarioObjetivoId) {
        return next();
      }

      // Verificar si existe bloqueo en cualquier dirección
      const bloqueo = await Bloqueo.findOne({
        $or: [
          { bloqueador: usuarioActualId, bloqueado: usuarioObjetivoId },
          { bloqueador: usuarioObjetivoId, bloqueado: usuarioActualId },
        ],
      });

      if (bloqueo) {
        // Determinar quién bloqueó a quién para el mensaje
        const yoBloqueé = bloqueo.bloqueador.toString() === usuarioActualId;

        return res.status(403).json({
          mensaje: yoBloqueé
            ? "Has bloqueado a este usuario"
            : "Usuario no encontrado",
          bloqueado: true,
        });
      }

      // No hay bloqueo, continuar
      next();
    } catch (error) {
      console.error("Error en middleware checkBloqueo:", error);
      return res.status(500).json({
        mensaje: "Error al verificar bloqueo",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware para filtrar usuarios bloqueados de los resultados
 * Úsalo en endpoints que devuelvan listas de usuarios
 */
export const filtrarBloqueados = async (req, res, next) => {
  try {
    if (!req.usuario || !req.usuario.id) {
      return next();
    }

    const usuarioId = req.usuario.id;

    // Obtener IDs de usuarios bloqueados (en ambas direcciones)
    const bloqueos = await Bloqueo.find({
      $or: [{ bloqueador: usuarioId }, { bloqueado: usuarioId }],
    }).select("bloqueador bloqueado");

    // Crear lista de IDs bloqueados
    const bloqueadosIds = new Set();
    bloqueos.forEach((b) => {
      if (b.bloqueador.toString() === usuarioId) {
        bloqueadosIds.add(b.bloqueado.toString());
      } else {
        bloqueadosIds.add(b.bloqueador.toString());
      }
    });

    // Agregar al request para que los controllers lo usen
    req.usuariosBloqueados = Array.from(bloqueadosIds);

    next();
  } catch (error) {
    console.error("Error en middleware filtrarBloqueados:", error);
    // No bloquear la petición si falla el filtrado
    req.usuariosBloqueados = [];
    next();
  }
};
