// src/routes/notificacion.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  obtenerContadorNoLeidas,
} from "../controllers/notificacionController.js";

const router = express.Router();

/**
 * @route   GET /api/notificaciones
 * @desc    Obtener notificaciones del usuario
 * @access  Private
 */
router.get("/", authUsuario, obtenerNotificaciones);

/**
 * @route   GET /api/notificaciones/contador
 * @desc    Obtener contador de notificaciones no leídas
 * @access  Private
 */
router.get("/contador", authUsuario, obtenerContadorNoLeidas);

/**
 * @route   PATCH /api/notificaciones/leer-todas
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private
 */
router.patch("/leer-todas", authUsuario, marcarTodasComoLeidas);

/**
 * @route   PATCH /api/notificaciones/:id/leer
 * @desc    Marcar notificación como leída
 * @access  Private
 */
router.patch("/:id/leer", authUsuario, marcarComoLeida);

/**
 * @route   DELETE /api/notificaciones/:id
 * @desc    Eliminar notificación
 * @access  Private
 */
router.delete("/:id", authUsuario, eliminarNotificacion);

export default router;
