import express from "express";
// Importo express para poder usar el Router

import db from "../db.js";
// Conexión a la base de datos (no se usa acá directamente pero queda importado)

import { ventasController } from "../controllers/ventasController.js";
// Controlador con toda la lógica de ventas (listar y detalle)

import { authMiddleware } from "../middlewares/auth.js";
// Middleware que verifica si el usuario está logueado (token válido)

import { requirePermission } from "../middlewares/permissions.js";
// Middleware que verifica si el usuario tiene permiso para ver ventas


const router = express.Router();
// Creo el router para manejar todas las rutas /admin/ventas



// ====================================
// LISTADO DE TODAS LAS VENTAS
// ====================================
router.get("/",
  authMiddleware,                // verifico que esté logueado
  requirePermission("ver_ventas"), // verifico que tenga permiso "ver_ventas"
  ventasController.listar        // llamo al controlador que trae todas las ventas
);


// ====================================
// DETALLE DE UNA VENTA SEGÚN SU ID
// ====================================
router.get("/:id",
  authMiddleware,                 // el usuario debe estar logueado
  requirePermission("ver_ventas"), // debe tener permiso para ver ventas
  ventasController.detalle         // muestro el detalle de la venta seleccionada
);


export default router;
// Exporto el router para conectarlo en el servidor principal
