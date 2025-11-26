import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

import publicRoutes from "../routes/public.routes.js";
import adminRoutes from "../routes/admin.routes.js";
import productosRoutes from "../routes/productos.routes.js";
import ventasRoutes from "../routes/ventas.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================
// Middlewares base
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir imágenes desde el Frontend
app.use('/assets/img', express.static(path.join(__dirname, '../../Frontend/assets/img')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// ============================
// CORS
// ============================
const whiteList = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || whiteList.includes(origin)) cb(null, true);
    else cb(new Error("CORS bloqueado"));
  }
}));

// ============================
// Test backend
// ============================
app.get("/", (req, res) => res.json({ msg: "Backend OK" }));

// ============================
// Rutas
// ============================
app.use("/", publicRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/productos", productosRoutes);
app.use("/admin/ventas", ventasRoutes);

// ============================
// Server
// ============================
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
