import express from "express";
import {
  // Gestión de reportes
  obtenerReportes,
  obtenerEstadisticasReportes,
  cambiarEstadoReporte,
  resolverReporte,

  // Gestión de usuarios
  obtenerUsuarios,
  suspenderUsuarioEndpoint,
  banearUsuarioEndpoint,
  reactivarUsuario,

  // Gestión de contenido
  eliminarCancion,
  eliminarAlbum,
  eliminarPlaylist,
  eliminarComentario,

  // Estadísticas
  obtenerEstadisticasPlataforma,
  obtenerActividadReciente,
} from "../controllers/moderacionController.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

/**
 * Todas las rutas requieren ser ADMIN o SUPER_ADMIN
 */

// ========== REPORTES ==========
router.get("/reportes", authAdmin, obtenerReportes);
router.get("/reportes/estadisticas", authAdmin, obtenerEstadisticasReportes);
router.put("/reportes/:id/estado", authAdmin, cambiarEstadoReporte);
router.post("/reportes/:id/resolver", authAdmin, resolverReporte);

// ========== USUARIOS ==========
router.get("/usuarios", authAdmin, obtenerUsuarios);
router.post("/usuarios/:id/suspender", authAdmin, suspenderUsuarioEndpoint);
router.post("/usuarios/:id/banear", authAdmin, banearUsuarioEndpoint);
router.post("/usuarios/:id/reactivar", authAdmin, reactivarUsuario);

// ========== CONTENIDO ==========
router.delete("/canciones/:id", authAdmin, eliminarCancion);
router.delete("/albumes/:id", authAdmin, eliminarAlbum);
router.delete("/playlists/:id", authAdmin, eliminarPlaylist);
router.delete("/comentarios/:id", authAdmin, eliminarComentario);

// ========== ESTADÍSTICAS ==========
router.get("/estadisticas", authAdmin, obtenerEstadisticasPlataforma);
router.get("/actividad", authAdmin, obtenerActividadReciente);

export default router;
