import express from "express";
// Importo express para poder usar el Router

import { adminController } from "../controllers/adminController.js";
// Traigo el controlador del admin (login, dashboard, logout, etc.)

import { authMiddleware } from "../middlewares/auth.js";
// Middleware que verifica si el admin está logueado

import { requirePermission } from "../middlewares/permissions.js";
// Middleware que controla permisos


const router = express.Router();
// Creo el router para manejar todas las rutas /admin


// --- RUTA: FORMULARIO DE LOGIN ---
router.get("/login", adminController.loginForm);
// Cuando el admin va a /admin/login → muestro el formulario de login


// --- RUTA: PROCESAR LOGIN ---
router.post("/login", adminController.login);
// Cuando envía el login → valido usuario/contraseña y creo el token


// --- RUTA: DASHBOARD (solo si está logueado) ---
router.get("/dashboard", authMiddleware, adminController.dashboard);
// Antes de entrar al dashboard, paso por authMiddleware para verificar el token
// Si todo está bien → cargo el panel del admin


// --- RUTA: LOGOUT ---
router.get("/logout", authMiddleware, adminController.logout);
// Para cerrar sesión, primero verifico que esté logueado
// Luego borro la cookie del token y redirijo al login


export default router;
// Exporto el router para usarlo en server.js / main.js
