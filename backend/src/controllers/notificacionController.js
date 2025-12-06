import { Notificacion } from "../models/notificacionModels.js";

// 📌 Obtener notificaciones del usuario (excluyendo las ocultas)
export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { page = 1, limit = 20, soloNoLeidas = false } = req.query;

    const filtro = {
      usuarioDestino: usuarioId,
      oculta: false, // No mostrar notificaciones ocultas (de usuarios bloqueados)
    };

    if (soloNoLeidas === "true") {
      filtro.leida = false;
    }

    const notificaciones = await Notificacion.find(filtro)
      .populate({
        path: "usuarioOrigen",
        select: "nick nombreArtistico avatarUrl",
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notificacion.countDocuments(filtro);
    const noLeidas = await Notificacion.countDocuments({
      usuarioDestino: usuarioId,
      leida: false,
      oculta: false,
    });

    return res.status(200).json({
      ok: true,
      notificaciones,
      paginacion: {
        total,
        noLeidas,
        pagina: parseInt(page),
        limite: parseInt(limit),
        totalPaginas: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error en obtenerNotificaciones:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener notificaciones",
    });
  }
};

// 📌 Marcar notificación como leída
export const marcarComoLeida = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { notificacionId } = req.params;

    const notificacion = await Notificacion.findOneAndUpdate(
      {
        _id: notificacionId,
        usuarioDestino: usuarioId,
      },
      { $set: { leida: true } },
      { new: true }
    );

    if (!notificacion) {
      return res.status(404).json({
        ok: false,
        message: "Notificación no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Notificación marcada como leída",
      notificacion,
    });
  } catch (error) {
    console.error("Error en marcarComoLeida:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al marcar notificación",
    });
  }
};

// 📌 Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const resultado = await Notificacion.updateMany(
      {
        usuarioDestino: usuarioId,
        leida: false,
        oculta: false,
      },
      { $set: { leida: true } }
    );

    return res.status(200).json({
      ok: true,
      message: `${resultado.modifiedCount} notificaciones marcadas como leídas`,
    });
  } catch (error) {
    console.error("Error en marcarTodasComoLeidas:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al marcar notificaciones",
    });
  }
};

// 📌 Eliminar una notificación
export const eliminarNotificacion = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { notificacionId } = req.params;

    const notificacion = await Notificacion.findOneAndDelete({
      _id: notificacionId,
      usuarioDestino: usuarioId,
    });

    if (!notificacion) {
      return res.status(404).json({
        ok: false,
        message: "Notificación no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Notificación eliminada",
    });
  } catch (error) {
    console.error("Error en eliminarNotificacion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar notificación",
    });
  }
};

// 📌 Obtener contador de notificaciones no leídas
export const obtenerContadorNoLeidas = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const count = await Notificacion.countDocuments({
      usuarioDestino: usuarioId,
      leida: false,
      oculta: false,
    });

    return res.status(200).json({
      ok: true,
      noLeidas: count,
    });
  } catch (error) {
    console.error("Error en obtenerContadorNoLeidas:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener contador",
    });
  }
};
