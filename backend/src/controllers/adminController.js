import { Usuario } from "../models/usuarioModels.js";
import { Cancion } from "../models/cancionModels.js";
import { Album } from "../models/albumModels.js";
import { Playlist } from "../models/playlistModels.js";
import { Comentario } from "../models/comentarioModels.js";
import Post from "../models/postModels.js";
import { Amistad } from "../models/amistadModels.js";
import { Notificacion } from "../models/notificacionModels.js";
import { Reporte } from "../models/reporteModels.js";
import { eliminarArchivoR2 } from "../services/r2Service.js";
import bcrypt from "bcrypt";

/**
 * Obtener todos los administradores (admin y super_admin)
 * Solo super_admin puede ver esta lista
 */
export const listarAdministradores = async (req, res) => {
  try {
    const administradores = await Usuario.find({
      role: { $in: ["admin", "super_admin"] },
    })
      .select("nombre apellidos nick email role avatarUrl fechaCreacion")
      .sort({ role: -1, fechaCreacion: -1 }); // super_admin primero

    res.status(200).json({
      status: "success",
      total: administradores.length,
      administradores,
    });
  } catch (error) {
    console.error("Error al listar administradores:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener lista de administradores",
    });
  }
};

/**
 * Crear un nuevo administrador (solo super_admin)
 * El super_admin NO puede ser creado por esta ruta
 */
export const crearAdministrador = async (req, res) => {
  try {
    const { nombre, apellidos, nick, email, password, pais, fechaNacimiento } =
      req.body;

    // Validar que todos los campos requeridos estén presentes
    if (
      !nombre ||
      !apellidos ||
      !nick ||
      !email ||
      !password ||
      !pais ||
      !fechaNacimiento
    ) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
      });
    }

    // Verificar que el email no exista
    const emailExiste = await Usuario.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    // Verificar que el nick no exista
    const nickExiste = await Usuario.findOne({ nick });
    if (nickExiste) {
      return res.status(400).json({
        status: "error",
        message: "El nick ya está en uso",
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo administrador
    const nuevoAdmin = new Usuario({
      nombre,
      apellidos,
      nick,
      email,
      password: hashedPassword,
      pais,
      fechaNacimiento,
      role: "admin", // Solo se puede crear admin, NO super_admin
      esVisible: false, // Admins son invisibles
      puedeSubirContenido: false, // Admins no suben música
    });

    await nuevoAdmin.save();

    // Responder sin la contraseña
    const adminCreado = nuevoAdmin.toObject();
    delete adminCreado.password;

    res.status(201).json({
      status: "success",
      message: "Administrador creado exitosamente",
      administrador: adminCreado,
    });
  } catch (error) {
    console.error("Error al crear administrador:", error);
    res.status(500).json({
      status: "error",
      message: "Error al crear administrador",
    });
  }
};

/**
 * Eliminar un administrador (solo super_admin)
 * NO se puede eliminar al super_admin
 */
export const eliminarAdministrador = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Administrador no encontrado",
      });
    }

    // Verificar que NO sea super_admin
    if (usuario.role === "super_admin") {
      return res.status(403).json({
        status: "error",
        message: "No se puede eliminar al Super Administrador",
      });
    }

    // Verificar que sea admin
    if (usuario.role !== "admin") {
      return res.status(400).json({
        status: "error",
        message: "El usuario no es un administrador",
      });
    }

    // Eliminar el administrador
    await Usuario.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Administrador eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar administrador:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar administrador",
    });
  }
};

/**
 * Cambiar el rol de un usuario normal a admin (solo super_admin)
 */
export const promoverAAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // No se puede promover a quien ya es admin o super_admin
    if (usuario.role === "admin" || usuario.role === "super_admin") {
      return res.status(400).json({
        status: "error",
        message: "El usuario ya es administrador",
      });
    }

    // Promover a admin
    usuario.role = "admin";
    await usuario.save();

    const usuarioActualizado = usuario.toObject();
    delete usuarioActualizado.password;

    res.status(200).json({
      status: "success",
      message: "Usuario promovido a Administrador exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al promover usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error al promover usuario",
    });
  }
};

/**
 * Degradar un admin a usuario normal (solo super_admin)
 * NO se puede degradar al super_admin
 */
