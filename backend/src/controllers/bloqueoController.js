import Bloqueo from "../models/bloqueoModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Amistad } from "../models/amistadModels.js";
import { Seguidor } from "../models/seguidorModels.js";

/**
 * Bloquear a un usuario
 * Cuando un usuario bloquea a otro:
 * - Se crea el registro de bloqueo
 * - Se elimina cualquier amistad existente
 * - Se eliminan las relaciones de seguimiento (ambas direcciones)
 */
export const bloquearUsuario = async (req, res) => {
  try {
    const bloqueadorId = req.usuario.id; // Usuario autenticado que bloquea
    const { usuarioId } = req.params; // Usuario a bloquear

    // Validar que no intente bloquearse a sí mismo
    if (bloqueadorId === usuarioId) {
      return res.status(400).json({
        mensaje: "No puedes bloquearte a ti mismo",
      });
    }

    // Verificar que el usuario a bloquear existe
    const usuarioABloquear = await Usuario.findById(usuarioId);
    if (!usuarioABloquear) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    // Verificar si ya está bloqueado
    const bloqueoExistente = await Bloqueo.findOne({
      bloqueador: bloqueadorId,
      bloqueado: usuarioId,
    });

    if (bloqueoExistente) {
      return res.status(400).json({
        mensaje: "Ya has bloqueado a este usuario",
      });
    }

    // Crear el bloqueo
    await Bloqueo.create({
      bloqueador: bloqueadorId,
      bloqueado: usuarioId,
      razon: req.body.razon || "",
    });

    // Eliminar amistad si existe (en ambas direcciones)
    await Amistad.deleteMany({
      $or: [
        { solicitante: bloqueadorId, receptor: usuarioId },
        { solicitante: usuarioId, receptor: bloqueadorId },
      ],
    });

    // Eliminar relaciones de seguimiento (en ambas direcciones)
    // Si A bloquea a B:
    // - Se elimina si A seguía a B (seguidor: A, seguido: B)
    // - Se elimina si B seguía a A (seguidor: B, seguido: A)
    await Seguidor.deleteMany({
      $or: [
        { seguidor: bloqueadorId, seguido: usuarioId },
        { seguidor: usuarioId, seguido: bloqueadorId },
      ],
    });

    // Actualizar contadores de seguidores y seguidos
    const seguidoresUsuarioABloquear = await Seguidor.countDocuments({
      seguido: usuarioId,
    });
    const seguidoresBloqueador = await Seguidor.countDocuments({
      seguido: bloqueadorId,
    });
    const seguidosUsuarioABloquear = await Seguidor.countDocuments({
      seguidor: usuarioId,
    });
    const seguidosBloqueador = await Seguidor.countDocuments({
      seguidor: bloqueadorId,
    });

    await Usuario.findByIdAndUpdate(usuarioId, {
      "estadisticas.totalSeguidores": seguidoresUsuarioABloquear,
      "estadisticas.totalSeguidos": seguidosUsuarioABloquear,
    });
    await Usuario.findByIdAndUpdate(bloqueadorId, {
      "estadisticas.totalSeguidores": seguidoresBloqueador,
      "estadisticas.totalSeguidos": seguidosBloqueador,
    });

    return res.status(201).json({
      mensaje: "Usuario bloqueado exitosamente",
    });
  } catch (error) {
    console.error("Error al bloquear usuario:", error);
    return res.status(500).json({
      mensaje: "Error al bloquear usuario",
      error: error.message,
    });
  }
};

/**
 * Desbloquear a un usuario
 */
export const desbloquearUsuario = async (req, res) => {
  try {
    const bloqueadorId = req.usuario.id;
    const { usuarioId } = req.params;

    // Buscar y eliminar el bloqueo
    const bloqueo = await Bloqueo.findOneAndDelete({
      bloqueador: bloqueadorId,
      bloqueado: usuarioId,
    });

    if (!bloqueo) {
      return res.status(404).json({
        mensaje: "No has bloqueado a este usuario",
      });
    }

    return res.status(200).json({
      mensaje: "Usuario desbloqueado exitosamente",
    });
  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    return res.status(500).json({
      mensaje: "Error al desbloquear usuario",
      error: error.message,
    });
  }
};

/**
 * Verificar si un usuario está bloqueado
 * Devuelve información sobre el estado del bloqueo entre dos usuarios
 */
export const verificarBloqueo = async (req, res) => {
  try {
    const usuarioActualId = req.usuario.id;
    const { usuarioId } = req.params;

    // Verificar si el usuario actual bloqueó al otro
    const yoBloqueo = await Bloqueo.findOne({
      bloqueador: usuarioActualId,
      bloqueado: usuarioId,
    });

    // Verificar si el otro usuario bloqueó al usuario actual
    const meBloquearon = await Bloqueo.findOne({
      bloqueador: usuarioId,
      bloqueado: usuarioActualId,
    });

    return res.status(200).json({
      yoBloqueo: !!yoBloqueo,
      meBloquearon: !!meBloquearon,
      bloqueado: !!yoBloqueo || !!meBloquearon,
    });
  } catch (error) {
    console.error("Error al verificar bloqueo:", error);
    return res.status(500).json({
      mensaje: "Error al verificar bloqueo",
      error: error.message,
    });
  }
};

/**
 * Listar usuarios bloqueados por el usuario actual
 */
export const listarBloqueados = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const bloqueos = await Bloqueo.find({ bloqueador: usuarioId })
      .populate("bloqueado", "nick nombreArtistico avatarUrl bio")
      .sort({ createdAt: -1 });

    const usuariosBloqueados = bloqueos.map((b) => ({
      usuario: b.bloqueado,
      fechaBloqueo: b.createdAt,
      razon: b.razon,
    }));

    return res.status(200).json({
      bloqueados: usuariosBloqueados,
      total: usuariosBloqueados.length,
    });
  } catch (error) {
    console.error("Error al listar bloqueados:", error);
    return res.status(500).json({
      mensaje: "Error al listar usuarios bloqueados",
      error: error.message,
    });
  }
};
