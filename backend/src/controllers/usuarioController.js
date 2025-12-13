// src/controllers/usuarioController.js
import { Usuario } from "../models/usuarioModels.js";
import { hashPassword, comparePassword } from "../helpers/contraseniaHelper.js";
import { crearToken } from "../helpers/jwtHelpers.js";
import { eliminarArchivoR2 } from "../services/r2Service.js";
import { calcularEdad } from "../helpers/edadHelper.js";

/**
 * 📌 REGISTER
 * Crea un nuevo usuario en la plataforma
 */
export const registroUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, nick, email, password, pais, fechaNacimiento } =
      req.body;

    // Normalizar nick: minúsculas y sin espacios
    const nickNormalizado = nick.toLowerCase().replace(/\s+/g, "");

    // Comprobar si ya existe usuario con ese email o nick
    const usuarioConEmail = await Usuario.findOne({
      email: email.toLowerCase(),
    });

    const usuarioConNick = await Usuario.findOne({
      nick: nickNormalizado,
    });

    const errores = [];
    if (usuarioConEmail) {
      errores.push("Este email ya está registrado");
    }
    if (usuarioConNick) {
      errores.push("Este nick ya está registrado");
    }

    if (errores.length > 0) {
      return res.status(409).json({
        ok: false,
        message: errores.join(" | "),
        errors: {
          email: usuarioConEmail ? "Este email ya está registrado" : "",
          nick: usuarioConNick ? "Este nick ya está registrado" : "",
        },
      });
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario con avatar por defecto
    const nuevoUsuario = new Usuario({
      nombre,
      apellidos,
      nick: nickNormalizado,
      email: email.toLowerCase(),
      password: passwordHash,
      pais,
      fechaNacimiento,
      avatarUrl: "/avatar.png", // Avatar por defecto
    });

    // Guardar en BD
    await nuevoUsuario.save();

    // Crear token (pasar _id, email y role)
    const token = crearToken(
      nuevoUsuario._id,
      nuevoUsuario.email,
      nuevoUsuario.role
    );

    // Configurar cookie con el token
    res.cookie("token", token, {
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      sameSite: "strict", // Protección contra CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Preparar objeto sin contraseña
    const usuarioSinPassword = nuevoUsuario.toObject();
    delete usuarioSinPassword.password;

    // Calcular si es menor de edad
    usuarioSinPassword.esMenorDeEdad =
      calcularEdad(nuevoUsuario.fechaNacimiento) < 18;

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      usuario: usuarioSinPassword,
      token,
    });
  } catch (error) {
    console.error("Error en registroUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al registrar usuario",
    });
  }
};

/**
 * 📌 LOGIN
 * Inicia sesión con email y contraseña
 */
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email (en minúsculas)
    const usuario = await Usuario.findOne({ email: email.toLowerCase() });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // Verificar si el usuario está baneado (esto SÍ bloquea el login)
    if (usuario.baneado) {
      return res.status(403).json({
        ok: false,
        message: `Tu cuenta ha sido baneada permanentemente. Razón: ${
          usuario.razonBaneo || "Violación de términos de servicio"
        }`,
        baneado: true,
      });
    }

    // Verificar si la suspensión temporal ha expirado
    if (usuario.suspendido && usuario.suspendidoHasta) {
      const ahora = new Date();
      if (ahora > usuario.suspendidoHasta) {
        // La suspensión ha expirado, reactivar automáticamente
        usuario.suspendido = false;
        usuario.suspendidoHasta = null;
        usuario.razonSuspension = null;
        usuario.puedeSubirContenido = true;

        usuario.historialConducta.push({
          fecha: new Date(),
          accion: "vida_restaurada",
          tipoContenido: "usuario",
          nombreContenido: usuario.nick,
          razon: "Suspensión temporal expirada automáticamente",
          vidasRestantes: usuario.vidas,
        });

        await usuario.save();
        console.log(
          `✅ Suspensión de ${usuario.nick} expirada y reactivada automáticamente`
        );
      }
    }

    // Nota: La suspensión NO bloquea el login, solo las funcionalidades dentro de la app

    // Comparar contraseña
    const esCorrecta = await comparePassword(password, usuario.password);

    if (!esCorrecta) {
      return res.status(401).json({
        ok: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // Crear token (pasar _id, email y role)
    const token = crearToken(usuario._id, usuario.email, usuario.role);

    // Configurar cookie con el token
    res.cookie("token", token, {
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      sameSite: "strict", // Protección contra CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Actualizar última conexión y estado
    usuario.ultimaConexion = new Date();
    usuario.ultimaActividad = new Date();
    usuario.estaConectado = true;
    usuario.cantidadIniciosSesion = (usuario.cantidadIniciosSesion || 0) + 1;
    await usuario.save();

    // Preparar usuario sin password
    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    // Calcular si es menor de edad
    usuarioSinPassword.esMenorDeEdad =
      calcularEdad(usuario.fechaNacimiento) < 18;

    // LOG: Verificar campo suspendido
    console.log("🔍 LOGIN - Usuario:", usuario.nick);
    console.log("🔍 Campo suspendido en DB:", usuario.suspendido);
    console.log(
      "🔍 Campo suspendido en respuesta:",
      usuarioSinPassword.suspendido
    );
    console.log(
      "🔍 Keys en respuesta:",
      Object.keys(usuarioSinPassword).filter((k) => k.includes("suspend"))
    );

    return res.status(200).json({
      ok: true,
      message: "Sesión iniciada correctamente",
      usuario: usuarioSinPassword,
      token,
    });
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al iniciar sesión",
    });
  }
};

/**
 * 📌 PERFIL
 * Obtiene el perfil del usuario autenticado (ruta protegida)
 */
export const perfilUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId)
      .select("-password")
      .populate({
        path: "playlistsCreadas",
        select: "titulo portadaUrl esPublica canciones creador",
        populate: {
          path: "creador",
          select: "nick nombreArtistico nombre avatarUrl",
        },
      })
      .populate({
        path: "biblioteca.playlistsGuardadas",
        select: "titulo portadaUrl esPublica canciones creador",
        populate: {
          path: "creador",
          select: "nick nombreArtistico nombre avatarUrl",
        },
      })
      .populate({
        path: "misAlbumes",
        select:
          "titulo portadaUrl generos fechaLanzamiento canciones artistas esPrivado",
        populate: {
          path: "artistas",
          select: "nick nombreArtistico nombre avatarUrl",
        },
      });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Agregar campo calculado esMenorDeEdad
    const usuarioObj = usuario.toObject();
    usuarioObj.esMenorDeEdad = calcularEdad(usuario.fechaNacimiento) < 18;

    return res.status(200).json({
      ok: true,
      usuario: usuarioObj,
    });
  } catch (error) {
    console.error("Error en perfilUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener perfil",
    });
  }
};

