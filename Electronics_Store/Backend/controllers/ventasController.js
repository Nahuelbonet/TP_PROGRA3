import db from "../db.js";

export const ventasController = {

    async listar(req, res) {
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
    },

    async detalle(req, res) {
        try {
            const id = req.params.id;
            const pool = await db;

            const venta = await pool.request()
                .input("id", id)
                .query("SELECT * FROM ventas WHERE id = @id");

            if (venta.recordset.length === 0)
                return res.send("Venta no encontrada");

            const productos = await pool.request()
                .input("id", id)
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
};
