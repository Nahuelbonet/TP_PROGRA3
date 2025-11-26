import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import express from "express";
import cors from "cors";

import db from "./db.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/permissions.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================================================
// Configuración básica del server
// ===================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Servir los archivos tal cual los pide la BD: /assets/img/archivo.jpg
app.use('/assets/img', express.static(path.join(__dirname, '../../Frontend/assets/img')));



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// ===================================================
// CORS permitido
// ===================================================
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

// ===================================================
// Test del backend
// ===================================================
app.get("/", (req, res) => {
  res.json({ message: "Servidor Express funcionando correctamente" });
});

// ===================================================
// Productos públicos (para el cliente)
// ===================================================
app.get("/productos", async (req, res) => {
  try {
    const pool = await db;
    const data = await pool.request().query("SELECT * FROM productos");
    res.json(data.recordset);
  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).send("Error al obtener productos");
  }
});

// ===================================================
// Registrar compra del cliente
// ===================================================
app.post("/comprar", async (req, res) => {
  try {
    const { productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).send("La compra está vacía");
    }

    const pool = await db;

    // total de la compra
    const total = productos.reduce((acc, p) =>
      acc + (p.precio * p.cantidad), 0
    );

    // Insertar venta
    const ventaQuery = await pool.request()
      .input("total", total)
      .query(`
        INSERT INTO ventas (fecha, total)
        OUTPUT INSERTED.id
        VALUES (GETDATE(), @total)
      `);

    const idVenta = ventaQuery.recordset[0].id;

    // Insertar productos de la venta
    for (const p of productos) {
      await pool.request()
        .input("id_venta", idVenta)
        .input("id_producto", p.id)
        .input("cantidad", p.cantidad)
        .input("precio_unitario", p.precio)
        .query(`
          INSERT INTO ventas_productos (id_venta, id_producto, cantidad, precio_unitario)
          VALUES (@id_venta, @id_producto, @cantidad, @precio_unitario)
        `);
    }

    res.json({ message: "Venta registrada correctamente", idVenta });

  } catch (err) {
    console.error("ERROR /comprar:", err);
    res.status(500).send("Error al registrar compra");
  }
});

// ===================================================
// LOGIN ADMIN
// ===================================================
app.get("/admin/login", (req, res) => {
  res.render("admin/login");
});

app.post("/admin/login", (req, res) => {
  const { user, pass } = req.body;

  if (user !== "admin" || pass !== "admin") {
    return res.render("admin/login", { error: "Credenciales incorrectas" });
  }

  // datos del admin
  const payload = {
    id: 1,
    user: "admin",
    role: "administrator",
    permisos: ["crud_productos", "ver_ventas"]
  };

  // token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000
  });

  res.redirect("/admin/dashboard");
});

// ===================================================
// Dashboard admin
// ===================================================
app.get("/admin/dashboard", authMiddleware, (req, res) => {
  res.render("admin/dashboard");
});

// ===================================================
// CRUD PRODUCTOS (ADMIN)
// ===================================================
app.get("/admin/productos",
  authMiddleware,
  requirePermission("crud_productos"),
  async (req, res) => {
    try {
      const pool = await db;
      const result = await pool.request().query("SELECT * FROM productos");
      res.render("admin/productos", { productos: result.recordset });
    } catch (err) {
      console.error(err);
      res.send("Error al cargar productos");
    }
  }
);

// Nuevo
app.get("/admin/productos/nuevo",
  authMiddleware,
  requirePermission("crud_productos"),
  (req, res) => {
    res.render("admin/producto_nuevo");
  }
);

app.post("/admin/productos/nuevo",
  authMiddleware,
  requirePermission("crud_productos"),
  async (req, res) => {
    try {
      const { nombre, precio, categoria, img } = req.body;

      const pool = await db;
      await pool.request()
        .input("nombre", nombre)
        .input("precio", precio)
        .input("categoria", categoria)
        .input("img", img)
        .query(`
          INSERT INTO productos (nombre, precio, categoria, img)
          VALUES (@nombre, @precio, @categoria, @img)
        `);

      res.redirect("/admin/productos");
    } catch (err) {
      console.error(err);
      res.send("Error al guardar producto");
    }
  }
);

