// src/routes/usuario.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
  registroUsuario,
  loginUsuario,
  logoutUsuario,
  perfilUsuario,
  actualizarPerfil,
  actualizarAvatarUsuario,
  actualizarBannerUsuario,
  buscarUsuarios,
  actualizarPrivacidad,
} from "../controllers/usuarioController.js";

const router = express.Router();

// Autenticación (rate limiter desactivado temporalmente)
router.post("/registro", registroUsuario);
router.post("/login", loginUsuario);
router.post("/logout", authUsuario, logoutUsuario);

// Perfil
router.get("/perfil", authUsuario, perfilUsuario);
router.patch("/perfil", authUsuario, actualizarPerfil);
router.patch("/privacy", authUsuario, actualizarPrivacidad);
router.patch("/avatar", authUsuario, actualizarAvatarUsuario);
router.patch("/banner", authUsuario, actualizarBannerUsuario);

// Búsqueda
router.get("/buscar", buscarUsuarios);

export default router;
