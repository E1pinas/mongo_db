// src/routes/reproduccion.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import {
  registrarReproduccion,
  obtenerHistorialReproduccion,
  obtenerTopCanciones,
  obtenerTopArtistas,
  limpiarHistorial,
} from "../controllers/reproduccionController.js";

const router = express.Router();

// Registrar reproducción
router.post("/", authUsuario, registrarReproduccion);

// Obtener historial de reproducciones
router.get("/historial", authUsuario, obtenerHistorialReproduccion);

// Obtener top canciones del usuario
router.get("/top-canciones", authUsuario, obtenerTopCanciones);

// Obtener top artistas del usuario
router.get("/top-artistas", authUsuario, obtenerTopArtistas);

// Limpiar historial
router.delete("/historial", authUsuario, limpiarHistorial);

export default router;
