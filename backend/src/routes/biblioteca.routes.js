// src/routes/biblioteca.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import {
  // Canciones
  obtenerCancionesGuardadas,
  agregarCancionBiblioteca,
  quitarCancionBiblioteca,
  // Playlists
  obtenerPlaylistsGuardadas,
  togglePlaylistGuardada,
  // Álbumes
  obtenerAlbumesGuardados,
  toggleAlbumGuardado,
  // Artistas
  obtenerArtistasGuardados,
  toggleArtistaGuardado,
} from "../controllers/bibliotecaController.js";

const router = express.Router();

// ============================================
// CANCIONES
// ============================================
router.get("/canciones", authUsuario, obtenerCancionesGuardadas);
router.post("/canciones/:cancionId", authUsuario, agregarCancionBiblioteca);
router.delete("/canciones/:cancionId", authUsuario, quitarCancionBiblioteca);

// ============================================
// PLAYLISTS
// ============================================
router.get("/playlists", authUsuario, obtenerPlaylistsGuardadas);
router.post("/playlists/:playlistId", authUsuario, togglePlaylistGuardada);

// ============================================
// ÁLBUMES
// ============================================
router.get("/albumes", authUsuario, obtenerAlbumesGuardados);
router.post("/albumes/:albumId", authUsuario, toggleAlbumGuardado);

// ============================================
// ARTISTAS
// ============================================
router.get("/artistas", authUsuario, obtenerArtistasGuardados);
router.post("/artistas/:artistaId", authUsuario, toggleArtistaGuardado);

export default router;
