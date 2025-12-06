// src/routes/reporte.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { authAdmin } from "../middlewares/authAdmin.js";
import { socialLimiter } from "../middlewares/rateLimiter.js";
import {
  crearReporte,
  obtenerMisReportes,
  obtenerTodosReportes,
  actualizarEstadoReporte,
  resolverReporte,
  obtenerReportesContenido,
} from "../controllers/reporteController.js";

const router = express.Router();

// Crear reporte (usuarios)
router.post("/", authUsuario, socialLimiter, crearReporte);

// Obtener mis reportes (usuarios)
router.get("/mis-reportes", authUsuario, obtenerMisReportes);

// RUTAS DE ADMIN (requieren authAdmin)
router.get("/admin", authUsuario, authAdmin, obtenerTodosReportes);
router.patch("/:id/estado", authUsuario, authAdmin, actualizarEstadoReporte);
router.patch("/:id/resolver", authUsuario, authAdmin, resolverReporte);
router.get(
  "/contenido/:tipo/:id",
  authUsuario,
  authAdmin,
  obtenerReportesContenido
);

export default router;