/**
 * 📌 LOGOUT
 * Cierra sesión eliminando la cookie del token
 */
export const logoutUsuario = async (req, res) => {
  try {
    // Marcar usuario como desconectado si está autenticado
    if (req.userId) {
      await Usuario.findByIdAndUpdate(req.userId, {
        estaConectado: false,
        ultimaConexion: new Date(),
      });
    }

    // Limpiar cookie del token
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      ok: true,
      message: "Sesión cerrada correctamente",
      redirectTo: "/login",
    });
  } catch (error) {
    console.error("Error en logoutUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al cerrar sesión",
    });
  }
};

/**
 * 📌 ACTUALIZAR PERFIL
 * Actualiza nick y/o descripcion del usuario autenticado
 * Body: { nick?, descripcion? }
 */
export const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { nick, descripcion, nombreArtistico, redes } = req.body;

    // Validar que al menos uno de los campos esté presente
    if (
      !nick &&
      descripcion === undefined &&
      nombreArtistico === undefined &&
      !redes
    ) {
      return res.status(400).json({
        ok: false,
        message: "Debes proporcionar al menos un campo para actualizar",
      });
    }

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Si se proporciona nick, verificar que no esté en uso
    if (nick && nick !== usuario.nick) {
      // Normalizar nick: minúsculas y sin espacios
      const nickNormalizado = nick.toLowerCase().replace(/\s+/g, "");

      const nickExistente = await Usuario.findOne({
        nick: nickNormalizado,
        _id: { $ne: usuarioId },
      });

      if (nickExistente) {
        return res.status(409).json({
          ok: false,
          message: "Este nick ya está en uso",
        });
      }

      usuario.nick = nickNormalizado;
    }

    // Actualizar descripcion si se proporciona
    if (descripcion !== undefined) {
      usuario.descripcion = descripcion.trim();
    }

    // Actualizar nombreArtistico si se proporciona
    if (nombreArtistico !== undefined) {
      usuario.nombreArtistico = nombreArtistico.trim();
    }

    // Actualizar redes sociales si se proporcionan
    if (redes) {
      if (redes.instagram !== undefined)
        usuario.redes.instagram = redes.instagram.trim();
      if (redes.tiktok !== undefined)
        usuario.redes.tiktok = redes.tiktok.trim();
      if (redes.youtube !== undefined)
        usuario.redes.youtube = redes.youtube.trim();
      if (redes.x !== undefined) usuario.redes.x = redes.x.trim();
    }

    await usuario.save();

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return res.status(200).json({
      ok: true,
      message: "Perfil actualizado correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en actualizarPerfil:", error);

    // Manejar errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        ok: false,
        message: "Error de validación",
        errors: errors,
      });
    }

    // Manejar error de nick duplicado
    if (error.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "Este nick ya está en uso",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar perfil",
    });
  }
};

/**
 * 📌 ACTUALIZAR AVATAR
 * Actualiza el avatar del usuario autenticado
 * Flujo:
 * 1) Subir imagen nueva con POST /subida/imagen/perfil -> devuelve { url }
 * 2) Llamar a PATCH /usuario/avatar con { nuevaAvatarUrl: "..." }
 */
