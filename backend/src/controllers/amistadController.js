import { Amistad } from "../models/amistadModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Notificacion } from "../models/notificacionModels.js";

// 📌 Enviar solicitud de amistad
export const enviarSolicitudAmistad = async (req, res) => {
  try {
    const solicitanteId = req.userId;
    const { usuarioId } = req.params;

    console.log("📨 Backend: Recibiendo solicitud");
    console.log("📨 Backend: usuarioId del parámetro:", usuarioId);
    console.log("📨 Backend: solicitanteId (usuario actual):", solicitanteId);

    // Validar que no sea el mismo usuario
    if (solicitanteId === usuarioId) {
      return res.status(400).json({
        ok: false,
        message: "No puedes enviarte solicitud de amistad a ti mismo",
      });
    }

    // Verificar que el receptor exista
    const receptor = await Usuario.findById(usuarioId);
    if (!receptor) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el receptor acepta solicitudes de amistad
    if (receptor.privacy?.recibirSolicitudesAmistad === false) {
      return res.status(403).json({
        ok: false,
        message: "Este usuario no acepta solicitudes de amistad",
      });
    }

    // Verificar si ya existe una solicitud
    const solicitudExistente = await Amistad.findOne({
      $or: [
        { solicitante: solicitanteId, receptor: usuarioId },
        { solicitante: usuarioId, receptor: solicitanteId },
      ],
    });

    if (solicitudExistente) {
      if (solicitudExistente.estado === "bloqueada") {
        return res.status(403).json({
          ok: false,
          message: "No puedes enviar solicitud a este usuario",
        });
      }

      if (solicitudExistente.estado === "aceptada") {
        return res.status(400).json({
          ok: false,
          message: "Ya son amigos",
        });
      }

      if (solicitudExistente.estado === "pendiente") {
        return res.status(400).json({
          ok: false,
          message: "Ya existe una solicitud pendiente",
        });
      }
    }

    // Crear nueva solicitud
    const nuevaSolicitud = new Amistad({
      solicitante: solicitanteId,
      receptor: usuarioId,
      estado: "pendiente",
    });

    await nuevaSolicitud.save();

    // Crear notificación para el receptor
    const solicitante = await Usuario.findById(solicitanteId);
    await Notificacion.create({
      usuarioDestino: usuarioId,
      usuarioOrigen: solicitanteId,
      tipo: "solicitud_amistad",
      mensaje: `${solicitante.nick} te ha enviado una solicitud de amistad`,
      recurso: {
        tipo: "user",
        id: solicitanteId,
      },
    });

    return res.status(201).json({
      ok: true,
      message: "Solicitud de amistad enviada",
      solicitud: nuevaSolicitud,
    });
  } catch (error) {
    console.error("Error en enviarSolicitudAmistad:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al enviar solicitud de amistad",
    });
  }
};

// 📌 Aceptar solicitud de amistad
export const aceptarSolicitudAmistad = async (req, res) => {
  try {
    const receptorId = req.userId;
    const { solicitudId } = req.params;

    const solicitud = await Amistad.findById(solicitudId);

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        message: "Solicitud no encontrada",
      });
    }

    // Verificar que el usuario sea el receptor
    if (solicitud.receptor.toString() !== receptorId) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para aceptar esta solicitud",
      });
    }

    if (solicitud.estado !== "pendiente") {
      return res.status(400).json({
        ok: false,
        message: "Esta solicitud ya ha sido procesada",
      });
    }

    // Actualizar estado
    solicitud.estado = "aceptada";
    await solicitud.save();

    // Actualizar estadísticas de ambos usuarios
    await Usuario.findByIdAndUpdate(solicitud.solicitante, {
      $inc: { "estadisticas.amigosTotales": 1 },
    });

    await Usuario.findByIdAndUpdate(solicitud.receptor, {
      $inc: { "estadisticas.amigosTotales": 1 },
    });

    // Crear notificación para el solicitante informando que aceptaron su solicitud
    const receptor = await Usuario.findById(receptorId);
    await Notificacion.create({
      usuarioDestino: solicitud.solicitante,
      usuarioOrigen: receptorId,
      tipo: "amistad_aceptada",
      mensaje: `${receptor.nick} ha aceptado tu solicitud de amistad`,
      recurso: {
        tipo: "user",
        id: receptorId,
      },
    });

    // Ocultar la notificación de solicitud original (ya que fue aceptada)
    await Notificacion.updateOne(
      {
        usuarioDestino: receptorId,
        usuarioOrigen: solicitud.solicitante,
        tipo: "solicitud_amistad",
      },
      { $set: { oculta: true } }
    );

    return res.status(200).json({
      ok: true,
      message: "Solicitud de amistad aceptada",
      solicitud,
    });
  } catch (error) {
    console.error("Error en aceptarSolicitudAmistad:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al aceptar solicitud de amistad",
    });
  }
};