// Editar
app.get("/admin/productos/editar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  async (req, res) => {
    try {
      const pool = await db;
      const result = await pool.request()
        .input("id", req.params.id)
        .query("SELECT * FROM productos WHERE id = @id");

      if (result.recordset.length === 0)
        return res.send("Producto no encontrado");

      res.render("admin/producto_editar", { producto: result.recordset[0] });

    } catch (err) {
      console.error(err);
      res.send("Error al cargar edición");
    }
  }
);

app.post("/admin/productos/editar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  async (req, res) => {
    try {
      const { nombre, precio, categoria, img } = req.body;

      const pool = await db;
      await pool.request()
        .input("id", req.params.id)
        .input("nombre", nombre)
        .input("precio", precio)
        .input("categoria", categoria)
        .input("img", img)
        .query(`
          UPDATE productos
          SET nombre = @nombre,
              precio = @precio,
              categoria = @categoria,
              img = @img
          WHERE id = @id
        `);

      res.redirect("/admin/productos");
    } catch (err) {
      console.error(err);
      res.send("Error al guardar edición");
    }
  }
);

// ===================================================
// ELIMINAR PRODUCTO (FIX COMPLETO)
// ===================================================
app.get("/admin/productos/eliminar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  async (req, res) => {
    try {
      const pool = await db;
      const result = await pool.request()
        .input("id", req.params.id)
        .query("SELECT * FROM productos WHERE id = @id");

      if (result.recordset.length === 0)
        return res.send("Producto no encontrado");

      res.render("admin/producto_eliminar", { producto: result.recordset[0] });

    } catch (err) {
      console.error(err);
      res.send("Error");
    }
  }
);

// POST eliminar — ahora funcional 100%
app.post("/admin/productos/eliminar/:id",
  authMiddleware,
  requirePermission("crud_productos"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const pool = await db;

      // Primero borro ventas asociadas del producto
      await pool.request()
        .input("id", id)
        .query(`
          DELETE FROM ventas_productos
          WHERE id_producto = @id
        `);

      // Ahora si, borro el producto
      await pool.request()
        .input("id", id)
        .query(`
          DELETE FROM productos
          WHERE id = @id
        `);

      res.redirect("/admin/productos");

    } catch (err) {
      console.error("ERROR AL ELIMINAR PRODUCTO:", err);
      res.status(500).send("Error al eliminar producto");
    }
  }
);

// ===================================================
// VENTAS ADMIN
// ===================================================
app.get("/admin/ventas",
  authMiddleware,
  requirePermission("ver_ventas"),
  async (req, res) => {
    try {
      const pool = await db;

      const result = await pool.request().query(`
        SELECT v.id, v.fecha, v.total,
        COUNT(vp.id_producto) AS cantidad_items
        FROM ventas v
        LEFT JOIN ventas_productos vp ON v.id = vp.id_venta
        GROUP BY v.id, v.fecha, v.total
        ORDER BY v.fecha DESC
      `);

      res.render("admin/ventas", { ventas: result.recordset });
    } catch (err) {
      console.error(err);
      res.send("Error ventas");
    }
  }
);

// Detalle venta
app.get("/admin/ventas/:id",
  authMiddleware,
  requirePermission("ver_ventas"),
  async (req, res) => {
    try {
      const pool = await db;

      const venta = await pool.request()
        .input("id", req.params.id)
        .query("SELECT * FROM ventas WHERE id = @id");

      if (venta.recordset.length === 0)
        return res.send("Venta no encontrada");

      const productos = await pool.request()
        .input("id", req.params.id)
        .query(`
          SELECT vp.cantidad,
                 vp.precio_unitario,
                 p.nombre,
                 p.img
          FROM ventas_productos vp
          JOIN productos p ON p.id = vp.id_producto
          WHERE vp.id_venta = @id
        `);

      res.render("admin/venta_detalle", {
        venta: venta.recordset[0],
        productos: productos.recordset
      });

    } catch (err) {
      console.error(err);
      res.send("Error detalle venta");
    }
  }
);

// ===================================================
// LOGOUT
// ===================================================
app.get("/admin/logout", authMiddleware, (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
});

// ===================================================
// SERVER
// ===================================================
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
