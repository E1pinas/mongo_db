import { Usuario } from "../models/usuarioModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Album } from "../models/albumModels.js";
import { Playlist } from "../models/playlistModels.js";
import { Reporte } from "../models/reporteModels.js";
import { Comentario } from "../models/comentarioModels.js";
import { notificacionesModeracion } from "../helpers/moderacionNotificaciones.js";

/**
 * ========================================
 * GESTIÓN DE REPORTES
 * ========================================
 */

/**
 * Obtener todos los reportes con filtros
 */
export const obtenerReportes = async (req, res) => {
  try {
    const {
      estado,
      tipoContenido,
      prioridad,
      page = 1,
      limit = 20,
    } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (tipoContenido) filtros.tipoContenido = tipoContenido;
    if (prioridad) filtros.prioridad = prioridad;

    const skip = (page - 1) * limit;

    const [reportes, total] = await Promise.all([
      Reporte.find(filtros)
        .populate("reportadoPor", "nick nombreArtistico avatarUrl")
        .populate("resolucion.resueltoPor", "nick nombreArtistico")
        .sort({ prioridad: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Reporte.countDocuments(filtros),
    ]);

    // Obtener información del contenido reportado
    const reportesConDetalles = await Promise.all(
      reportes.map(async (reporte) => {
        let contenidoDetalle = null;

        try {
          switch (reporte.tipoContenido) {
            case "cancion":
              contenidoDetalle = await Cancion.findById(reporte.contenidoId)
                .select("titulo artistas portadaUrl")
                .populate("artistas", "nick nombreArtistico");
              break;
            case "album":
              contenidoDetalle = await Album.findById(reporte.contenidoId)
                .select("titulo artistas portadaUrl")
                .populate("artistas", "nick nombreArtistico");
              break;
            case "playlist":
              contenidoDetalle = await Playlist.findById(reporte.contenidoId)
                .select("nombre creador portadaUrl")
                .populate("creador", "nick nombreArtistico");
              break;
            case "usuario":
              contenidoDetalle = await Usuario.findById(
                reporte.contenidoId
              ).select(
                "nick nombreArtistico avatarUrl estaActivo suspendidoHasta"
              );
              break;
            case "comentario":
              contenidoDetalle = await Comentario.findById(reporte.contenidoId)
                .select("texto autor createdAt")
                .populate("autor", "nick nombreArtistico");
              break;
          }
        } catch (error) {
          console.error("Error al cargar contenido reportado:", error);
        }

        return {
          ...reporte.toObject(),
          contenidoDetalle,
        };
      })
    );

    res.status(200).json({
      status: "success",
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      reportes: reportesConDetalles,
    });
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener reportes",
    });
  }
};

/**
 * Obtener estadísticas de reportes
 */
