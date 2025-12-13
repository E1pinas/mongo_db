import { Router } from "express";
import {
  bloquearUsuario,
  desbloquearUsuario,
  verificarBloqueo,
  listarBloqueados,
} from "../controllers/bloqueoController.js";
import { authUsuario } from "../middlewares/authUsuario.js";

const router = Router();

/**
 * POST /api/bloqueos/:usuarioId/bloquear
 * Bloquear a un usuario
 */
router.post("/:usuarioId/bloquear", authUsuario, bloquearUsuario);

/**
 * DELETE /api/bloqueos/:usuarioId/desbloquear
 * Desbloquear a un usuario
 */
router.delete("/:usuarioId/desbloquear", authUsuario, desbloquearUsuario);

/**
 * GET /api/bloqueos/:usuarioId/verificar
 * Verificar si existe bloqueo con un usuario
 */
router.get("/:usuarioId/verificar", authUsuario, verificarBloqueo);

/**
 * GET /api/bloqueos/mis-bloqueados
 * Listar usuarios que he bloqueado
 */
router.get("/mis-bloqueados", authUsuario, listarBloqueados);

export default router;
