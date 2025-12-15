// src/controllers/reporteController.js
import { Reporte } from "../models/reporteModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Album } from "../models/albumModels.js";
import { Playlist } from "../models/playlistModels.js";
import { Comentario } from "../models/comentarioModels.js";
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

    // Validar que el usuario no se reporte a sí mismo ni su propio contenido
    let esPropietario = false;

    try {
      switch (tipoContenido) {
        case "usuario":
          // No puede reportarse a sí mismo
          if (contenidoId === req.userId) {
            return sendError(res, "No puedes reportarte a ti mismo", 400);
          }
          break;

        case "cancion":
          const cancion = await Cancion.findById(contenidoId).select(
            "artistas"
          );
          if (!cancion) {
            return sendNotFound(res, "Canción no encontrada");
          }
          esPropietario = cancion.artistas.some(
            (artistaId) => artistaId.toString() === req.userId
          );
          if (esPropietario) {
            return sendError(res, "No puedes reportar tu propia canción", 400);
          }
          break;

        case "album":
          const album = await Album.findById(contenidoId).select("artistas");
          if (!album) {
            return sendNotFound(res, "Álbum no encontrado");
          }
          esPropietario = album.artistas.some(
            (artistaId) => artistaId.toString() === req.userId
          );
          if (esPropietario) {
            return sendError(res, "No puedes reportar tu propio álbum", 400);
          }
          break;

        case "playlist":
          const playlist = await Playlist.findById(contenidoId).select(
            "creador"
          );
          if (!playlist) {
            return sendNotFound(res, "Playlist no encontrada");
          }
          if (playlist.creador.toString() === req.userId) {
            return sendError(res, "No puedes reportar tu propia playlist", 400);
          }
          break;

        case "comentario":
          const comentario = await Comentario.findById(contenidoId).select(
            "autor"
          );
          if (!comentario) {
            return sendNotFound(res, "Comentario no encontrado");
          }
          if (comentario.autor.toString() === req.userId) {
            return sendError(
              res,
              "No puedes reportar tu propio comentario",
              400
            );
          }
          break;

        default:
          return sendError(res, "Tipo de contenido no válido", 400);
      }
    } catch (validationError) {
      console.error("Error al validar propietario:", validationError);
      return sendError(res, "Error al validar el contenido", 400);
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

    // Verificar si este contenido ya tiene reportes activos de otros usuarios
    const reportesActivos = await Reporte.countDocuments({
      tipoContenido,
      contenidoId,
      estado: { $in: ["pendiente", "en_revision"] },
    });

    if (reportesActivos > 0) {
      const mensajeTipo = tipoContenido === "usuario" 
        ? "Este usuario ya está reportado y está en revisión por un caso activo" 
        : "Este contenido ya está reportado y está en revisión por un caso activo";
      
      return sendError(res, mensajeTipo, 400);
    }

    // Obtener SOLO administradores regulares (NO super_admin) para distribuir equitativamente
    // El super_admin solo supervisa y gestiona a los admins, no modera reportes directamente
    const admins = await Usuario.find({
      role: "admin", // Solo admins regulares, NO super_admin
      estaActivo: true,
    }).select("_id");

    let asignadoA = null;
    if (admins.length > 0) {
      // Contar reportes pendientes/en_revision por cada admin
      const adminConMenosReportes = await Promise.all(
        admins.map(async (admin) => {
          const count = await Reporte.countDocuments({
            asignadoA: admin._id,
            estado: { $in: ["pendiente", "en_revision"] },
          });
          return { adminId: admin._id, count };
        })
      );

      // Asignar al admin con menos reportes activos
      adminConMenosReportes.sort((a, b) => a.count - b.count);
      asignadoA = adminConMenosReportes[0].adminId;
    }

    const reporte = await Reporte.create({
      reportadoPor: req.userId,
      tipoContenido,
      contenidoId,
      motivo,
      descripcion: descripcion?.trim() || "",
      asignadoA,
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