export const obtenerEstadisticasReportes = async (req, res) => {
  try {
    const [
      totalReportes,
      pendientes,
      enRevision,
      resueltos,
      rechazados,
      porTipo,
      porPrioridad,
    ] = await Promise.all([
      Reporte.countDocuments(),
      Reporte.countDocuments({ estado: "pendiente" }),
      Reporte.countDocuments({ estado: "en_revision" }),
      Reporte.countDocuments({ estado: "resuelto" }),
      Reporte.countDocuments({ estado: "rechazado" }),
      Reporte.aggregate([
        { $group: { _id: "$tipoContenido", total: { $sum: 1 } } },
      ]),
      Reporte.aggregate([
        { $group: { _id: "$prioridad", total: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      status: "success",
      estadisticas: {
        total: totalReportes,
        porEstado: {
          pendiente: pendientes,
          en_revision: enRevision,
          resuelto: resueltos,
          rechazado: rechazados,
        },
        porTipo: porTipo.reduce((acc, item) => {
          acc[item._id] = item.total;
          return acc;
        }, {}),
        porPrioridad: porPrioridad.reduce((acc, item) => {
          acc[item._id] = item.total;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener estadísticas",
    });
  }
};

/**
 * Cambiar estado de un reporte
 */
export const cambiarEstadoReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, prioridad } = req.body;

    const reporte = await Reporte.findById(id);
    if (!reporte) {
      return res.status(404).json({
        status: "error",
        message: "Reporte no encontrado",
      });
    }

    if (estado) reporte.estado = estado;
    if (prioridad) reporte.prioridad = prioridad;

    await reporte.save();

    res.status(200).json({
      status: "success",
      message: "Estado del reporte actualizado",
      reporte,
    });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar reporte",
    });
  }
};

/**
 * Resolver un reporte con acción
 */
export const resolverReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion, nota, duracionSuspension } = req.body;

    const reporte = await Reporte.findById(id);
    if (!reporte) {
      return res.status(404).json({
        status: "error",
        message: "Reporte no encontrado",
      });
    }

    // Ejecutar la acción según el tipo
    switch (accion) {
      case "eliminar_contenido":
        await eliminarContenido(reporte.tipoContenido, reporte.contenidoId);
        break;

      case "suspender_usuario":
        if (reporte.tipoContenido === "usuario") {
          await suspenderUsuario(reporte.contenidoId, duracionSuspension);
        }
        break;

      case "banear_usuario":
        if (reporte.tipoContenido === "usuario") {
          await banearUsuario(reporte.contenidoId);
        }
        break;

      case "advertencia":
        // La advertencia se registra solo en el reporte
        break;

      case "ninguna":
        // No se toma acción
        break;
    }

    // Actualizar el reporte
    reporte.estado = "resuelto";
    reporte.resolucion = {
      accion,
      nota,
      resueltoPor: req.usuario.id,
      fechaResolucion: new Date(),
    };

    await reporte.save();

    res.status(200).json({
      status: "success",
      message: "Reporte resuelto exitosamente",
      reporte,
    });
  } catch (error) {
    console.error("Error al resolver reporte:", error);
    res.status(500).json({
      status: "error",
      message: "Error al resolver reporte",
    });
  }
};

/**
 * ========================================
 * GESTIÓN DE USUARIOS
 * ========================================
 */

/**
 * Obtener todos los usuarios con filtros
 */
export const obtenerUsuarios = async (req, res) => {
  try {
    const {
      buscar,
      role,
      estaActivo,
      suspendido,
      page = 1,
      limit = 20,
    } = req.query;

    const filtros = {};

    // Filtro de búsqueda por nombre, nick o email
    if (buscar) {
      filtros.$or = [
        { nick: { $regex: buscar, $options: "i" } },
        { nombreArtistico: { $regex: buscar, $options: "i" } },
        { email: { $regex: buscar, $options: "i" } },
        { nombre: { $regex: buscar, $options: "i" } },
      ];
    }

    if (role) filtros.role = role;
    if (estaActivo !== undefined) filtros.estaActivo = estaActivo === "true";
    if (suspendido === "true") {
      filtros.suspendidoHasta = { $gt: new Date() };
    }

    const skip = (page - 1) * limit;

    const [usuarios, total] = await Promise.all([
      Usuario.find(filtros)
        .select(
          "nick nombreArtistico email role estaActivo suspendidoHasta avatarUrl estadisticas createdAt ultimoIngreso"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Usuario.countDocuments(filtros),
    ]);

    res.status(200).json({
      status: "success",
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      usuarios,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener usuarios",
    });
  }
};

/**
 * Suspender usuario temporalmente
 */
export const suspenderUsuario = async (usuarioId, diasSuspension = 7) => {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) throw new Error("Usuario no encontrado");

  // No se puede suspender a admins o super_admin
  if (usuario.role === "admin" || usuario.role === "super_admin") {
    throw new Error("No se puede suspender a un administrador");
  }

  const fechaSuspension = new Date();
  fechaSuspension.setDate(fechaSuspension.getDate() + diasSuspension);

  usuario.suspendidoHasta = fechaSuspension;
  await usuario.save();

  return usuario;
};

/**
 * Banear usuario permanentemente
 */
export const banearUsuario = async (usuarioId) => {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) throw new Error("Usuario no encontrado");

  // No se puede banear a admins o super_admin
  if (usuario.role === "admin" || usuario.role === "super_admin") {
    throw new Error("No se puede banear a un administrador");
  }

  usuario.estaActivo = false;
  usuario.suspendidoHasta = null; // El baneo es permanente
  await usuario.save();

  return usuario;
};

