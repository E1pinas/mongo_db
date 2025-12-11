import express from "express";
import {
  listarAdministradores,
  crearAdministrador,
  eliminarAdministrador,
  promoverAAdmin,
  degradarAdmin,
  obtenerHistorialConducta,
  agregarVidas,
  restaurarVidas,
  reasignarReporte,
  suspenderUsuario,
  eliminarUsuario,
} from "../controllers/adminController.js";
import { authSuperAdmin } from "../middlewares/authSuperAdmin.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

// Gestión de administradores (solo SUPER ADMIN)
router.get("/", authSuperAdmin, listarAdministradores);
router.post("/", authSuperAdmin, crearAdministrador);
router.delete("/:id", authSuperAdmin, eliminarAdministrador);
router.put("/:id/promover", authSuperAdmin, promoverAAdmin);
router.put("/:id/degradar", authSuperAdmin, degradarAdmin);

// Gestión de vidas y conducta (ADMIN y SUPER ADMIN)
router.get("/usuarios/:id/conducta", authAdmin, obtenerHistorialConducta);
router.post("/usuarios/:id/vidas", authAdmin, agregarVidas);
router.post("/usuarios/:id/vidas/restaurar", authAdmin, restaurarVidas);

// Acciones de moderación sobre usuarios (ADMIN y SUPER ADMIN)
router.post("/usuarios/:id/suspender", authAdmin, suspenderUsuario);
router.delete("/usuarios/:id/eliminar", authAdmin, eliminarUsuario);

// Reasignación de reportes (solo SUPER ADMIN)
router.put("/reportes/:reporteId/reasignar", authSuperAdmin, reasignarReporte);

export default router;