// 📌 Cancelar solicitud enviada
export const cancelarSolicitudEnviada = async (req, res) => {
  try {
    const solicitanteId = req.userId;
    const { usuarioId } = req.params;

    const solicitud = await Amistad.findOne({
      solicitante: solicitanteId,
      receptor: usuarioId,
      estado: "pendiente",
    });

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        message: "Solicitud no encontrada",
      });
    }

    await Amistad.findByIdAndDelete(solicitud._id);

    return res.status(200).json({
      ok: true,
      message: "Solicitud cancelada exitosamente",
    });
  } catch (error) {
    console.error("Error en cancelarSolicitudEnviada:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al cancelar solicitud",
    });
  }
};

// 📌 Rechazar solicitud de amistad
export const rechazarSolicitudAmistad = async (req, res) => {
  try {
    const receptorId = req.userId;
    const { solicitudId } = req.params;

    const solicitud = await Amistad.findById(solicitudId);

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        message: "Solicitud no encontrada",
      });
    }

    // Verificar que el usuario sea el receptor
    if (solicitud.receptor.toString() !== receptorId) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para rechazar esta solicitud",
      });
    }

    if (solicitud.estado !== "pendiente") {
      return res.status(400).json({
        ok: false,
        message: "Esta solicitud ya ha sido procesada",
      });
    }

    // Actualizar estado
    solicitud.estado = "rechazada";
    await solicitud.save();

    // Ocultar la notificación de solicitud
    await Notificacion.updateOne(
      {
        usuarioDestino: receptorId,
        usuarioOrigen: solicitud.solicitante,
        tipo: "solicitud_amistad",
      },
      { $set: { oculta: true } }
    );

    return res.status(200).json({
      ok: true,
      message: "Solicitud de amistad rechazada",
    });
  } catch (error) {
    console.error("Error en rechazarSolicitudAmistad:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al rechazar solicitud de amistad",
    });
  }
};

// 📌 Bloquear desde solicitud de amistad
export const bloquearDesdeSolicitud = async (req, res) => {
  try {
    const receptorId = req.userId;
    const { solicitudId } = req.params;

    const solicitud = await Amistad.findById(solicitudId);

    if (!solicitud) {
      return res.status(404).json({
        ok: false,
        message: "Solicitud no encontrada",
      });
    }

    // Verificar que el usuario sea el receptor
    if (solicitud.receptor.toString() !== receptorId) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permisos para bloquear esta solicitud",
      });
    }

    // Actualizar estado a bloqueada
    solicitud.estado = "bloqueada";
    await solicitud.save();

    // Ocultar todas las notificaciones entre estos usuarios
    await Notificacion.updateMany(
      {
        $or: [
          { usuarioDestino: receptorId, usuarioOrigen: solicitud.solicitante },
          { usuarioDestino: solicitud.solicitante, usuarioOrigen: receptorId },
        ],
      },
      { $set: { oculta: true } }
    );

    return res.status(200).json({
      ok: true,
      message: "Usuario bloqueado correctamente",
    });
  } catch (error) {
    console.error("Error en bloquearDesdeSolicitud:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al bloquear usuario",
    });
  }
};