/**
 * Reactivar usuario
 */
export const reactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    usuario.estaActivo = true;
    usuario.suspendidoHasta = null;
    await usuario.save();

    // Enviar notificación de reactivación
    await notificacionesModeracion.reactivacion(id);

    res.status(200).json({
      status: "success",
      message: "Usuario reactivado exitosamente",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        estaActivo: usuario.estaActivo,
        suspendidoHasta: usuario.suspendidoHasta,
      },
    });
  } catch (error) {
    console.error("Error al reactivar usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error al reactivar usuario",
    });
  }
};

/**
 * Suspender usuario (endpoint)
 */
export const suspenderUsuarioEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { dias = 7, razon } = req.body;

    const usuario = await suspenderUsuario(id, dias);

    // Enviar notificación al usuario
    await notificacionesModeracion.suspension(id, dias, razon);

    res.status(200).json({
      status: "success",
      message: `Usuario suspendido por ${dias} días`,
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        suspendidoHasta: usuario.suspendidoHasta,
      },
      razon,
    });
  } catch (error) {
    console.error("Error al suspender usuario:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Banear usuario (endpoint)
 */
export const banearUsuarioEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;

    const usuario = await banearUsuario(id);

    // Enviar notificación al usuario
    await notificacionesModeracion.baneo(id, razon);

    res.status(200).json({
      status: "success",
      message: "Usuario baneado permanentemente",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        estaActivo: usuario.estaActivo,
      },
      razon,
    });
  } catch (error) {
    console.error("Error al banear usuario:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * ========================================
 * GESTIÓN DE CONTENIDO
 * ========================================
 */

/**
 * Eliminar contenido según tipo
 */
const eliminarContenido = async (tipo, contenidoId) => {
  switch (tipo) {
    case "cancion":
      await Cancion.findByIdAndDelete(contenidoId);
      break;
    case "album":
      await Album.findByIdAndDelete(contenidoId);
      break;
    case "playlist":
      await Playlist.findByIdAndDelete(contenidoId);
      break;
    case "comentario":
      await Comentario.findByIdAndDelete(contenidoId);
      break;
    default:
      throw new Error("Tipo de contenido no válido");
  }
};

/**
 * Eliminar canción
 */
export const eliminarCancion = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;

    const cancion = await Cancion.findById(id).populate("artistas", "nick");
    if (!cancion) {
      return res.status(404).json({
        status: "error",
        message: "Canción no encontrada",
      });
    }

    const tituloCancion = cancion.titulo;
    const artistasIds = cancion.artistas.map((a) => a._id);

    await Cancion.findByIdAndDelete(id);

    // Notificar a los artistas
    for (const artistaId of artistasIds) {
      await notificacionesModeracion.contenidoEliminado(
        artistaId,
        "cancion",
        tituloCancion,
        razon
      );
    }

    res.status(200).json({
      status: "success",
      message: "Canción eliminada exitosamente",
      razon,
    });
  } catch (error) {
    console.error("Error al eliminar canción:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar canción",
    });
  }
};

/**
 * Eliminar álbum
 */
export const eliminarAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;

    const album = await Album.findById(id).populate("artistas", "nick");
    if (!album) {
      return res.status(404).json({
        status: "error",
        message: "Álbum no encontrado",
      });
    }

    const tituloAlbum = album.titulo;
    const artistasIds = album.artistas.map((a) => a._id);

    // Eliminar álbum y sus canciones
    await Album.findByIdAndDelete(id);
    await Cancion.deleteMany({ album: id });

    // Notificar a los artistas
    for (const artistaId of artistasIds) {
      await notificacionesModeracion.contenidoEliminado(
        artistaId,
        "album",
        tituloAlbum,
        razon
      );
    }

    res.status(200).json({
      status: "success",
      message: "Álbum y sus canciones eliminados exitosamente",
      razon,
    });
  } catch (error) {
    console.error("Error al eliminar álbum:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar álbum",
    });
  }
};

/**
 * Eliminar playlist
 */
