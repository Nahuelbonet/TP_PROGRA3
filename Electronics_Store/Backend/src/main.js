import path from "path";
// Sirve para manejar rutas de archivos en Node

import { fileURLToPath } from "url";
// Necesario para obtener __dirname cuando uso módulos ES

import cookieParser from "cookie-parser";
// Middleware para leer cookies (acá uso la cookie del token)

import express from "express";
// Framework principal que uso para crear el servidor

import cors from "cors";
// Habilito CORS para permitir peticiones desde el front


// Importo todas las rutas separadas por módulo
import publicRoutes from "../routes/public.routes.js";        // rutas del cliente
import adminRoutes from "../routes/admin.routes.js";          // login/dashboard admin
import productosRoutes from "../routes/productos.routes.js";  // CRUD productos
import ventasRoutes from "../routes/ventas.routes.js";        // ventas y detalle


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Esto reemplaza al __dirname que no existe en ESModules



// ============================
// Middlewares base
// ============================

app.use(express.json());
// Para poder recibir JSON desde el frontend

app.use(express.urlencoded({ extended: true }));
// Para recibir datos de formularios (POST)

app.use(cookieParser());
// Para poder leer cookies (acá guardo el token del admin)



// ============================
// Servir imágenes estáticas del frontend
// ============================
app.use('/assets/img', express.static(path.join(__dirname, '../../Frontend/assets/img')));
// Cuando el admin pide /assets/img/... se lo sirvo desde la carpeta del Frontend



// ============================
// Configuración de vistas con EJS
// ============================

app.set("view engine", "ejs");
// Motor de plantillas que uso para las vistas del admin

app.set("views", path.join(__dirname, "../views"));
// Carpeta donde están los archivos .ejs



// ============================
// CORS
// ============================

const whiteList = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];
// Dominios permitidos que pueden llamar a este backend

app.use(cors({
  origin: (origin, cb) => {
    // Si la petición viene de uno de estos orígenes → la dejo pasar
    if (!origin || whiteList.includes(origin)) cb(null, true);
    else cb(new Error("CORS bloqueado"));
  }
}));



// ============================
// Test backend
// ============================

app.get("/", (req, res) => res.json({ msg: "Backend OK" }));
// Endpoint simple solo para probar que el server funciona



// ============================
// Rutas
// ============================

app.use("/", publicRoutes);
// Rutas del cliente (productos y comprar)

app.use("/admin", adminRoutes);
// Login, logout y dashboard del admin

app.use("/admin/productos", productosRoutes);
// CRUD de productos (lista, nuevo, editar, eliminar)

app.use("/admin/ventas", ventasRoutes);
// Listado y detalle de ventas



// ============================
// Server
// ============================

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
// Levanto el servidor en el puerto 3000
