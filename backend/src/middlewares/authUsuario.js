// src/middlewares/authUsuario.js
import jwt from "jsonwebtoken";
import { Usuario } from "../models/usuarioModels.js";

/**
 * Middleware de autenticación de usuario
 * Verifica el token JWT desde cookies o header Authorization
 */
export const authUsuario = async (req, res, next) => {
  try {
    let token = null;

    // 1. Buscar token en las cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Si no está en cookies, buscar en el header Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Quitar "Bearer "
      }
    }

    // 3. Si no hay token, denegar acceso
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Acceso denegado. No se proporcionó token de autenticación",
        redirectTo: "/login",
      });
    }

    // 4. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Buscar el usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id).select("-password");

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        message: "Token inválido. Usuario no encontrado",
        redirectTo: "/login",
      });
    }

    // 6. Verificar si el usuario está activo
    if (!usuario.estaActivo) {
      return res.status(403).json({
        ok: false,
        message: "Tu cuenta ha sido desactivada. Contacta con soporte",
        redirectTo: "/login",
      });
    }

    // 7. Verificar si el usuario está baneado
    if (usuario.baneado) {
      return res.status(403).json({
        ok: false,
        message: "Tu cuenta ha sido suspendida",
        redirectTo: "/login",
      });
    }

    // 8. Agregar información del usuario a la request
    req.userId = usuario._id.toString();
    req.userEmail = usuario.email;
    req.userRole = usuario.role || "user";
    req.usuario = usuario;

    // 9. Actualizar última actividad y marcar como conectado (sin await para no bloquear)
    Usuario.findByIdAndUpdate(usuario._id, {
      estaConectado: true,
      ultimaActividad: new Date(),
      ultimaConexion: new Date(),
    }).exec();

    next();
  } catch (error) {
    // Token expirado o inválido
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        message: "Tu sesión ha expirado. Por favor inicia sesión nuevamente",
        redirectTo: "/login",
        expired: true,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        ok: false,
        message: "Token inválido",
        redirectTo: "/login",
      });
    }

    console.error("Error en authUsuario middleware:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al verificar autenticación",
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No requiere token pero si existe lo valida y agrega info del usuario
 */
export const authUsuarioOpcional = async (req, res, next) => {
  try {
    let token = null;

    // Buscar token en cookies o header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.substring(7);
    }

    // Si no hay token, continuar sin usuario
    if (!token) {
      req.userId = null;
      req.usuario = null;
      return next();
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select("-password");

    if (usuario && usuario.estaActivo && !usuario.baneado) {
      req.userId = usuario._id.toString();
      req.userEmail = usuario.email;
      req.userRole = usuario.role || "user";
      req.usuario = usuario;
    } else {
      req.userId = null;
      req.usuario = null;
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario
    req.userId = null;
    req.usuario = null;
    next();
  }
};