export const degradarAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // No se puede degradar al super_admin
    if (usuario.role === "super_admin") {
      return res.status(403).json({
        status: "error",
        message: "No se puede degradar al Super Administrador",
      });
    }

    // Verificar que sea admin
    if (usuario.role !== "admin") {
      return res.status(400).json({
        status: "error",
        message: "El usuario no es un administrador",
      });
    }

    // Degradar a user
    usuario.role = "user";
    await usuario.save();

    const usuarioActualizado = usuario.toObject();
    delete usuarioActualizado.password;

    res.status(200).json({
      status: "success",
      message: "Administrador degradado a usuario normal",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al degradar administrador:", error);
    res.status(500).json({
      status: "error",
      message: "Error al degradar administrador",
    });
  }
};

/**
 * Obtener historial de conducta de un usuario
 * Solo admin o super_admin
 */
export const obtenerHistorialConducta = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id)
      .select("nick nombreArtistico vidas historialConducta role")
      .populate("historialConducta.moderador", "nick nombreArtistico");

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Ordenar historial por fecha descendente (más reciente primero)
    const historialOrdenado = [...usuario.historialConducta].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    res.status(200).json({
      status: "success",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        nombreArtistico: usuario.nombreArtistico,
        vidas: usuario.vidas,
        role: usuario.role,
      },
      historialConducta: historialOrdenado,
      totalIncidentes: historialOrdenado.length,
    });
  } catch (error) {
    console.error("Error al obtener historial de conducta:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener historial de conducta",
    });
  }
};

/**
 * Agregar vidas a un usuario
 * Solo admin o super_admin
 */
export const agregarVidas = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, razon } = req.body;

    if (!cantidad || cantidad < 1 || cantidad > 10) {
      return res.status(400).json({
        status: "error",
        message: "La cantidad debe ser entre 1 y 10",
      });
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Solo se pueden agregar vidas a usuarios normales
    if (usuario.role !== "user") {
      return res.status(400).json({
        status: "error",
        message: "Solo se pueden agregar vidas a usuarios normales",
      });
    }

    // Calcular nuevas vidas (máximo 10)
    const vidasAnteriores = usuario.vidas;
    usuario.vidas = Math.min(10, usuario.vidas + cantidad);
    const vidasAgregadas = usuario.vidas - vidasAnteriores;

    // Si estaba baneado por 0 vidas, reactivar
    if (vidasAnteriores === 0 && usuario.baneado) {
      usuario.estaActivo = true;
      usuario.baneado = false;
      usuario.razonBaneo = null;
    }

    // Registrar en historial de conducta
    usuario.historialConducta.push({
      fecha: new Date(),
      accion: "vida_agregada",
      tipoContenido: "usuario",
      nombreContenido: `+${vidasAgregadas} vida(s)`,
      razon: razon || "Vidas restauradas por el equipo de moderación",
      vidasRestantes: usuario.vidas,
      moderador:
        req.userRole === "admin" || req.userRole === "super_admin"
          ? req.userId
          : null,
    });

    await usuario.save();

    res.status(200).json({
      status: "success",
      message: `Se agregaron ${vidasAgregadas} vida(s) exitosamente`,
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        vidasAnteriores,
        vidasActuales: usuario.vidas,
        vidasAgregadas,
      },
    });
  } catch (error) {
    console.error("Error al agregar vidas:", error);
    res.status(500).json({
      status: "error",
      message: "Error al agregar vidas",
    });
  }
};

/**
 * Restaurar todas las vidas de un usuario (resetear a 3)
 * Solo admin o super_admin
 */
export const restaurarVidas = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    if (usuario.role !== "user") {
      return res.status(400).json({
        status: "error",
        message: "Solo se pueden restaurar vidas a usuarios normales",
      });
    }

    const vidasAnteriores = usuario.vidas;
    usuario.vidas = 3;

    // Si estaba baneado por 0 vidas, reactivar
    if (vidasAnteriores === 0 && usuario.baneado) {
      usuario.estaActivo = true;
      usuario.baneado = false;
      usuario.razonBaneo = null;
    }

    // Registrar en historial
    usuario.historialConducta.push({
      fecha: new Date(),
      accion: "vida_restaurada",
      tipoContenido: "usuario",
      nombreContenido: "Vidas restauradas a 3",
      razon:
        razon ||
        "El usuario ha demostrado buena conducta y se le restauran las vidas",
      vidasRestantes: 3,
      moderador:
        req.userRole === "admin" || req.userRole === "super_admin"
          ? req.userId
          : null,
    });

    await usuario.save();

    res.status(200).json({
      status: "success",
      message: "Vidas restauradas exitosamente a 3",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        vidasAnteriores,
        vidasActuales: 3,
      },
    });
  } catch (error) {
    console.error("Error al restaurar vidas:", error);
    res.status(500).json({
      status: "error",
      message: "Error al restaurar vidas",
    });
  }
};

