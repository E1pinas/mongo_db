// src/controllers/reproduccionController.js
import { Reproduccion } from "../models/reproduccionModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Usuario } from "../models/usuarioModels.js";

/**
 * Registrar reproducción de una canción
 * POST /api/reproducciones
 * Body: { cancionId }
 */
export const registrarReproduccion = async (req, res) => {
  try {
    const { cancionId } = req.body;

    if (!cancionId) {
      return res.status(400).json({
        ok: false,
        mensaje: "El cancionId es obligatorio",
      });
    }

    const cancion = await Cancion.findById(cancionId).populate(
      "artistas",
      "nick nombreArtistico avatarUrl"
    );
    if (!cancion) {
      return res.status(404).json({
        ok: false,
        mensaje: "Canción no encontrada",
      });
    }

    // Registrar reproducción
    const reproduccion = await Reproduccion.create({
      usuario: req.userId,
      cancion: cancionId,
      artista: cancion.artistas[0]._id, // Primer artista
      album: cancion.album || null,
    });

    // Incrementar contador en la canción
    cancion.reproducciones += 1;
    await cancion.save();

    // Actualizar estadísticas del usuario
    const usuario = await Usuario.findById(req.userId);
    if (usuario) {
      usuario.estadisticas.totalCancionesEscuchadas += 1;
      usuario.estadisticas.tiempoTotalEscuchado +=
        cancion.duracionSegundos / 60; // En minutos

      // Agregar al historial (mantener últimas 50)
      usuario.historialReproducciones.unshift({
        cancion: cancionId,
        fecha: new Date(),
      });
      if (usuario.historialReproducciones.length > 50) {
        usuario.historialReproducciones.pop();
      }

      await usuario.save();
    }

    return res.status(201).json({
      ok: true,
      mensaje: "Reproducción registrada",
      reproduccion,
    });
  } catch (error) {
    console.error("Error al registrar reproducción:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al registrar reproducción",
    });
  }
};

/**
 * Obtener historial de reproducciones del usuario
 * GET /api/reproducciones/historial
 */
export const obtenerHistorialReproduccion = async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query;

    const reproducciones = await Reproduccion.find({ usuario: req.userId })
      .populate("cancion", "titulo audioUrl portadaUrl duracionSegundos")
      .populate("artista", "nick nombre avatarUrl")
      .populate("album", "titulo portadaUrl")
      .sort({ createdAt: -1 })
      .limit(Number(limite))
      .skip((Number(pagina) - 1) * Number(limite));

    const total = await Reproduccion.countDocuments({ usuario: req.userId });

    return res.status(200).json({
      ok: true,
      reproducciones,
      paginacion: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener historial",
    });
  }
};

/**
 * Obtener canciones más escuchadas del usuario
 * GET /api/reproducciones/top-canciones
 */
export const obtenerTopCanciones = async (req, res) => {
  try {
    const { limite = 10, periodo = "mes" } = req.query;

    // Calcular fecha límite según periodo
    const fechaLimite = new Date();
    switch (periodo) {
      case "semana":
        fechaLimite.setDate(fechaLimite.getDate() - 7);
        break;
      case "mes":
        fechaLimite.setMonth(fechaLimite.getMonth() - 1);
        break;
      case "año":
        fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
        break;
      default:
        fechaLimite.setMonth(fechaLimite.getMonth() - 1);
    }

    const topCanciones = await Reproduccion.aggregate([
      {
        $match: {
          usuario: req.userId,
          createdAt: { $gte: fechaLimite },
        },
      },
      {
        $group: {
          _id: "$cancion",
          totalReproducciones: { $sum: 1 },
        },
      },
      { $sort: { totalReproducciones: -1 } },
      { $limit: Number(limite) },
      {
        $lookup: {
          from: "cancions",
          localField: "_id",
          foreignField: "_id",
          as: "cancion",
        },
      },
      { $unwind: "$cancion" },
      {
        $lookup: {
          from: "usuarios",
          localField: "cancion.artistas",
          foreignField: "_id",
          as: "artistas",
        },
      },
      {
        $project: {
          _id: 0,
          cancionId: "$_id",
          titulo: "$cancion.titulo",
          portadaUrl: "$cancion.portadaUrl",
          audioUrl: "$cancion.audioUrl",
          duracionSegundos: "$cancion.duracionSegundos",
          artistas: { nick: 1, nombre: 1, avatarUrl: 1 },
          totalReproducciones: 1,
        },
      },
    ]);

    return res.status(200).json({
      ok: true,
      periodo,
      topCanciones,
    });
  } catch (error) {
    console.error("Error al obtener top canciones:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener top canciones",
    });
  }
};

/**
 * Obtener artistas más escuchados del usuario
 * GET /api/reproducciones/top-artistas
 */
export const obtenerTopArtistas = async (req, res) => {
  try {
    const { limite = 10, periodo = "mes" } = req.query;

    const fechaLimite = new Date();
    switch (periodo) {
      case "semana":
        fechaLimite.setDate(fechaLimite.getDate() - 7);
        break;
      case "mes":
        fechaLimite.setMonth(fechaLimite.getMonth() - 1);
        break;
      case "año":
        fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
        break;
      default:
        fechaLimite.setMonth(fechaLimite.getMonth() - 1);
    }

    const topArtistas = await Reproduccion.aggregate([
      {
        $match: {
          usuario: req.userId,
          createdAt: { $gte: fechaLimite },
        },
      },
      {
        $group: {
          _id: "$artista",
          totalReproducciones: { $sum: 1 },
        },
      },
      { $sort: { totalReproducciones: -1 } },
      { $limit: Number(limite) },
      {
        $lookup: {
          from: "usuarios",
          localField: "_id",
          foreignField: "_id",
          as: "artista",
        },
      },
      { $unwind: "$artista" },
      {
        $project: {
          _id: 0,
          artistaId: "$_id",
          nick: "$artista.nick",
          nombre: "$artista.nombre",
          avatarUrl: "$artista.avatarUrl",
          totalReproducciones: 1,
        },
      },
    ]);

    return res.status(200).json({
      ok: true,
      periodo,
      topArtistas,
    });
  } catch (error) {
    console.error("Error al obtener top artistas:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener top artistas",
    });
  }
};

/**
 * Limpiar historial de reproducciones
 * DELETE /api/reproducciones/historial
 */
export const limpiarHistorial = async (req, res) => {
  try {
    await Reproduccion.deleteMany({ usuario: req.userId });

    // Limpiar también del usuario
    const usuario = await Usuario.findById(req.userId);
    if (usuario) {
      usuario.historialReproducciones = [];
      usuario.estadisticas.totalCancionesEscuchadas = 0;
      usuario.estadisticas.tiempoTotalEscuchado = 0;
      await usuario.save();
    }

    return res.status(200).json({
      ok: true,
      mensaje: "Historial limpiado correctamente",
    });
  } catch (error) {
    console.error("Error al limpiar historial:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al limpiar historial",
    });
  }
};
