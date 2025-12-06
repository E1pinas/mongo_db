// src/routes/seguidor.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { authAdmin } from "../middlewares/authAdmin.js";
import { socialLimiter } from "../middlewares/rateLimiter.js";
import {
  seguirUsuario,
  dejarDeSeguirUsuario,
  obtenerSeguidores,
  obtenerSeguidos,
  verificarSiSigo,
  obtenerSeguidoresMutuos,
  recalcularEstadisticas,
  recalcularTodasEstadisticas,
} from "../controllers/seguidorController.js";

const router = express.Router();

// Seguir a un usuario
router.post("/seguir/:usuarioId", authUsuario, socialLimiter, seguirUsuario);

// Dejar de seguir
router.delete(
  "/seguir/:usuarioId",
  authUsuario,
  socialLimiter,
  dejarDeSeguirUsuario
);

// Verificar si sigo a un usuario
router.get("/verificar/:usuarioId", authUsuario, verificarSiSigo);

// Obtener seguidores de un usuario
router.get("/seguidores/:usuarioId", obtenerSeguidores);

// Obtener usuarios seguidos
router.get("/seguidos/:usuarioId", obtenerSeguidos);

// Obtener seguidores mutuos
router.get("/mutuos", authUsuario, obtenerSeguidoresMutuos);

// Recalcular estadísticas de un usuario específico
router.post(
  "/recalcular-estadisticas/:usuarioId",
  authUsuario,
  recalcularEstadisticas
);

// Recalcular estadísticas de todos los usuarios (solo admin)
router.post(
  "/recalcular-todas-estadisticas",
  authAdmin,
  recalcularTodasEstadisticas
);

export default router;
