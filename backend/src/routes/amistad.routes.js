// src/routes/amistad.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { socialLimiter } from "../middlewares/rateLimiter.js";
import {
  enviarSolicitudAmistad,
  aceptarSolicitudAmistad,
  rechazarSolicitudAmistad,
  cancelarSolicitudEnviada,
  bloquearUsuario,
  bloquearDesdeSolicitud,
  desbloquearUsuario,
  eliminarAmistad,
  obtenerSolicitudesPendientes,
  obtenerMisAmigos,
  obtenerBloqueados,
  obtenerEstadoRelacion,
} from "../controllers/amistadController.js";

const router = express.Router();

// Enviar solicitud de amistad
router.post(
  "/solicitud/:usuarioId",
  authUsuario,
  socialLimiter,
  enviarSolicitudAmistad
);

// Aceptar solicitud
router.post("/aceptar/:solicitudId", authUsuario, aceptarSolicitudAmistad);

// Rechazar solicitud
router.post("/rechazar/:solicitudId", authUsuario, rechazarSolicitudAmistad);

// Cancelar solicitud enviada
router.delete("/cancelar/:usuarioId", authUsuario, cancelarSolicitudEnviada);

// Bloquear usuario (también puede hacerse desde solicitud pendiente)
router.post("/bloquear/:usuarioId", authUsuario, bloquearUsuario);
router.post(
  "/bloquear-solicitud/:solicitudId",
  authUsuario,
  bloquearDesdeSolicitud
);

// Eliminar amistad
router.delete("/amigo/:usuarioId", authUsuario, eliminarAmistad);

// Obtener solicitudes pendientes
router.get("/solicitudes", authUsuario, obtenerSolicitudesPendientes);

// Obtener mis amigos
router.get("/amigos", authUsuario, obtenerMisAmigos);

// Desbloquear usuario
router.delete("/desbloquear/:usuarioId", authUsuario, desbloquearUsuario);

// Obtener usuarios bloqueados
router.get("/bloqueados", authUsuario, obtenerBloqueados);

// Obtener estado de relación con un usuario
router.get("/estado/:usuarioId", authUsuario, obtenerEstadoRelacion);

export default router;
