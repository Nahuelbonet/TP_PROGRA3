import express from "express";
import db from "../db.js";
import { productosController } from "../controllers/productosController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/permissions.js";

const router = express.Router();

router.get("/",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.listar
);

router.get("/nuevo",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.nuevoForm
);

router.post("/nuevo",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.crear
);

router.get("/editar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.editarForm
);

router.post("/editar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.actualizar
);

router.get("/eliminar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.eliminarForm
);

router.post("/eliminar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.eliminar
);

export default router;
