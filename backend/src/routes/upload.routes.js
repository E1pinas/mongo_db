// src/routes/upload.routes.js
import express from "express";
import { authUsuario } from "../middlewares/authUsuario.js";
import { uploadLimiter } from "../middlewares/rateLimiter.js";
import {
  uploadAudio,
  uploadImagen,
  uploadCancionCompleta,
  handleMulterError,
} from "../middlewares/upload.js";
import {
  subirAudio,
  subirImagen,
  subirCancionCompleta,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/audio",
  authUsuario,
  uploadLimiter,
  uploadAudio,
  handleMulterError,
  subirAudio
);

router.post(
  "/imagen",
  authUsuario,
  uploadLimiter,
  uploadImagen,
  handleMulterError,
  subirImagen
);


router.post(
  "/cancion-completa",
  authUsuario,
  uploadLimiter,
  uploadCancionCompleta,
  handleMulterError,
  subirCancionCompleta
);

export default router;