/**
 * Reasignar un reporte a otro administrador (SOLO SUPER_ADMIN)
 */
export const reasignarReporte = async (req, res) => {
  try {
    const { reporteId } = req.params;
    const { adminId } = req.body;

    // Verificar que el nuevo admin existe y es admin o super_admin
    const admin = await Usuario.findById(adminId).select("role estaActivo");
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Administrador no encontrado",
      });
    }

    if (!["admin", "super_admin"].includes(admin.role)) {
      return res.status(400).json({
        status: "error",
        message: "El usuario seleccionado no es administrador",
      });
    }

    if (!admin.estaActivo) {
      return res.status(400).json({
        status: "error",
        message: "El administrador está inactivo",
      });
    }

    // Actualizar el reporte
    const reporte = await Reporte.findByIdAndUpdate(
      reporteId,
      { asignadoA: adminId },
      { new: true }
    )
      .populate("asignadoA", "nick nombreArtistico")
      .populate("reportadoPor", "nick nombreArtistico");

    if (!reporte) {
      return res.status(404).json({
        status: "error",
        message: "Reporte no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Reporte reasignado exitosamente",
      reporte,
    });
  } catch (error) {
    console.error("Error al reasignar reporte:", error);
    res.status(500).json({
      status: "error",
      message: "Error al reasignar reporte",
    });
  }
};

/**
 * Suspender usuario (desactivar funcionalidades: música, crear contenido, ver perfiles)
 */
export const suspenderUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon, dias = 0 } = req.body; // dias = 0 significa permanente

    if (!razon || razon.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Debe proporcionar una razón para la suspensión",
      });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // No permitir suspender a otros admins
    if (["admin", "super_admin"].includes(usuario.role)) {
      return res.status(403).json({
        status: "error",
        message: "No puedes suspender a otros administradores",
      });
    }

    // Suspender funcionalidades
    usuario.suspendido = true;
    usuario.razonSuspension = razon;
    usuario.puedeSubirContenido = false;

    // Calcular fecha de expiración si no es permanente
    if (dias > 0) {
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + dias);
      usuario.suspendidoHasta = fechaExpiracion;
    } else {
      usuario.suspendidoHasta = null; // Permanente
    }

    // Agregar al historial de conducta
    usuario.historialConducta.push({
      fecha: new Date(),
      accion: "suspension",
      tipoContenido: "usuario",
      nombreContenido: usuario.nick,
      razon: dias > 0 ? `${razon} (${dias} días)` : `${razon} (permanente)`,
      vidasRestantes: usuario.vidas,
      moderador: req.usuario._id,
    });

    await usuario.save();

    res.status(200).json({
      status: "success",
      usuario: {
        _id: usuario._id,
        nick: usuario.nick,
        suspendido: true,
        suspendidoHasta: usuario.suspendidoHasta,
        razonSuspension: razon,
      },
    });
  } catch (error) {
    console.error("Error al suspender usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error al suspender usuario",
    });
  }
};