export const actualizarAvatarUsuario = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { nuevaAvatarUrl } = req.body;

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Guardar la URL antigua para borrarla de R2
    const oldUrl = usuario.avatarUrl;

    // Actualizar el avatar
    usuario.avatarUrl = nuevaAvatarUrl;
    await usuario.save();

    // Borrar la imagen antigua de R2 (si existe)
    if (oldUrl) {
      await eliminarArchivoR2(oldUrl);
    }

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return res.status(200).json({
      ok: true,
      message: "Avatar actualizado correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en actualizarAvatarUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar avatar",
    });
  }
};

/**
 * 📌 ACTUALIZAR BANNER
 * Actualiza el banner/portada del perfil del usuario autenticado
 * Flujo:
 * 1) Subir imagen nueva con POST /upload/imagen -> devuelve { imagenUrl }
 * 2) Llamar a PATCH /usuario/banner con { nuevaBannerUrl: "..." }
 */
export const actualizarBannerUsuario = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { nuevaBannerUrl } = req.body;

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Guardar la URL antigua para borrarla de R2
    const oldUrl = usuario.bannerUrl;

    // Actualizar el banner
    usuario.bannerUrl = nuevaBannerUrl;
    await usuario.save();

    // Borrar la imagen antigua de R2 (si existe)
    if (oldUrl) {
      await eliminarArchivoR2(oldUrl);
    }

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return res.status(200).json({
      ok: true,
      message: "Banner actualizado correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en actualizarBannerUsuario:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar banner",
    });
  }
};

/**
 * 📌 BUSCAR USUARIOS
 * Buscar usuarios por nombre, nick o email
 */
export const buscarUsuarios = async (req, res) => {
  try {
    const { q } = req.query;
    const usuarioActualId = req.userId; // Puede ser undefined si no está autenticado

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        ok: false,
        message: "La búsqueda debe tener al menos 2 caracteres",
      });
    }

    // Limpiar @ si viene en la búsqueda
    const searchQuery = q.trim().replace(/^@/, "");
    const regex = new RegExp(searchQuery, "i");

    // Si el usuario está autenticado, obtener lista de bloqueados
    let usuariosBloqueadosIds = [];
    if (usuarioActualId) {
      const Bloqueo = (await import("../models/bloqueoModels.js")).default;

      // Obtener usuarios bloqueados (en ambas direcciones)
      const bloqueos = await Bloqueo.find({
        $or: [
          { bloqueador: usuarioActualId }, // Usuarios que YO bloqueé
          { bloqueado: usuarioActualId }, // Usuarios que ME bloquearon
        ],
      }).select("bloqueador bloqueado");

      // Extraer IDs de usuarios bloqueados
      usuariosBloqueadosIds = bloqueos.map((bloqueo) =>
        bloqueo.bloqueador.toString() === usuarioActualId
          ? bloqueo.bloqueado.toString()
          : bloqueo.bloqueador.toString()
      );
    }

    // Buscar SOLO por nick o nombreArtistico
    const usuarios = await Usuario.find({
      $or: [{ nick: regex }, { nombreArtistico: regex }],
      estaBaneado: false,
      "privacy.perfilPublico": true, // Solo perfiles públicos
      esVisible: { $ne: false }, // Permitir undefined o true, solo excluir false explícito
      role: { $ne: "admin" }, // Excluir solo admins
      _id: { $nin: usuariosBloqueadosIds }, // Excluir usuarios bloqueados
    })
      .select("nombre apellidos nick nombreArtistico avatarUrl verificado")
      .limit(50);

    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error en buscarUsuarios:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al buscar usuarios",
    });
  }
};

/**
 * 📌 ACTUALIZAR CONFIGURACIÓN DE PRIVACIDAD
 * Actualizar settings de privacidad del usuario
 */
export const actualizarPrivacidad = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { privacy } = req.body;

    if (!privacy || Object.keys(privacy).length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Debes proporcionar al menos una configuración de privacidad",
      });
    }

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Actualizar solo los campos proporcionados
    if (privacy.perfilPublico !== undefined) {
      usuario.privacy.perfilPublico = privacy.perfilPublico;
    }
    if (privacy.recibirSolicitudesAmistad !== undefined) {
      usuario.privacy.recibirSolicitudesAmistad =
        privacy.recibirSolicitudesAmistad;
    }
    if (privacy.mostrarUltimoIngreso !== undefined) {
      usuario.privacy.mostrarUltimoIngreso = privacy.mostrarUltimoIngreso;
    }
    if (privacy.mostrarEstadoConectado !== undefined) {
      usuario.privacy.mostrarEstadoConectado = privacy.mostrarEstadoConectado;
    }

    await usuario.save();

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return res.status(200).json({
      ok: true,
      message: "Configuración de privacidad actualizada",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en actualizarPrivacidad:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar configuración de privacidad",
    });
  }
};
