import jwt from "jsonwebtoken";

/**
 * Middleware para verificar que el usuario sea ADMIN o SUPER_ADMIN
 * Permite acceso a funciones de moderación
 */
export const authAdmin = (req, res, next) => {
  try {
    // Verificar header Authorization
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No se proporcionó token de autenticación",
      });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que sea admin o super_admin
    if (decoded.role !== "admin" && decoded.role !== "super_admin") {
      return res.status(403).json({
        status: "error",
        message: "Acceso denegado. Se requieren permisos de administrador",
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
