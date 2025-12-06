import jwt from "jsonwebtoken";

/**
 * Middleware de autenticación OPCIONAL
 * Si hay token válido, agrega req.userId
 * Si no hay token o es inválido, continúa sin req.userId
 */
export const authOptional = (req, res, next) => {
  try {
    // Intentar obtener el token de las cookies
    const token = req.cookies?.token;

    if (!token) {
      // No hay token, continuar sin autenticación
      return next();
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar userId al request
    req.userId = decoded.id;

    next();
  } catch (error) {
    // Si hay error en el token, simplemente continuar sin autenticación
    // (no es obligatorio estar autenticado)
    next();
  }
};
