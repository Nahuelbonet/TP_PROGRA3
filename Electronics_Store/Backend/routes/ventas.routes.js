import express from "express";
import db from "../db.js";
import { ventasController } from "../controllers/ventasController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/permissions.js";

const router = express.Router();

router.get("/",
  authMiddleware,
  requirePermission("ver_ventas"),
  ventasController.listar
);

router.get("/:id",
  authMiddleware,
  requirePermission("ver_ventas"),
  ventasController.detalle
);

export default router;
