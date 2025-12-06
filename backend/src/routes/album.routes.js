// src/routes/album.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { createContentLimiter } from "../middlewares/rateLimiter.js";
import {
  crearAlbum,
  obtenerAlbumPorId,
  listarAlbumesPublicos,
  eliminarAlbum,
  agregarCancionAAlbum,
  actualizarPortadaAlbum,
  buscarAlbumes,
  toggleLikeAlbum,
} from "../controllers/albumController.js";

const router = express.Router();
router.post("/", authUsuario, createContentLimiter, crearAlbum);
router.get("/publicos", listarAlbumesPublicos);
router.get("/buscar", buscarAlbumes);
router.get("/:id", obtenerAlbumPorId);
router.delete("/:id", authUsuario, eliminarAlbum);
router.post(
  "/:idAlbum/canciones/:idCancion",
  authUsuario,
  agregarCancionAAlbum
);
router.patch("/:idAlbum/portada", authUsuario, actualizarPortadaAlbum);
router.post("/:id/like", authUsuario, toggleLikeAlbum);
export default router;
