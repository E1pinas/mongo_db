import express from "express";
import {
  listarAdministradores,
  crearAdministrador,
  eliminarAdministrador,
  promoverAAdmin,
  degradarAdmin,
} from "../controllers/adminController.js";
import { authSuperAdmin } from "../middlewares/authSuperAdmin.js";

const router = express.Router();

// Todas las rutas requieren ser SUPER ADMIN
router.get("/", authSuperAdmin, listarAdministradores);
router.post("/", authSuperAdmin, crearAdministrador);
router.delete("/:id", authSuperAdmin, eliminarAdministrador);
router.put("/:id/promover", authSuperAdmin, promoverAAdmin);
router.put("/:id/degradar", authSuperAdmin, degradarAdmin);

export default router;
