// src/helpers/jwtHelpers.js
import jwt from "jsonwebtoken";

/**
 * Crear token JWT
 * @param {string} userId - ID del usuario
 * @param {string} email - Email del usuario
 * @param {string} role - Rol del usuario (usuario o admin)
 * @returns {string} - Token JWT
 */
export const crearToken = (userId, email, role = "usuario") => {
  const payload = {
    id: userId,
    email,
    role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token válido por 7 días
  });
};

/**
 * Verificar token JWT
 * @param {string} token - Token a verificar
 * @returns {object} - Payload decodificado
 */
export const verificarToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
};
