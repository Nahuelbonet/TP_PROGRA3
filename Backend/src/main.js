// ============================
// IMPORTS PRINCIPALES
// ============================

import express from "express";               // Framework principal
import path from "path";                     // Manejo de rutas de archivos
import { fileURLToPath } from "url";         // Para obtener __dirname en ESModules
import cookieParser from "cookie-parser";    // Leer cookies (token del admin)
import cors from "cors";                     // Habilitar CORS
import dotenv from "dotenv";                 // Variables de entorno
dotenv.config();

// ============================
// IMPORTS DE RUTAS
// ============================

import publicRoutes from "../routes/public.routes.js";        // Rutas del cliente (inicio, tienda, compra)
import adminRoutes from "../routes/admin.routes.js";          // Login / Dashboard admin
import productosRoutes from "../routes/productos.routes.js";  // CRUD productos
import ventasRoutes from "../routes/ventas.routes.js";        // Listado y detalle de ventas
import ticketRoutes from "../routes/ticket.routes.js";        // 🔥 Nueva ruta para generar el ticket PDF



// ============================
// CONFIGURACIÓN BASE (app, dirname)
// ============================

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname no existe en ESModules, así que lo reconstruyo manualmente



// ============================
// MIDDLEWARES BASE
// ============================

app.use(express.json());                       // Permite recibir JSON del front
app.use(express.urlencoded({ extended: true })); // Permite recibir datos de formularios
app.use(cookieParser());                       // Necesario para leer el token del admin



// ============================
// CORS — Permitir sólo los orígenes autorizados
// ============================

const whiteList = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

// CORS con validación personalizada
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || whiteList.includes(origin)) cb(null, true);
      else cb(new Error("CORS bloqueado"));
    }
  })
);



// ============================
// ARCHIVOS ESTÁTICOS (IMÁGENES DEL FRONT)
// ============================

// Sirvo las imágenes del frontend para que el admin pueda verlas
app.use('/assets/img', express.static(path.join(__dirname, '../../Frontend/assets/img')));



// ============================
// CONFIGURACIÓN DE VISTAS (EJS)
// ============================

app.set("view engine", "ejs"); // Motor de plantillas
app.set("views", path.join(__dirname, "../views")); // Carpeta donde están las vistas EJS



// ============================
// TEST BACKEND
// ============================

app.get("/", (req, res) => res.json({ msg: "Backend OK" }));
// Permite verificar rápidamente si el backend está corriendo



// ============================
// RUTAS DEL SISTEMA
// ============================

// 🔥 RUTA DEL TICKET — DEBE IR ANTES DEL BLOQUE /admin PARA QUE NO INTERFIERA
app.use("/ticket", ticketRoutes);

// Rutas del cliente (productos, detalle, compra)
app.use("/", publicRoutes);

// Rutas del administrador
app.use("/admin", adminRoutes);

// CRUD de productos dentro del panel admin
app.use("/admin/productos", productosRoutes);

// Listado y detalle de ventas del admin
app.use("/admin/ventas", ventasRoutes);



// ============================
// LEVANTAR SERVIDOR
// ============================

app.listen(3000, () =>
  console.log("Servidor funcionando en http://localhost:3000")
);