export const eliminarPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;

    const playlist = await Playlist.findById(id).populate("creador", "nick");
    if (!playlist) {
      return res.status(404).json({
        status: "error",
        message: "Playlist no encontrada",
      });
    }

    const nombrePlaylist = playlist.nombre;
    const creadorId = playlist.creador._id;

    await Playlist.findByIdAndDelete(id);

    // Notificar al creador
    await notificacionesModeracion.contenidoEliminado(
      creadorId,
      "playlist",
      nombrePlaylist,
      razon
    );

    res.status(200).json({
      status: "success",
      message: "Playlist eliminada exitosamente",
      razon,
    });
  } catch (error) {
    console.error("Error al eliminar playlist:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar playlist",
    });
  }
};

/**
 * Eliminar comentario
 */
export const eliminarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;

    const comentario = await Comentario.findById(id).populate("autor", "nick");
    if (!comentario) {
      return res.status(404).json({
        status: "error",
        message: "Comentario no encontrado",
      });
    }

    const textoComentario = comentario.texto.substring(0, 50) + "...";
    const autorId = comentario.autor._id;

    await Comentario.findByIdAndDelete(id);

    // Notificar al autor
    await notificacionesModeracion.contenidoEliminado(
      autorId,
      "comentario",
      textoComentario,
      razon
    );

    res.status(200).json({
      status: "success",
      message: "Comentario eliminado exitosamente",
      razon,
    });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar comentario",
    });
  }
};

/**
 * ========================================
 * ESTADÍSTICAS GENERALES
 * ========================================
 */

/**
 * Obtener estadísticas de la plataforma
 */
export const obtenerEstadisticasPlataforma = async (req, res) => {
  try {
    const [
      totalUsuarios,
      usuariosActivos,
      usuariosSuspendidos,
      totalCanciones,
      totalAlbumes,
      totalPlaylists,
      totalReportes,
      reportesPendientes,
    ] = await Promise.all([
      Usuario.countDocuments({ role: "user" }),
      Usuario.countDocuments({ role: "user", estaActivo: true }),
      Usuario.countDocuments({
        role: "user",
        suspendidoHasta: { $gt: new Date() },
      }),
      Cancion.countDocuments(),
      Album.countDocuments(),
      Playlist.countDocuments(),
      Reporte.countDocuments(),
      Reporte.countDocuments({ estado: "pendiente" }),
    ]);

    // Usuarios registrados en los últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const nuevosUsuarios = await Usuario.countDocuments({
      createdAt: { $gte: hace30Dias },
    });

    res.status(200).json({
      status: "success",
      estadisticas: {
        usuarios: {
          total: totalUsuarios,
          activos: usuariosActivos,
          suspendidos: usuariosSuspendidos,
          nuevosUltimos30Dias: nuevosUsuarios,
        },
        contenido: {
          canciones: totalCanciones,
          albumes: totalAlbumes,
          playlists: totalPlaylists,
        },
        reportes: {
          total: totalReportes,
          pendientes: reportesPendientes,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener estadísticas",
    });
  }
};

/**
 * Obtener actividad reciente de la plataforma
 */
export const obtenerActividadReciente = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const [nuevosUsuarios, nuevasCanciones, nuevosReportes] = await Promise.all(
      [
        Usuario.find({ role: "user" })
          .select("nick nombreArtistico avatarUrl createdAt")
          .sort({ createdAt: -1 })
          .limit(Number(limit)),
        Cancion.find()
          .select("titulo artistas createdAt")
          .populate("artistas", "nick nombreArtistico")
          .sort({ createdAt: -1 })
          .limit(Number(limit)),
        Reporte.find({ estado: "pendiente" })
          .select("tipoContenido motivo createdAt")
          .populate("reportadoPor", "nick nombreArtistico")
          .sort({ createdAt: -1 })
          .limit(Number(limit)),
      ]
    );

    res.status(200).json({
      status: "success",
      actividad: {
        nuevosUsuarios,
        nuevasCanciones,
        nuevosReportes,
      },
    });
  } catch (error) {
    console.error("Error al obtener actividad:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener actividad reciente",
    });
  }
};
