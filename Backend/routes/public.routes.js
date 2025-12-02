import express from "express";
// Importo express para poder usar el Router

import db from "../db.js";
// Conexión con la base de datos

import { authMiddleware } from "../middlewares/auth.js";
// Middleware de autenticación 

import { requirePermission } from "../middlewares/permissions.js";
// Middleware de permisos


const router = express.Router();
// Creo el router para manejar las rutas públicas (las del cliente)


// ======================================
// PRODUCTOS PÚBLICOS (para el frontend)
// ======================================
router.get("/productos", async (req, res) => {
  try {
    const pool = await db; 
    // Conexión al pool de SQL Server

    const data = await pool.request().query("SELECT * FROM productos");
    // Traigo todos los productos de la tabla

    res.json(data.recordset);
    // Devuelvo los productos en formato JSON (para el frontend)
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener productos");
    // Manejo errores
  }
});


// ======================================
// REGISTRAR COMPRA (carrito finalizado)
// ======================================
router.post("/comprar", async (req, res) => {
  try {
    const { productos } = req.body;
    // Recibo el carrito del cliente (lista de productos)

    if (!productos || !productos.length)
      return res.status(400).send("Carrito vacío");
    // Si no hay productos → error

    const pool = await db;
    // Conecto a la BD

    // Calculo el total sumando cantidad * precio de cada producto
    const total = productos.reduce(
      (acc, p) => acc + p.cantidad * p.precio,
      0
    );

    // Inserto la venta principal
    const ventaInsert = await pool.request()
      .input("total", total)
      .query(`
        INSERT INTO ventas (fecha, total)
        OUTPUT INSERTED.id
        VALUES (GETDATE(), @total)
      `);
    // Guardo la venta y uso OUTPUT para obtener el ID generado

    const idVenta = ventaInsert.recordset[0].id;
    // ID de la venta recién creada

    // Inserto los productos que compró el cliente
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
      // Cada producto va a la tabla intermedia ventas_productos
    }

    res.json({ ok: true, idVenta });
    // Devuelvo ok al frontend, y el ID de la venta creada

  } catch (err) {
    console.log(err);
    res.status(500).send("Error al procesar compra");
    // Manejo errores generales
  }
});

export default router;
// Exporto el router para usarlo en el servidor principal
