// src/routes/perfil.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { authOptional } from "../middlewares/authOptional.js";
import { uploadLimiter } from "../middlewares/rateLimiter.js";
import { uploadImagen, handleMulterError } from "../middlewares/upload.js";
import {
  subirAvatar,
  subirBanner,
  eliminarAvatar,
  eliminarBanner,
  obtenerPerfilCompleto,
  obtenerPerfilPorNick,
} from "../controllers/perfilController.js";

const router = express.Router();

// Subir avatar (foto de perfil)
router.post(
  "/avatar",
  authUsuario,
  uploadLimiter,
  uploadImagen,
  handleMulterError,
  subirAvatar
);

// Subir banner (portada de perfil)
router.post(
  "/banner",
  authUsuario,
  uploadLimiter,
  uploadImagen,
  handleMulterError,
  subirBanner
);

// Eliminar avatar
router.delete("/avatar", authUsuario, eliminarAvatar);

// Eliminar banner
router.delete("/banner", authUsuario, eliminarBanner);

// Obtener perfil por nick (debe ir ANTES de /:id para que no lo capture como ID)
// Usa authOptional para detectar si el usuario está bloqueado
router.get("/nick/:nick", authOptional, obtenerPerfilPorNick);

// Obtener perfil completo (público)
router.get("/:id", obtenerPerfilCompleto);

export default router;
