// index.js - Archivo principal del servidor
import dotenv from "dotenv";

// Configurar dotenv PRIMERO antes de cualquier import que use process.env
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { conexion } from "./database/conexion.js";
import { startPresenceMonitoring } from "./src/services/presenceService.js";

// Importar middlewares
import { generalLimiter } from "./src/middlewares/rateLimiter.js";
import {
  sanitizeInput,
  preventNoSQLInjection,
} from "./src/middlewares/sanitizeInput.js";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middlewares/errorHandler.js";

// Importar rutas
import uploadRoutes from "./src/routes/upload.routes.js";
import cancionRoutes from "./src/routes/cancion.routes.js";
import albumRoutes from "./src/routes/album.routes.js";
import playlistRoutes from "./src/routes/playlist.routes.js";
import usuarioRoutes from "./src/routes/usuario.routes.js";
import perfilRoutes from "./src/routes/perfil.routes.js";
import bibliotecaRoutes from "./src/routes/biblioteca.routes.js";
import amistadRoutes from "./src/routes/amistad.routes.js";
import notificacionRoutes from "./src/routes/notificacion.routes.js";
import comentarioRoutes from "./src/routes/comentario.routes.js";
import reporteRoutes from "./src/routes/reporte.routes.js";
import reproduccionRoutes from "./src/routes/reproduccion.routes.js";
import seguidorRoutes from "./src/routes/seguidor.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import moderacionRoutes from "./src/routes/moderacion.routes.js";
import presenceRoutes from "./src/routes/presence.routes.js";
import bloqueoRoutes from "./src/routes/bloqueo.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ========== MIDDLEWARES GLOBALES ==========
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Seguridad: Sanitizar inputs y prevenir NoSQL injection
app.use(sanitizeInput);
app.use(preventNoSQLInjection);

// Rate limiting general (NO aplica a /api/notificaciones)
app.use((req, res, next) => {
  // Excluir notificaciones del rate limiter general
  if (req.path.startsWith("/api/notificaciones")) {
    return next();
  }
  return generalLimiter(req, res, next);
});

// ========== CONEXIÓN A MONGODB ==========
conexion();

// ========== RUTAS ==========

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API de Plataforma Musical",
    version: "1.0.0",
  });
});

// Rutas de autenticación y usuarios
app.use("/api/usuarios", usuarioRoutes);

// Rutas de perfil (avatar, banner)
app.use("/api/perfil", perfilRoutes);

// Rutas de upload (audio, imágenes, canción completa)
app.use("/api/upload", uploadRoutes);

// Rutas de contenido
app.use("/api/canciones", cancionRoutes);
app.use("/api/albumes", albumRoutes);
app.use("/api/playlists", playlistRoutes);

// Rutas de biblioteca y social
app.use("/api/biblioteca", bibliotecaRoutes);
app.use("/api/amistad", amistadRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/presence", presenceRoutes);

// Rutas de comentarios, reportes y seguimiento
app.use("/api/comentarios", comentarioRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/reproducciones", reproduccionRoutes);
app.use("/api/seguidores", seguidorRoutes);

// Rutas de posts/tweets
app.use("/api/posts", postRoutes);

// Rutas de bloqueos
app.use("/api/bloqueos", bloqueoRoutes);

// Rutas de administración (solo super_admin)
app.use("/api/admin", adminRoutes);

// Rutas de moderación (admin y super_admin)
app.use("/api/moderacion", moderacionRoutes);

// ========== MANEJO DE ERRORES ==========

// Ruta no encontrada (404)
app.use(notFoundHandler);

// Manejador centralizado de errores
app.use(errorHandler);

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/upload`);

  // Iniciar sistema de presencia de usuarios
  startPresenceMonitoring();
});