// 📌 Bloquear usuario
export const bloquearUsuario = async (req, res) => {
  try {
    const bloqueadorId = req.userId;
    const { usuarioId } = req.params;

    // Validar que no sea el mismo usuario
    if (bloqueadorId === usuarioId) {
      return res.status(400).json({
        ok: false,
        message: "No puedes bloquearte a ti mismo",
      });
    }

    // Buscar si existe una relación de amistad
    const relacion = await Amistad.findOne({
      $or: [
        { solicitante: bloqueadorId, receptor: usuarioId },
        { solicitante: usuarioId, receptor: bloqueadorId },
      ],
    });

    if (relacion) {
      // Si eran amigos, restar estadística
      if (relacion.estado === "aceptada") {
        await Usuario.findByIdAndUpdate(bloqueadorId, {
          $inc: { "estadisticas.amigosTotales": -1 },
        });
        await Usuario.findByIdAndUpdate(usuarioId, {
          $inc: { "estadisticas.amigosTotales": -1 },
        });
      }

      // Actualizar a bloqueada
      relacion.estado = "bloqueada";
      await relacion.save();
    } else {
      // Crear nueva relación bloqueada
      await Amistad.create({
        solicitante: bloqueadorId,
        receptor: usuarioId,
        estado: "bloqueada",
      });
    }

    // Ocultar TODAS las notificaciones entre estos usuarios
    await Notificacion.updateMany(
      {
        $or: [
          { usuarioDestino: bloqueadorId, usuarioOrigen: usuarioId },
          { usuarioDestino: usuarioId, usuarioOrigen: bloqueadorId },
        ],
      },
      { $set: { oculta: true } }
    );

    return res.status(200).json({
      ok: true,
      message: "Usuario bloqueado correctamente",
    });
  } catch (error) {
    console.error("Error en bloquearUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al bloquear usuario",
    });
  }
};

// 📌 Eliminar amistad
export const eliminarAmistad = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { usuarioId: amigoId } = req.params;

    console.log("🗑️ Eliminando amistad entre:", usuarioId, "y", amigoId);

    const relacion = await Amistad.findOne({
      $or: [
        { solicitante: usuarioId, receptor: amigoId, estado: "aceptada" },
        { solicitante: amigoId, receptor: usuarioId, estado: "aceptada" },
      ],
    });

    console.log("🔍 Relación encontrada:", relacion);

    if (!relacion) {
      // Buscar cualquier relación para debug
      const cualquierRelacion = await Amistad.findOne({
        $or: [
          { solicitante: usuarioId, receptor: amigoId },
          { solicitante: amigoId, receptor: usuarioId },
        ],
      });
      console.log("🔍 Relación (cualquier estado):", cualquierRelacion);

      return res.status(404).json({
        ok: false,
        message: "No existe una amistad con este usuario",
      });
    }

    // Eliminar la relación
    await Amistad.findByIdAndDelete(relacion._id);
    console.log("✅ Amistad eliminada");

    // Actualizar contadores
    await Usuario.findByIdAndUpdate(usuarioId, {
      $inc: { "contadores.amigos": -1 },
    });

    await Usuario.findByIdAndUpdate(amigoId, {
      $inc: { "contadores.amigos": -1 },
    });

    return res.status(200).json({
      ok: true,
      message: "Amistad eliminada correctamente",
    });
  } catch (error) {
    console.error("Error en eliminarAmistad:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar amistad",
    });
  }
};

// 📌 Obtener mis solicitudes pendientes
export const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const solicitudes = await Amistad.find({
      receptor: usuarioId,
      estado: "pendiente",
    })
      .populate("solicitante", "nick nombre apellidos avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      solicitudes,
    });
  } catch (error) {
    console.error("Error en obtenerSolicitudesPendientes:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener solicitudes pendientes",
    });
  }
};

