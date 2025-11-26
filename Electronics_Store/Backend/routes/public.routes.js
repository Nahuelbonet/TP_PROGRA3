import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/permissions.js";

const router = express.Router();

// Productos públicos
router.get("/productos", async (req, res) => {
  try {
    const pool = await db;
    const data = await pool.request().query("SELECT * FROM productos");
    res.json(data.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener productos");
  }
});

// Comprar
router.post("/comprar", async (req, res) => {
  try {
    const { productos } = req.body;
    if (!productos || !productos.length)
      return res.status(400).send("Carrito vacío");

    const pool = await db;

    const total = productos.reduce(
      (acc, p) => acc + p.cantidad * p.precio,
      0
    );

    const ventaInsert = await pool.request()
      .input("total", total)
      .query(`
        INSERT INTO ventas (fecha, total)
        OUTPUT INSERTED.id
        VALUES (GETDATE(), @total)
      `);

    const idVenta = ventaInsert.recordset[0].id;

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

    res.json({ ok: true, idVenta });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error al procesar compra");
  }
});

export default router;
