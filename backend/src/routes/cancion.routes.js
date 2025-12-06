// src/routes/cancion.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import {
  createContentLimiter,
  socialLimiter,
} from "../middlewares/rateLimiter.js";
import {
  crearCancion,
  misCanciones,
  buscarMisCanciones,
  obtenerCancion,
  actualizarCancion,
  eliminarCancion,
  toggleLike,
  contarReproduccion,
  verificarAccesoCancion,
  buscarCanciones,
} from "../controllers/cancionController.js";
const router = express.Router();
router.post("/", authUsuario, createContentLimiter, crearCancion);
router.get("/mis-canciones", authUsuario, misCanciones);
router.get("/mis-canciones/buscar", authUsuario, buscarMisCanciones);
router.get("/buscar", buscarCanciones);
router.get("/:id", obtenerCancion);
router.put("/:id", authUsuario, actualizarCancion);
router.delete("/:id", authUsuario, eliminarCancion);
router.post("/:id/like", authUsuario, socialLimiter, toggleLike);
router.post("/:id/reproducir", authUsuario, contarReproduccion);
router.get("/:id/verificar-acceso", authUsuario, verificarAccesoCancion);

export default router;
