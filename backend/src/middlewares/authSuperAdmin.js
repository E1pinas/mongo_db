import jwt from "jsonwebtoken";

/**
 * Middleware para verificar que el usuario sea SUPER ADMIN
 * Solo el super admin puede crear otros admins
 */
export const authSuperAdmin = (req, res, next) => {
  // Verificar header Authorization
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "No se proporcionó token de autenticación",
    });
  }

  try {
    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que sea super admin
    if (decoded.role !== "super_admin") {
      return res.status(403).json({
        status: "error",
        message: "Acceso denegado. Se requiere rol de Super Administrador",
      });
    }

    // Agregar información del usuario al request
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token inválido o expirado",
    });
  }
};
