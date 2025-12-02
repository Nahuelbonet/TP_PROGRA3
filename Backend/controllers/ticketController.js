import PDFDocument from "pdfkit";
import db from "../db.js";

export const ticketController = {
  async generarTicket(req, res) {
    try {
      const idVenta = req.params.id;

      console.log("🟣 Generando ticket para venta:", idVenta);

      // -----------------------------
      // 1) Conectar al pool
      // -----------------------------
      const pool = await db;

      // -----------------------------
      // 2) Obtener la venta
      // -----------------------------
      const ventaQuery = await pool
        .request()
        .input("id", idVenta)
        .query("SELECT * FROM ventas WHERE id = @id");

      const venta = ventaQuery.recordset;

      if (venta.length === 0) {
        return res.status(404).send("Venta no encontrada");
      }

      // -----------------------------
      // 3) Obtener productos de la venta
      // -----------------------------
      const productosQuery = await pool
        .request()
        .input("id", idVenta)
        .query(`
          SELECT 
            p.nombre,
            p.precio,
            vp.cantidad,
            vp.precio_unitario
          FROM ventas_productos vp
          JOIN productos p ON vp.id_producto = p.id
          WHERE vp.id_venta = @id
        `);

      const productos = productosQuery.recordset;

      // -----------------------------
      // 4) Crear el PDF (DISEÑO MEJORADO)
      // -----------------------------

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, left: 40, right: 40, bottom: 40 }
      });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=ticket_${idVenta}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      // Encabezado
      doc.fontSize(22).text("Electronics Store", { align: "center" });
      doc.moveDown(1);

      doc.lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1);

      // Formato de fecha en español
      const fechaArg = new Date(venta[0].fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      // Datos de la venta
      doc.fontSize(14).text(`Ticket de Compra #${idVenta}`);
      doc.text(`Fecha: ${fechaArg}`);
      doc.moveDown(1.5);

      // Título de productos
      doc.fontSize(16).text("Productos:", { underline: true });
      doc.moveDown(1);

      // Tabla de productos
      let total = 0;

      // Encabezados de tabla
      doc.font("Helvetica-Bold");
      doc.text("Producto", 40, doc.y);
      doc.text("Cant.", 250, doc.y);
      doc.text("Precio unit.", 320, doc.y);
      doc.text("Subtotal", 430, doc.y);
      doc.moveDown(0.5);

      doc.font("Helvetica");
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Filas de productos
      productos.forEach((prod) => {
        const subtotal = prod.precio_unitario * prod.cantidad;
        total += subtotal;

        doc.text(prod.nombre, 40, doc.y);
        doc.text(String(prod.cantidad), 250, doc.y);
        doc.text(`$${prod.precio_unitario.toLocaleString("es-AR")}`, 320, doc.y);
        doc.text(`$${subtotal.toLocaleString("es-AR")}`, 430, doc.y);

        doc.moveDown(0.5);
      });

      // Total
      doc.moveDown(1.5);
      doc.font("Helvetica-Bold")
        .fontSize(16)
        .text(`TOTAL: $${total.toLocaleString("es-AR")}`, { align: "right" });

      doc.end();

    } catch (error) {
      console.error("🛑 ERROR GENERANDO TICKET:", error);
      res.status(500).send("Error al generar el ticket");
    }
  },
};
