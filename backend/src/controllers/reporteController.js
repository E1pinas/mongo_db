// src/controllers/reporteController.js
import { Reporte } from "../models/reporteModels.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendServerError,
  sendCreated,
} from "../helpers/responseHelpers.js";
import { validateRequired } from "../helpers/validationHelpers.js";

/**
 * Crear un reporte
 * POST /api/reportes
 * Body: { tipoContenido, contenidoId, motivo, descripcion }
 */
export const crearReporte = async (req, res) => {
  try {
    const { tipoContenido, contenidoId, motivo, descripcion } = req.body;

    const errors = validateRequired({ tipoContenido, contenidoId, motivo });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    // Verificar si ya existe un reporte pendiente del mismo usuario para el mismo contenido
    const reporteExistente = await Reporte.findOne({
      reportadoPor: req.userId,
      tipoContenido,
      contenidoId,
      estado: { $in: ["pendiente", "en_revision"] },
    });

    if (reporteExistente) {
      return sendError(
        res,
        "Ya tienes un reporte pendiente para este contenido",
        400
      );
    }

    const reporte = await Reporte.create({
      reportadoPor: req.userId,
      tipoContenido,
      contenidoId,
      motivo,
      descripcion: descripcion?.trim() || "",
    });

    return sendCreated(res, {
      mensaje: "Reporte creado correctamente. Será revisado por un moderador",
      reporte,
    });
  } catch (error) {
    console.error("Error al crear reporte:", error);
    return sendServerError(res, error, "Error al crear el reporte");
  }
};

/**
 * Obtener mis reportes
 * GET /api/reportes/mis-reportes
 */
export const obtenerMisReportes = async (req, res) => {
  try {
    const { estado, pagina = 1, limite = 20 } = req.query;

    const filtro = { reportadoPor: req.userId };
    if (estado) {
      filtro.estado = estado;
    }

    const reportes = await Reporte.find(filtro)
      .sort({ createdAt: -1 })
      .limit(Number(limite))
      .skip((Number(pagina) - 1) * Number(limite));

    const total = await Reporte.countDocuments(filtro);

    return sendSuccess(res, {
      reportes,
      paginacion: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return sendServerError(res, error, "Error al obtener reportes");
  }
};

/**
 * Obtener todos los reportes (ADMIN)
 * GET /api/reportes/admin
 */
export const obtenerTodosReportes = async (req, res) => {
  try {
    const {
      estado,
      prioridad,
      tipoContenido,
      pagina = 1,
      limite = 50,
    } = req.query;

    const filtro = {};
    if (estado) filtro.estado = estado;
    if (prioridad) filtro.prioridad = prioridad;
    if (tipoContenido) filtro.tipoContenido = tipoContenido;

    const reportes = await Reporte.find(filtro)
      .populate("reportadoPor", "nick email avatarUrl")
      .sort({ prioridad: -1, createdAt: -1 })
      .limit(Number(limite))
      .skip((Number(pagina) - 1) * Number(limite));

    const total = await Reporte.countDocuments(filtro);

    // Estadísticas rápidas
    const estadisticas = {
      pendientes: await Reporte.countDocuments({ estado: "pendiente" }),
      enRevision: await Reporte.countDocuments({ estado: "en_revision" }),
      resueltos: await Reporte.countDocuments({ estado: "resuelto" }),
      rechazados: await Reporte.countDocuments({ estado: "rechazado" }),
    };

    return sendSuccess(res, {
      reportes,
      estadisticas,
      paginacion: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return sendServerError(res, error, "Error al obtener reportes");
  }
};

/**
 * Actualizar estado de un reporte (ADMIN)
 * PATCH /api/reportes/:id/estado
 * Body: { estado, prioridad }
 */
export const actualizarEstadoReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, prioridad } = req.body;

    const reporte = await Reporte.findById(id);
    if (!reporte) {
      return sendNotFound(res, "Reporte");
    }

    if (estado) reporte.estado = estado;
    if (prioridad) reporte.prioridad = prioridad;

    await reporte.save();

    return sendSuccess(res, {
      mensaje: "Reporte actualizado correctamente",
      reporte,
    });
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return sendServerError(res, error, "Error al actualizar reporte");
  }
};

/**
 * Resolver un reporte (ADMIN)
 * PATCH /api/reportes/:id/resolver
 * Body: { accion, nota }
 */
export const resolverReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion, nota } = req.body;

    const errors = validateRequired({ accion });
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const reporte = await Reporte.findById(id);
    if (!reporte) {
      return sendNotFound(res, "Reporte");
    }

    reporte.estado = "resuelto";
    reporte.resolucion = {
      accion,
      nota: nota || "",
      resueltoPor: req.userId,
      fechaResolucion: new Date(),
    };

    await reporte.save();

    return sendSuccess(res, {
      mensaje: "Reporte resuelto correctamente",
      reporte,
    });
  } catch (error) {
    console.error("Error al resolver reporte:", error);
    return sendServerError(res, error, "Error al resolver reporte");
  }
};

/**
 * Obtener reportes de un contenido específico (ADMIN)
 * GET /api/reportes/contenido/:tipo/:id
 */
export const obtenerReportesContenido = async (req, res) => {
  try {
    const { tipo, id } = req.params;

    const reportes = await Reporte.find({
      tipoContenido: tipo,
      contenidoId: id,
    })
      .populate("reportadoPor", "nick email")
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      total: reportes.length,
      reportes,
    });
  } catch (error) {
    console.error("Error al obtener reportes de contenido:", error);
    return sendServerError(res, error, "Error al obtener reportes");
  }
};
