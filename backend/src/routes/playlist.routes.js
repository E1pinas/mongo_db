// src/routes/playlist.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { authOptional } from "../middlewares/authOptional.js";
import {
  crearPlaylist,
  obtenerPlaylistPorId,
  eliminarPlaylist,
  agregarCancionPlaylist,
  quitarCancionPlaylist,
  actualizarPlaylist,
  actualizarPortadaPlaylist,
  toggleModoColaborativo,
  invitarColaborador,
  eliminarColaborador,
  salirDePlaylist,
  obtenerColaboradores,
  buscarCancionesParaPlaylist,
  obtenerPlaylistsPublicas,
  toggleSeguirPlaylist,
  buscarPlaylists,
} from "../controllers/playlistController.js";

const router = express.Router();

router.post("/", authUsuario, crearPlaylist);
router.get("/publicas", obtenerPlaylistsPublicas);
router.get("/buscar", buscarPlaylists);
router.get("/buscar-canciones", authUsuario, buscarCancionesParaPlaylist);
router.get("/:id", authOptional, obtenerPlaylistPorId);
router.patch("/:id", authUsuario, actualizarPlaylist);
router.delete("/:id", authUsuario, eliminarPlaylist);
router.post("/:id/canciones", authUsuario, agregarCancionPlaylist);
router.delete("/:id/canciones/:cancionId", authUsuario, quitarCancionPlaylist);
router.patch("/:id/portada", authUsuario, actualizarPortadaPlaylist);
router.put("/:id/modo-colaborativo", authUsuario, toggleModoColaborativo);
router.post("/:id/colaboradores", authUsuario, invitarColaborador);
router.get("/:id/colaboradores", obtenerColaboradores);
router.delete(
  "/:id/colaboradores/:usuarioId",
  authUsuario,
  eliminarColaborador
);
router.post("/:id/salir", authUsuario, salirDePlaylist);
router.post("/:id/seguir", authUsuario, toggleSeguirPlaylist);

export default router;