/**
 * Eliminar usuario y TODO su contenido
 */
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // No permitir eliminar a otros admins
    if (["admin", "super_admin"].includes(usuario.role)) {
      return res.status(403).json({
        status: "error",
        message: "No puedes eliminar a otros administradores",
      });
    }

    let archivosEliminadosR2 = 0;

    // 1. ELIMINAR TODAS SUS CANCIONES Y ARCHIVOS DE AUDIO EN R2
    const canciones = await Cancion.find({ artista: id });
    const cancionIds = canciones.map((c) => c._id);

    // Eliminar archivos de audio de R2
    for (const cancion of canciones) {
      if (cancion.audioUrl) {
        try {
          await eliminarArchivoR2(cancion.audioUrl);
          archivosEliminadosR2++;
        } catch (error) {
          console.error(
            `Error eliminando audio de R2: ${cancion.audioUrl}`,
            error
          );
        }
      }
      // Eliminar portada de canción si existe
      if (cancion.portadaUrl) {
        try {
          await eliminarArchivoR2(cancion.portadaUrl);
          archivosEliminadosR2++;
        } catch (error) {
          console.error(
            `Error eliminando portada de R2: ${cancion.portadaUrl}`,
            error
          );
        }
      }
    }

    // Eliminar referencias de sus canciones en playlists de otros usuarios
    await Playlist.updateMany(
      { "canciones.cancion": { $in: cancionIds } },
      { $pull: { canciones: { cancion: { $in: cancionIds } } } }
    );

    // Eliminar referencias en biblioteca de otros usuarios
    await Usuario.updateMany(
      { "biblioteca.cancionesGuardadas": { $in: cancionIds } },
      { $pull: { "biblioteca.cancionesGuardadas": { $in: cancionIds } } }
    );

    // Eliminar las canciones de la BD
    await Cancion.deleteMany({ artista: id });

    // 2. ELIMINAR TODOS SUS ÁLBUMES Y PORTADAS EN R2
    const albumes = await Album.find({ artista: id });
    const albumIds = albumes.map((a) => a._id);

    // Eliminar portadas de álbumes de R2
    for (const album of albumes) {
      if (album.portadaUrl) {
        try {
          await eliminarArchivoR2(album.portadaUrl);
          archivosEliminadosR2++;
        } catch (error) {
          console.error(
            `Error eliminando portada de álbum de R2: ${album.portadaUrl}`,
            error
          );
        }
      }
    }

    // Eliminar referencias en biblioteca de otros usuarios
    await Usuario.updateMany(
      { "biblioteca.albumesGuardados": { $in: albumIds } },
      { $pull: { "biblioteca.albumesGuardados": { $in: albumIds } } }
    );

    // Eliminar los álbumes de la BD
    await Album.deleteMany({ artista: id });

    // 3. ELIMINAR TODAS SUS PLAYLISTS Y PORTADAS EN R2
    const playlists = await Playlist.find({ creador: id });
    const playlistIds = playlists.map((p) => p._id);

    // Eliminar portadas de playlists de R2
    for (const playlist of playlists) {
      if (playlist.portadaUrl) {
        try {
          await eliminarArchivoR2(playlist.portadaUrl);
          archivosEliminadosR2++;
        } catch (error) {
          console.error(
            `Error eliminando portada de playlist de R2: ${playlist.portadaUrl}`,
            error
          );
        }
      }
    }

    // Eliminar referencias en biblioteca de otros usuarios
    await Usuario.updateMany(
      { "biblioteca.playlistsGuardadas": { $in: playlistIds } },
      { $pull: { "biblioteca.playlistsGuardadas": { $in: playlistIds } } }
    );

    // Eliminar las playlists de la BD
    await Playlist.deleteMany({ creador: id });

    // 4. ELIMINAR AVATAR Y BANNER DEL USUARIO EN R2
    if (usuario.avatarUrl) {
      try {
        await eliminarArchivoR2(usuario.avatarUrl);
        archivosEliminadosR2++;
      } catch (error) {
        console.error(
          `Error eliminando avatar de R2: ${usuario.avatarUrl}`,
          error
        );
      }
    }
    if (usuario.bannerUrl) {
      try {
        await eliminarArchivoR2(usuario.bannerUrl);
        archivosEliminadosR2++;
      } catch (error) {
        console.error(
          `Error eliminando banner de R2: ${usuario.bannerUrl}`,
          error
        );
      }
    }

    // 5. ELIMINAR TODOS SUS COMENTARIOS
    await Comentario.deleteMany({ usuario: id });

    // 6. ELIMINAR TODOS SUS POSTS
    await Post.deleteMany({ usuario: id });

    // 7. ELIMINAR AMISTADES
    await Amistad.deleteMany({
      $or: [{ usuario1: id }, { usuario2: id }],
    });

    // 8. ELIMINAR NOTIFICACIONES
    await Notificacion.deleteMany({
      $or: [{ emisor: id }, { receptor: id }],
    });

    // 9. ELIMINAR REPORTES CREADOS POR ÉL
    await Reporte.deleteMany({ reportadoPor: id });

    // 10. ELIMINAR DE SEGUIDORES/SEGUIDOS
    await Usuario.updateMany(
      {},
      {
        $pull: {
          "biblioteca.artistasGuardados": id,
        },
      }
    );

    // 11. FINALMENTE, ELIMINAR AL USUARIO DE LA BD
    await Usuario.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: `Usuario ${usuario.nick} y todo su contenido eliminado permanentemente`,
      eliminado: {
        canciones: cancionIds.length,
        albumes: albumIds.length,
        playlists: playlistIds.length,
        archivosR2: archivosEliminadosR2,
      },
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar usuario",
    });
  }
};
