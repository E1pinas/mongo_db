// src/routes/presence.routes.js
import { Router } from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { updateUserActivity } from "../services/presenceService.js";

const router = Router();

/**
 * POST /api/presence/heartbeat
 * Actualizar actividad del usuario (llamar cada 2-3 minutos desde el frontend)
 */
router.post("/heartbeat", authUsuario, async (req, res) => {
  try {
    await updateUserActivity(req.userId);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error en heartbeat:", error);
    return res.status(500).json({ ok: false, message: "Error en heartbeat" });
  }
});

export default router;