// 📌 Desbloquear usuario
export const desbloquearUsuario = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { usuarioId: bloqueadoId } = req.params;

    // Buscar la relación de bloqueo
    const relacion = await Amistad.findOne({
      $or: [
        { solicitante: usuarioId, receptor: bloqueadoId, estado: "bloqueada" },
        { solicitante: bloqueadoId, receptor: usuarioId, estado: "bloqueada" },
      ],
    });

    if (!relacion) {
      return res.status(404).json({
        ok: false,
        message: "No existe un bloqueo con este usuario",
      });
    }

    // Verificar que el usuario actual fue quien bloqueó
    if (relacion.solicitante.toString() !== usuarioId) {
      return res.status(403).json({
        ok: false,
        message:
          "No puedes desbloquear a este usuario porque no lo bloqueaste tú",
      });
    }

    // Eliminar la relación de bloqueo
    await Amistad.findByIdAndDelete(relacion._id);

    return res.status(200).json({
      ok: true,
      message: "Usuario desbloqueado correctamente",
    });
  } catch (error) {
    console.error("Error en desbloquearUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al desbloquear usuario",
    });
  }
};

// 📌 Obtener usuarios bloqueados
export const obtenerBloqueados = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const bloqueados = await Amistad.find({
      solicitante: usuarioId,
      estado: "bloqueada",
    })
      .populate("receptor", "nick nombre apellidos avatarUrl nombreArtistico")
      .sort({ createdAt: -1 });

    // Mapear para devolver solo los usuarios bloqueados
    const usuarios = bloqueados.map((bloqueo) => bloqueo.receptor);

    return res.status(200).json({
      ok: true,
      bloqueados: usuarios,
    });
  } catch (error) {
    console.error("Error en obtenerBloqueados:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener usuarios bloqueados",
    });
  }
};

// 📌 Obtener mis amigos
export const obtenerMisAmigos = async (req, res) => {
  try {
    const usuarioId = req.userId;

    const amistades = await Amistad.find({
      $or: [
        { solicitante: usuarioId, estado: "aceptada" },
        { receptor: usuarioId, estado: "aceptada" },
      ],
    })
      .populate(
        "solicitante",
        "nick nombre apellidos nombreArtistico avatarUrl estaConectado ultimaConexion"
      )
      .populate(
        "receptor",
        "nick nombre apellidos nombreArtistico avatarUrl estaConectado ultimaConexion"
      );

    // Mapear para devolver solo el amigo (no el usuario actual)
    const amigos = amistades.map((amistad) => {
      const esReceptor = amistad.receptor._id.toString() === usuarioId;
      return esReceptor ? amistad.solicitante : amistad.receptor;
    });

    return res.status(200).json({
      ok: true,
      amigos,
    });
  } catch (error) {
    console.error("Error en obtenerMisAmigos:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener amigos",
    });
  }
};

// 📌 Obtener estado de relación con un usuario
export const obtenerEstadoRelacion = async (req, res) => {
  try {
    const usuarioActualId = req.userId;
    const { usuarioId } = req.params;

    // Obtener información del usuario objetivo
    const usuarioObjetivo = await Usuario.findById(usuarioId).select(
      "privacy.recibirSolicitudesAmistad"
    );

    if (!usuarioObjetivo) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Buscar si existe alguna relación
    const relacion = await Amistad.findOne({
      $or: [
        { solicitante: usuarioActualId, receptor: usuarioId },
        { solicitante: usuarioId, receptor: usuarioActualId },
      ],
    });

    let estado = "ninguno";
    let solicitudId = undefined;

    if (relacion) {
      if (relacion.estado === "aceptada") {
        estado = "amigos";
      } else if (relacion.estado === "pendiente") {
        // Determinar si es enviada o recibida
        if (relacion.solicitante.toString() === usuarioActualId) {
          estado = "pendiente_enviada";
        } else {
          estado = "pendiente_recibida";
        }
        solicitudId = relacion._id;
      } else if (relacion.estado === "bloqueada") {
        estado = "bloqueado";
      }
    }

    return res.status(200).json({
      ok: true,
      estado,
      solicitudId,
      aceptaSolicitudes:
        usuarioObjetivo.privacy?.recibirSolicitudesAmistad ?? true,
    });
  } catch (error) {
    console.error("Error en obtenerEstadoRelacion:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener estado de relación",
    });
  }
};
