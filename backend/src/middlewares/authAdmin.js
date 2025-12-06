// src/middlewares/authAdmin.js
/**
 * Middleware para verificar que el usuario sea administrador
 * Debe usarse DESPUÉS de authUsuario
 */
export const authAdmin = (req, res, next) => {
  try {
    // El usuario ya fue verificado por authUsuario
    if (!req.usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: "No autorizado - Token no válido",
      });
    }

    // Verificar si es admin
    if (req.usuario.esAdmin !== true) {
      return res.status(403).json({
        ok: false,
        mensaje: "Acceso denegado - Se requieren permisos de administrador",
      });
    }

    // Usuario es admin, continuar
    next();
  } catch (error) {
    console.error("Error en authAdmin middleware:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al verificar permisos de administrador",
    });
  }
};
