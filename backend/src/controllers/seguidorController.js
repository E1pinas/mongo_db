// src/controllers/seguidorController.js
import { Seguidor } from "../models/seguidorModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Notificacion } from "../models/notificacionModels.js";

/**
 * Seguir a un usuario
 * POST /api/seguidores/:usuarioId/seguir
 */
export const seguirUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // No puedes seguirte a ti mismo
    if (usuarioId === req.userId) {
      return res.status(400).json({
        ok: false,
        mensaje: "No puedes seguirte a ti mismo",
      });
    }

    // Verificar que el usuario existe
    const usuarioExiste = await Usuario.findById(usuarioId);
    if (!usuarioExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Verificar si ya lo sigues
    const yaLoSigues = await Seguidor.findOne({
      seguidor: req.userId,
      seguido: usuarioId,
    });

    if (yaLoSigues) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ya sigues a este usuario",
      });
    }

    // Crear relación de seguidor
    await Seguidor.create({
      seguidor: req.userId,
      seguido: usuarioId,
    });

    // Actualizar estadísticas
    await Usuario.findByIdAndUpdate(req.userId, {
      $inc: { "estadisticas.totalSeguidos": 1 },
    });

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      {
        $inc: { "estadisticas.totalSeguidores": 1 },
      },
      { new: true }
    );

    // Agregar a artistas guardados en la biblioteca
    await Usuario.findByIdAndUpdate(req.userId, {
      $addToSet: { "biblioteca.artistasGuardados": usuarioId },
    });

    // Notificar al usuario que lo siguieron con contador
    const seguidor = await Usuario.findById(req.userId).select(
      "nick nombreArtistico"
    );

    const totalSeguidores = usuarioActualizado.estadisticas.totalSeguidores;
    let mensaje;

    if (totalSeguidores === 1) {
      mensaje = `${
        seguidor.nombreArtistico || seguidor.nick
      } es tu primer seguidor 🎉`;
    } else if (totalSeguidores === 10) {
      mensaje = `${
        seguidor.nombreArtistico || seguidor.nick
      } ha comenzado a seguirte - ¡Ya tienes 10 seguidores! 🔥`;
    } else if (totalSeguidores === 50) {
      mensaje = `${
        seguidor.nombreArtistico || seguidor.nick
      } ha comenzado a seguirte - ¡Ya tienes 50 seguidores! 🚀`;
    } else if (totalSeguidores === 100) {
      mensaje = `${
        seguidor.nombreArtistico || seguidor.nick
      } ha comenzado a seguirte - ¡Ya tienes 100 seguidores! 🌟`;
    } else if (totalSeguidores % 25 === 0 && totalSeguidores >= 25) {
      mensaje = `${
        seguidor.nombreArtistico || seguidor.nick
      } ha comenzado a seguirte - Ya tienes ${totalSeguidores} seguidores 🎊`;
    } else {
      mensaje = `${
        seguidor.nombreArtistico || seguidor.nick
      } ha comenzado a seguirte`;
    }

    await Notificacion.create({
      usuarioDestino: usuarioId,
      usuarioOrigen: req.userId,
      tipo: "nuevo_seguidor",
      mensaje,
      recurso: {
        tipo: "user",
        id: req.userId,
      },
    });

    // Notificar hitos de seguidores (10, 50, 100, 500, 1000)
    const hitos = [10, 50, 100, 500, 1000, 5000, 10000];

    if (hitos.includes(totalSeguidores)) {
      await Notificacion.create({
        usuarioDestino: usuarioId,
        usuarioOrigen: null, // Sistema
        tipo: "sistema",
        mensaje: `🎉 ¡Has alcanzado ${totalSeguidores} seguidores!`,
        recurso: {
          tipo: "user",
          id: usuarioId,
        },
      });
    }

    return res.status(201).json({
      ok: true,
      mensaje: "Ahora sigues a este usuario",
    });
  } catch (error) {
    console.error("Error al seguir usuario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al seguir usuario",
    });
  }
};

/**
 * Dejar de seguir a un usuario
 * DELETE /api/seguidores/:usuarioId/seguir
 */
export const dejarDeSeguirUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const seguimiento = await Seguidor.findOneAndDelete({
      seguidor: req.userId,
      seguido: usuarioId,
    });

    if (!seguimiento) {
      return res.status(400).json({
        ok: false,
        mensaje: "No sigues a este usuario",
      });
    }

    // Actualizar estadísticas
    await Usuario.findByIdAndUpdate(req.userId, {
      $inc: { "estadisticas.totalSeguidos": -1 },
    });

    await Usuario.findByIdAndUpdate(usuarioId, {
      $inc: { "estadisticas.totalSeguidores": -1 },
    });

    // Quitar de artistas guardados en la biblioteca
    await Usuario.findByIdAndUpdate(req.userId, {
      $pull: { "biblioteca.artistasGuardados": usuarioId },
    });

    return res.status(200).json({
      ok: true,
      mensaje: "Dejaste de seguir a este usuario",
    });
  } catch (error) {
    console.error("Error al dejar de seguir:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al dejar de seguir",
    });
  }
};

/**
 * Obtener seguidores de un usuario
 * GET /api/seguidores/:usuarioId/seguidores
 */
export const obtenerSeguidores = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { pagina = 1, limite = 20 } = req.query;

    const seguidores = await Seguidor.find({ seguido: usuarioId })
      .populate(
        "seguidor",
        "nick nombre nombreArtistico avatarUrl bannerUrl verificado"
      )
      .sort({ createdAt: -1 })
      .limit(Number(limite))
      .skip((Number(pagina) - 1) * Number(limite));

    const total = await Seguidor.countDocuments({ seguido: usuarioId });

    return res.status(200).json({
      ok: true,
      seguidores: seguidores.map((s) => s.seguidor),
      paginacion: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener seguidores:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener seguidores",
    });
  }
};

