import { Usuario } from "../models/usuarioModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Album } from "../models/albumModels.js";
import { Playlist } from "../models/playlistModels.js";
import { Reporte } from "../models/reporteModels.js";
import { Comentario } from "../models/comentarioModels.js";
import Post from "../models/postModels.js";
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

    // Si es admin (no super_admin), solo mostrar reportes asignados a él
    if (req.usuario.role === "admin") {
      filtros.asignadoA = req.usuario.id;
    }
    // Los super_admin ven todos los reportes

    const skip = (page - 1) * limit;

    const [reportes, total] = await Promise.all([
      Reporte.find(filtros)
        .populate("reportadoPor", "nick nombreArtistico avatarUrl")
        .populate("asignadoA", "nick nombreArtistico")
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
    // Filtro base según el rol
    const filtroBase = {};
    if (req.usuario.role === "admin") {
      filtroBase.asignadoA = req.usuario.id;
    }
    // super_admin ve todo

    const [
      totalReportes,
      pendientes,
      enRevision,
      resueltos,
      rechazados,
      porTipo,
      porPrioridad,
    ] = await Promise.all([
      Reporte.countDocuments(filtroBase),
      Reporte.countDocuments({ ...filtroBase, estado: "pendiente" }),
      Reporte.countDocuments({ ...filtroBase, estado: "en_revision" }),
      Reporte.countDocuments({ ...filtroBase, estado: "resuelto" }),
      Reporte.countDocuments({ ...filtroBase, estado: "rechazado" }),
      Reporte.aggregate([
        { $match: filtroBase },
        { $group: { _id: "$tipoContenido", total: { $sum: 1 } } },
      ]),
      Reporte.aggregate([
        { $match: filtroBase },
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

    let propietarioId = null;
    let nombreContenido = "contenido reportado";

    // Obtener el propietario del contenido reportado según el tipo
    try {
      switch (reporte.tipoContenido) {
        case "cancion":
          const cancion = await Cancion.findById(reporte.contenidoId).select(
            "artistas titulo"
          );
          if (cancion && cancion.artistas.length > 0) {
            propietarioId = cancion.artistas[0]; // Primer artista
            nombreContenido = cancion.titulo;
          }
          break;

        case "album":
          const album = await Album.findById(reporte.contenidoId).select(
            "artistas titulo"
          );
          if (album && album.artistas.length > 0) {
            propietarioId = album.artistas[0];
            nombreContenido = album.titulo;
          }
          break;

        case "playlist":
          const playlist = await Playlist.findById(reporte.contenidoId).select(
            "creador nombre"
          );
          if (playlist) {
            propietarioId = playlist.creador;
            nombreContenido = playlist.nombre;
          }
          break;

        case "comentario":
          const comentario = await Comentario.findById(
            reporte.contenidoId
          ).select("autor texto");
          if (comentario) {
            propietarioId = comentario.autor;
            nombreContenido =
              comentario.texto.substring(0, 50) +
              (comentario.texto.length > 50 ? "..." : "");
          }
          break;

        case "usuario":
          propietarioId = reporte.contenidoId;
          const usuario = await Usuario.findById(propietarioId).select("nick");
          nombreContenido = usuario ? `@${usuario.nick}` : "usuario";
          break;
      }
    } catch (error) {
      console.error("Error obteniendo propietario:", error);
    }

    // Obtener usuario propietario para sistema de vidas
    let propietario = null;
    if (propietarioId) {
      propietario = await Usuario.findById(propietarioId);
    }

    // Ejecutar la acción según el tipo
    switch (accion) {
      case "eliminar_contenido":
        await eliminarContenido(reporte.tipoContenido, reporte.contenidoId);

        // Restar 1 vida al propietario y registrar en historial
        if (propietario && propietario.role === "user") {
          propietario.vidas = Math.max(0, propietario.vidas - 1);
          propietario.historialConducta.push({
            fecha: new Date(),
            accion: "contenido_eliminado",
            tipoContenido: reporte.tipoContenido,
            nombreContenido,
            razon: nota || "Violación de políticas de la comunidad",
            vidasRestantes: propietario.vidas,
            moderador: req.usuario.id,
          });

          // Si llega a 0 vidas, banear automáticamente
          if (propietario.vidas === 0) {
            propietario.estaActivo = false;
            propietario.baneado = true;
            propietario.razonBaneo =
              "Cuenta desactivada por perder todas las vidas (múltiples violaciones)";
            await notificacionesModeracion.baneo(
              propietarioId,
              "Has perdido todas tus vidas por múltiples violaciones. Tu cuenta ha sido desactivada permanentemente."
            );
          } else {
            await propietario.save();
            await notificacionesModeracion.contenidoEliminado(
              propietarioId,
              reporte.tipoContenido,
              nombreContenido,
              `${nota || "Violación de políticas"}. Te quedan ${
                propietario.vidas
              } vida(s).`
            );
          }
        }
        break;

      case "suspender_usuario":
        // Suspender funcionalidades (no bloquea login)
        if (propietario && propietario.role === "user") {
          propietario.suspendido = true;
          propietario.razonSuspension =
            nota || "Suspensión por comportamiento inapropiado";
          propietario.puedeSubirContenido = false;
          propietario.vidas = Math.max(0, propietario.vidas - 1);

          propietario.historialConducta.push({
            fecha: new Date(),
            accion: "suspension",
            tipoContenido: reporte.tipoContenido,
            nombreContenido,
            razon: nota || "Suspensión por comportamiento inapropiado",
            vidasRestantes: propietario.vidas,
            moderador: req.usuario.id,
          });
          await propietario.save();
        }
        break;

      case "banear_usuario":
        // Banear permanentemente (bloquea login)
        if (propietario && propietario.role === "user") {
          propietario.baneado = true;
          propietario.razonBaneo = nota || "Cuenta baneada permanentemente";
          propietario.vidas = 0;
          propietario.estaConectado = false;

          propietario.historialConducta.push({
            fecha: new Date(),
            accion: "suspension",
            tipoContenido: reporte.tipoContenido,
            nombreContenido,
            razon: nota || "Cuenta baneada permanentemente",
            vidasRestantes: 0,
            moderador: req.usuario.id,
          });
          await propietario.save();
        }
        break;

      case "advertencia":
        // Advertencia NO resta vidas, solo registra en historial
        if (propietario && propietario.role === "user") {
          propietario.historialConducta.push({
            fecha: new Date(),
            accion: "advertencia",
            tipoContenido: reporte.tipoContenido,
            nombreContenido,
            razon: nota || "Advertencia por contenido reportado",
            vidasRestantes: propietario.vidas,
            moderador: req.usuario.id,
          });
          await propietario.save();
        }

        // Enviar advertencia al propietario
        if (propietarioId) {
          await notificacionesModeracion.advertencia(
            propietarioId,
            reporte.tipoContenido,
            nota || "Has recibido una advertencia por contenido reportado"
          );
        }
        break;

      case "ninguna":
        // No se toma acción, no se notifica al propietario
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
      filtros.suspendido = true;
    }

    const skip = (page - 1) * limit;

    const [usuarios, total] = await Promise.all([
      Usuario.find(filtros)
        .select(
          "nick nombreArtistico nombre apellidos email role estaActivo suspendido suspendidoHasta baneado razonSuspension razonBaneo avatarUrl estadisticas createdAt ultimoIngreso vidas"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Usuario.countDocuments(filtros),
    ]);

    // Calcular el estado de cada usuario
    const ahora = new Date();
    const usuariosConEstado = usuarios.map((usuario) => {
      const obj = usuario.toObject();

      // Verificar si la suspensión temporal ha expirado
      if (
        obj.suspendido &&
        obj.suspendidoHasta &&
        ahora > obj.suspendidoHasta
      ) {
        obj.suspendido = false;
        obj.suspendidoHasta = null;
        obj.razonSuspension = null;
      }

      if (obj.baneado) {
        obj.estado = "baneado";
      } else if (obj.suspendido) {
        obj.estado = "suspendido";
      } else {
        obj.estado = "activo";
      }
      return obj;
    });

    res.status(200).json({
      status: "success",
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      usuarios: usuariosConEstado,
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
 * Buscar usuarios para administración (incluye todos los datos necesarios)
 */
export const buscarUsuariosAdmin = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: "error",
        message: "La búsqueda debe tener al menos 2 caracteres",
      });
    }

    const searchQuery = q.trim().replace(/^@/, "");
    const regex = new RegExp(searchQuery, "i");

    // Buscar por nick, nombreArtistico, nombre o email - INCLUYE TODOS los usuarios
    const usuarios = await Usuario.find({
      $or: [
        { nick: regex },
        { nombreArtistico: regex },
        { nombre: regex },
        { email: regex },
      ],
    })
      .select(
        "nick nombreArtistico nombre apellidos email role estaActivo suspendido suspendidoHasta baneado razonSuspension razonBaneo avatarUrl estadisticas createdAt vidas"
      )
      .limit(50);

    // Calcular el estado de cada usuario
    const ahora = new Date();
    const usuariosConEstado = usuarios.map((usuario) => {
      const obj = usuario.toObject();

      // Verificar si la suspensión temporal ha expirado
      if (
        obj.suspendido &&
        obj.suspendidoHasta &&
        ahora > obj.suspendidoHasta
      ) {
        obj.suspendido = false;
        obj.suspendidoHasta = null;
        obj.razonSuspension = null;
      }

      if (obj.baneado) {
        obj.estado = "baneado";
      } else if (obj.suspendido) {
        obj.estado = "suspendido";
      } else {
        obj.estado = "activo";
      }
      return obj;
    });

    res.status(200).json({
      status: "success",
      total: usuariosConEstado.length,
      usuarios: usuariosConEstado,
    });
  } catch (error) {
    console.error("Error en búsqueda de usuarios admin:", error);
    res.status(500).json({
      status: "error",
      message: "Error al buscar usuarios",
    });
  }
};

/**
 * Suspender usuario (desactivar funcionalidades, no bloquea login)
 */
export const suspenderUsuario = async (
  usuarioId,
  razon = "Violación de normas"
) => {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) throw new Error("Usuario no encontrado");

  // No se puede suspender a admins o super_admin
  if (usuario.role === "admin" || usuario.role === "super_admin") {
    throw new Error("No se puede suspender a un administrador");
  }

  usuario.suspendido = true;
  usuario.razonSuspension = razon;
  usuario.puedeSubirContenido = false;
  await usuario.save();

  return usuario;
};

/**
 * Banear usuario permanentemente (bloquea login)
 */
export const banearUsuario = async (
  usuarioId,
  razon = "Violación grave de términos"
) => {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) throw new Error("Usuario no encontrado");

  // No se puede banear a admins o super_admin
  if (usuario.role === "admin" || usuario.role === "super_admin") {
    throw new Error("No se puede banear a un administrador");
  }

  usuario.baneado = true;
  usuario.razonBaneo = razon;
  usuario.estaConectado = false;
  await usuario.save();

  return usuario;
};

/**
 * Reactivar usuario (quitar suspensión)
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

    // Reactivar funcionalidades (solo quitar suspensión, NO baneo)
    usuario.suspendido = false;
    usuario.suspendidoHasta = null;
    usuario.razonSuspension = null;
    usuario.puedeSubirContenido = true;

    // Agregar al historial de conducta
    console.log("🔍 req.usuario en reactivar:", req.usuario);
    console.log("🔍 req.usuario.id:", req.usuario?.id);
    usuario.historialConducta.push({
      fecha: new Date(),
      accion: "vida_restaurada",
      tipoContenido: "usuario",
      nombreContenido: usuario.nick,
      razon: "Reactivación por administrador",
      vidasRestantes: usuario.vidas,
      moderador: req.usuario.id,
    });

    await usuario.save();

    // Enviar notificación de reactivación
    try {
      await notificacionesModeracion.reactivacion(id);
    } catch (error) {
      console.log("Error enviando notificación:", error);
    }

    res.status(200).json({
      status: "success",
      message: "Usuario reactivado exitosamente. Suspensión eliminada",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        suspendido: false,
        puedeSubirContenido: true,
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
    const { razon = "Violación de normas comunitarias" } = req.body;

    const usuario = await suspenderUsuario(id, razon);

    // Enviar notificación al usuario
    try {
      await notificacionesModeracion.suspension(id, 0, razon);
    } catch (error) {
      console.log("Error enviando notificación:", error);
    }

    res.status(200).json({
      status: "success",
      message: "Usuario suspendido. Funcionalidades desactivadas",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        suspendido: true,
        razonSuspension: razon,
      },
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
    const { razon = "Violación grave de términos de servicio" } = req.body;

    const usuario = await banearUsuario(id, razon);

    // Enviar notificación al usuario
    try {
      await notificacionesModeracion.baneo(id, razon);
    } catch (error) {
      console.log("Error enviando notificación:", error);
    }

    res.status(200).json({
      status: "success",
      message: "Usuario baneado permanentemente. No podrá iniciar sesión",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        baneado: true,
        razonBaneo: razon,
      },
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
      // Eliminar canción y limpiar todas sus referencias
      await Cancion.findByIdAndDelete(contenidoId);

      // Eliminar de todos los álbumes
      await Album.updateMany(
        { canciones: contenidoId },
        { $pull: { canciones: contenidoId } }
      );

      // Eliminar de todas las playlists
      await Playlist.updateMany(
        { canciones: contenidoId },
        { $pull: { canciones: contenidoId } }
      );

      // Eliminar de biblioteca de usuarios
      await Usuario.updateMany(
        { misCanciones: contenidoId },
        { $pull: { misCanciones: contenidoId } }
      );

      // Marcar posts relacionados como eliminados
      await Post.updateMany(
        { tipo: "repost_cancion", recursoId: contenidoId },
        { estaEliminado: true }
      );
      break;

    case "album":
      await Album.findByIdAndDelete(contenidoId);

      // Eliminar de biblioteca de usuarios
      await Usuario.updateMany(
        { misAlbumes: contenidoId },
        { $pull: { misAlbumes: contenidoId } }
      );

      // Marcar posts relacionados como eliminados
      await Post.updateMany(
        { tipo: "repost_album", recursoId: contenidoId },
        { estaEliminado: true }
      );
      break;

    case "playlist":
      await Playlist.findByIdAndDelete(contenidoId);

      // Marcar posts relacionados como eliminados
      await Post.updateMany(
        { tipo: "repost_playlist", recursoId: contenidoId },
        { estaEliminado: true }
      );
      break;

    case "comentario":
      await Comentario.findByIdAndDelete(contenidoId);
      break;

    case "post":
      // Marcar el post como eliminado en lugar de borrarlo completamente
      await Post.findByIdAndUpdate(contenidoId, { estaEliminado: true });
      break;

    default:
      throw new Error("Tipo de contenido no válido");
  }
};

/**
 * Eliminar canción
 */
/**
 * Ocultar canción (no eliminar, solo hacer que no se pueda reproducir)
 */
export const ocultarCancion = async (req, res) => {
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

    // Marcar como oculta
    cancion.oculta = true;
    cancion.razonOculta = razon || "Violación de normas comunitarias";
    cancion.ocultadaPor = req.usuario._id;
    cancion.fechaOculta = new Date();
    await cancion.save();

    const tituloCancion = cancion.titulo;
    const artistasIds =
      cancion.artistas && cancion.artistas.length > 0
        ? cancion.artistas.map((a) => a._id)
        : [];

    // Notificar a los artistas si existen
    if (artistasIds.length > 0) {
      for (const artistaId of artistasIds) {
        try {
          await notificacionesModeracion.cancionOculta(
            artistaId,
            tituloCancion,
            razon || "Violación de normas comunitarias"
          );
        } catch (notifError) {
          console.error(
            "Error enviando notificación a artista:",
            artistaId,
            notifError
          );
          // No fallar la operación si falla la notificación
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Canción ocultada exitosamente. No se podrá reproducir.",
      cancion: {
        _id: cancion._id,
        titulo: cancion.titulo,
        oculta: cancion.oculta,
        razonOculta: cancion.razonOculta,
      },
    });
  } catch (error) {
    console.error("Error al ocultar canción:", error);
    res.status(500).json({
      status: "error",
      message: "Error al ocultar canción",
      error: error.message,
    });
  }
};

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

    // Eliminar de todos los álbumes
    await Album.updateMany({ canciones: id }, { $pull: { canciones: id } });

    // Eliminar de todas las playlists
    await Playlist.updateMany({ canciones: id }, { $pull: { canciones: id } });

    // Eliminar de biblioteca de usuarios
    await Usuario.updateMany(
      { misCanciones: id },
      { $pull: { misCanciones: id } }
    );

    // Marcar posts relacionados como eliminados
    await Post.updateMany(
      { tipo: "repost_cancion", recursoId: id },
      { estaEliminado: true }
    );

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
 * Quitar ocultamiento de canción
 */
export const mostrarCancion = async (req, res) => {
  try {
    const { id } = req.params;

    const cancion = await Cancion.findById(id);
    if (!cancion) {
      return res.status(404).json({
        status: "error",
        message: "Canción no encontrada",
      });
    }

    if (!cancion.oculta) {
      return res.status(400).json({
        status: "error",
        message: "Esta canción no está oculta",
      });
    }

    // Limpiar campos de ocultamiento
    cancion.oculta = false;
    cancion.razonOculta = null;
    cancion.ocultadaPor = null;
    cancion.fechaOculta = null;
    await cancion.save();

    res.status(200).json({
      status: "success",
      message: "Canción visible nuevamente",
      cancion: {
        id: cancion._id,
        titulo: cancion.titulo,
        oculta: cancion.oculta,
      },
    });
  } catch (error) {
    console.error("Error al quitar ocultamiento:", error);
    res.status(500).json({
      status: "error",
      message: "Error al quitar ocultamiento",
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

    // Eliminar solo el álbum, NO las canciones (las canciones son independientes)
    await Album.findByIdAndDelete(id);

    // Quitar la referencia del álbum en las canciones que lo tenían asignado
    await Cancion.updateMany({ album: id }, { $unset: { album: "" } });

    // Eliminar de biblioteca de usuarios
    await Usuario.updateMany({ misAlbumes: id }, { $pull: { misAlbumes: id } });

    // Marcar posts relacionados como eliminados
    await Post.updateMany(
      { tipo: "repost_album", recursoId: id },
      { estaEliminado: true }
    );

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
      message: "Álbum eliminado exitosamente (canciones preservadas)",
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

    // Marcar posts relacionados como eliminados
    await Post.updateMany(
      { tipo: "repost_playlist", recursoId: id },
      { estaEliminado: true }
    );

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

/**
 * Cambiar prioridad de un reporte
 */
export const cambiarPrioridad = async (req, res) => {
  try {
    const { id } = req.params;
    const { prioridad } = req.body;

    // Validar que la prioridad sea válida
    const prioridadesValidas = ["baja", "media", "alta", "urgente"];
    if (!prioridadesValidas.includes(prioridad)) {
      return res.status(400).json({
        status: "error",
        message: "Prioridad inválida. Debe ser: baja, media, alta o urgente",
      });
    }

    const reporte = await Reporte.findById(id);
    if (!reporte) {
      return res.status(404).json({
        status: "error",
        message: "Reporte no encontrado",
      });
    }

    // Actualizar la prioridad
    reporte.prioridad = prioridad;
    await reporte.save();

    res.status(200).json({
      status: "success",
      message: `Prioridad cambiada a ${prioridad}`,
      reporte,
    });
  } catch (error) {
    console.error("Error al cambiar prioridad:", error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar prioridad del reporte",
    });
  }
};

/**
 * Buscar contenido (canciones, álbumes, playlists) para panel de administración
 */
export const buscarContenido = async (req, res) => {
  try {
    const { q, tipo } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: "error",
        message: "La búsqueda debe tener al menos 2 caracteres",
      });
    }

    const regex = new RegExp(q.trim(), "i");
    let resultado = {};

    if (tipo === "canciones") {
      const canciones = await Cancion.find({
        titulo: regex,
      })
        .populate("artistas", "nick nombreArtistico avatarUrl")
        .populate("album", "titulo portadaUrl")
        .select(
          "titulo artistas portadaUrl audioUrl duracionSegundos reproduccionesTotales likes oculta razonOculta esExplicita createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(50);

      resultado.canciones = canciones;
    } else if (tipo === "albumes") {
      const albumes = await Album.find({
        titulo: regex,
      })
        .populate("artistas", "nick nombreArtistico avatarUrl")
        .select(
          "titulo descripcion portadaUrl generos fechaLanzamiento canciones createdAt artistas"
        )
        .sort({ createdAt: -1 })
        .limit(50);

      resultado.albumes = albumes;
    } else if (tipo === "playlists") {
      const playlists = await Playlist.find({
        titulo: regex,
      })
        .populate("creador", "nick nombreArtistico avatarUrl")
        .select(
          "titulo descripcion portadaUrl canciones esPublica createdAt creador"
        )
        .sort({ createdAt: -1 })
        .limit(50);

      resultado.playlists = playlists;
    } else {
      return res.status(400).json({
        status: "error",
        message:
          "Tipo de contenido inválido. Debe ser: canciones, albumes o playlists",
      });
    }

    res.status(200).json({
      status: "success",
      ...resultado,
    });
  } catch (error) {
    console.error("Error al buscar contenido:", error);
    res.status(500).json({
      status: "error",
      message: "Error al buscar contenido",
    });
  }
};
