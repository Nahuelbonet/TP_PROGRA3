import express from "express";
import cors from "cors";
import db from "./db.js";
const app = express();

app.use(express.json());

const whiteList = ["http://localhost:5500", "http://127.0.0.1:5500"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || whiteList.includes(origin)) cb(null, true);
    else cb(new Error("CORS bloqueado"));
  }
}));

// Ruta simple
app.get("/", (req, res) => {
  res.json({ message: "Servidor Express funcionando correctamente" });
});

// -----------------------------
//  GET /productos
// -----------------------------
app.get("/productos", async (req, res) => {
  try {
    const pool = await db;

    let query = "SELECT * FROM productos";

    const result = await pool.request().query(query);

    res.json(result.recordset);

  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).send("Error al obtener productos");
  }
});

// -----------------------------
//  POST /compras
// -----------------------------
app.post("/compras", async (req, res) => {
  try {
    const { cliente_nombre, productos, total } = req.body;

    if (!cliente_nombre || !productos || !total) {
      return res.status(400).send("Faltan datos");
    }
    const productosTexto = productos
      .map(p => `${p.nombre}: ${p.cantidad}`)
      .join(", ");

    const pool = await db;

    await pool.request()
      .input("cliente_nombre", cliente_nombre)
      .input("productos", productosTexto)
      .input("total", total)
      .query(`
        INSERT INTO compras (cliente_nombre, productos, total)
        VALUES (@cliente_nombre, @productos, @total)
      `);

    res.json({ message: "Compra guardada correctamente" });

  } catch (err) {
    console.error("Error SQL:", err);
    res.status(500).send("Error al guardar compra");
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