/**
 * Obtener usuarios seguidos
 * GET /api/seguidores/:usuarioId/seguidos
 */
export const obtenerSeguidos = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { pagina = 1, limite = 20 } = req.query;

    const seguidos = await Seguidor.find({ seguidor: usuarioId })
      .populate(
        "seguido",
        "nick nombre nombreArtistico avatarUrl bannerUrl verificado"
      )
      .sort({ createdAt: -1 })
      .limit(Number(limite))
      .skip((Number(pagina) - 1) * Number(limite));

    const total = await Seguidor.countDocuments({ seguidor: usuarioId });

    return res.status(200).json({
      ok: true,
      seguidos: seguidos.map((s) => s.seguido),
      paginacion: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener seguidos:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener seguidos",
    });
  }
};

/**
 * Verificar si sigo a un usuario
 * GET /api/seguidores/:usuarioId/sigo
 */
export const verificarSiSigo = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const loSigo = await Seguidor.findOne({
      seguidor: req.userId,
      seguido: usuarioId,
    });

    return res.status(200).json({
      ok: true,
      siguiendo: !!loSigo,
    });
  } catch (error) {
    console.error("Error al verificar seguimiento:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al verificar seguimiento",
    });
  }
};

/**
 * Obtener seguidores mutuos
 * GET /api/seguidores/mutuos
 */
export const obtenerSeguidoresMutuos = async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query;

    // Usuarios que yo sigo
    const yoSigo = await Seguidor.find({ seguidor: req.userId }).select(
      "seguido"
    );
    const idsQueYoSigo = yoSigo.map((s) => s.seguido.toString());

    // Usuarios que me siguen a mí
    const meSiguen = await Seguidor.find({ seguido: req.userId }).select(
      "seguidor"
    );
    const idsQueMeSiguen = meSiguen.map((s) => s.seguidor.toString());

    // Intersección (seguidores mutuos)
    const idsMutuos = idsQueYoSigo.filter((id) => idsQueMeSiguen.includes(id));

    const usuarios = await Usuario.find({ _id: { $in: idsMutuos } })
      .select("nick nombre avatarUrl bannerUrl verificado")
      .limit(Number(limite))
      .skip((Number(pagina) - 1) * Number(limite));

    return res.status(200).json({
      ok: true,
      seguidoresMutuos: usuarios,
      total: idsMutuos.length,
      paginacion: {
        total: idsMutuos.length,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(idsMutuos.length / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener seguidores mutuos:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener seguidores mutuos",
    });
  }
};

/**
 * Recalcular estadísticas de seguidores de un usuario
 * Este endpoint recalcula los contadores basándose en los registros reales
 * POST /api/seguidores/recalcular-estadisticas/:usuarioId
 */
export const recalcularEstadisticas = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Contar seguidores reales (usuarios que siguen a este usuario)
    const totalSeguidores = await Seguidor.countDocuments({
      seguido: usuarioId,
    });

    // Contar seguidos reales (usuarios que este usuario sigue)
    const totalSeguidos = await Seguidor.countDocuments({
      seguidor: usuarioId,
    });

    // Actualizar las estadísticas del usuario
    usuario.estadisticas.totalSeguidores = totalSeguidores;
    usuario.estadisticas.totalSeguidos = totalSeguidos;
    await usuario.save();

    console.log(`✅ Estadísticas recalculadas para usuario ${usuario.nick}:`);
    console.log(`   - Seguidores: ${totalSeguidores}`);
    console.log(`   - Seguidos: ${totalSeguidos}`);

    return res.status(200).json({
      ok: true,
      mensaje: "Estadísticas recalculadas correctamente",
      estadisticas: {
        totalSeguidores,
        totalSeguidos,
      },
    });
  } catch (error) {
    console.error("Error al recalcular estadísticas:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al recalcular estadísticas",
    });
  }
};

/**
 * Recalcular estadísticas de TODOS los usuarios
 * Este endpoint recalcula los contadores de todos los usuarios del sistema
 * POST /api/seguidores/recalcular-todas-estadisticas
 * (Solo para administradores)
 */
export const recalcularTodasEstadisticas = async (req, res) => {
  try {
    // Obtener todos los usuarios
    const usuarios = await Usuario.find({}).select("_id nick estadisticas");

    let actualizados = 0;

    for (const usuario of usuarios) {
      // Contar seguidores reales
      const totalSeguidores = await Seguidor.countDocuments({
        seguido: usuario._id,
      });

      // Contar seguidos reales
      const totalSeguidos = await Seguidor.countDocuments({
        seguidor: usuario._id,
      });

      // Actualizar solo si los valores cambiaron
      if (
        usuario.estadisticas.totalSeguidores !== totalSeguidores ||
        usuario.estadisticas.totalSeguidos !== totalSeguidos
      ) {
        usuario.estadisticas.totalSeguidores = totalSeguidores;
        usuario.estadisticas.totalSeguidos = totalSeguidos;
        await usuario.save();
        actualizados++;
        console.log(
          `✅ Actualizado ${usuario.nick}: ${totalSeguidores} seguidores, ${totalSeguidos} seguidos`
        );
      }
    }

    console.log(`🎉 Recalculadas estadísticas de ${actualizados} usuarios`);

    return res.status(200).json({
      ok: true,
      mensaje: `Estadísticas recalculadas correctamente para ${actualizados} usuarios`,
      totalUsuarios: usuarios.length,
      actualizados,
    });
  } catch (error) {
    console.error("Error al recalcular todas las estadísticas:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al recalcular estadísticas",
    });
  }
};
