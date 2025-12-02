import express from "express";
// Importo express para poder usar el Router

import db from "../db.js";
// Conexión a la base de datos

import { productosController } from "../controllers/productosController.js";
// Controlador donde tengo toda la lógica de productos

import { authMiddleware } from "../middlewares/auth.js";
// Middleware que verifica si el usuario está logueado y tiene token válido

import { requirePermission } from "../middlewares/permissions.js";
// Middleware que controla si el usuario tiene el permiso "crud_productos"


const router = express.Router();
// Creo un router para manejar todas las rutas del módulo productos



// ===============================
// LISTAR PRODUCTOS
// ===============================
router.get("/",
  authMiddleware,                 // verifico que esté logueado
  requirePermission("crud_productos"), // verifico que tenga permiso para CRUD
  productosController.listar      // llamo al controlador para traer y mostrar productos
);


// ===============================
// FORMULARIO: NUEVO PRODUCTO
// ===============================
router.get("/nuevo",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.nuevoForm   // muestro el formulario para crear un producto
);


// ===============================
// GUARDAR PRODUCTO NUEVO (POST)
// ===============================
router.post("/nuevo",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.crear       // guardo el producto en la BD
);


// ===============================
// FORMULARIO: EDITAR PRODUCTO
// ===============================
router.get("/editar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.editarForm  // busco el producto por ID y muestro el formulario
);


// ===============================
// GUARDAR EDICIÓN DEL PRODUCTO
// ===============================
router.post("/editar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.actualizar  // actualizo el producto en la BD
);


// ===============================
// CONFIRMAR ELIMINAR
// ===============================
router.get("/eliminar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.eliminarForm // muestro pantalla de confirmación
);


// ===============================
// ELIMINAR PRODUCTO (POST)
// ===============================
router.post("/eliminar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  productosController.eliminar    // elimino el producto y sus relaciones en ventas_productos
);


export default router;
// Exporto el router para usarlo en el archivo principal
