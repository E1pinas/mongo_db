// src/routes/comentario.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { socialLimiter } from "../middlewares/rateLimiter.js";
import {
  crearComentario,
  obtenerComentariosPerfil,
  responderComentario,
  toggleLikeComentario,
  eliminarComentario,
  editarComentario,
  obtenerComentariosCancion,
  crearComentarioCancion,
} from "../controllers/comentarioController.js";

const router = express.Router();

// Crear comentario
router.post("/", authUsuario, socialLimiter, crearComentario);

// Obtener comentarios de un perfil
router.get("/perfil/:perfilId", obtenerComentariosPerfil);

// Obtener comentarios de una canción
router.get("/cancion/:cancionId", obtenerComentariosCancion);

// Crear comentario en una canción
router.post("/cancion", authUsuario, socialLimiter, crearComentarioCancion);

// Responder a un comentario
router.post("/:id/responder", authUsuario, socialLimiter, responderComentario);

// Dar/quitar like a comentario
router.post("/:id/like", authUsuario, socialLimiter, toggleLikeComentario);

// Editar comentario
router.put("/:id", authUsuario, editarComentario);

// Eliminar comentario
router.delete("/:id", authUsuario, eliminarComentario);

export default router;
