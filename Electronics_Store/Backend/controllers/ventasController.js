import db from "../db.js";  
// Importo la conexión a la base de datos para poder hacer consultas

export const ventasController = {

    async listar(req, res) {
        try {
            const pool = await db;  
            // Espero la conexión al pool de SQL Server

            const result = await pool.request().query(`
                SELECT v.id, v.fecha, v.total,
                COUNT(vp.id_producto) AS cantidad_items
                FROM ventas v
                LEFT JOIN ventas_productos vp ON v.id = vp.id_venta
                GROUP BY v.id, v.fecha, v.total
                ORDER BY v.fecha DESC
            `);
            // Hago una consulta que:
            // - Trae todas las ventas
            // - Cuenta cuántos productos tiene cada venta (cantidad_items)
            // - Usa LEFT JOIN para incluir ventas aunque no tengan productos
            // - Ordena de la más reciente a la más vieja

            res.render("admin/ventas", { ventas: result.recordset });
            // Renderizo la vista y le paso todas las ventas que trajo la base

        } catch (err) {
            console.error(err);
            res.send("Error ventas");
            // Si pasa algo, lo muestro en consola y mando un mensaje simple
        }
    },

    async detalle(req, res) {
        try {
            const id = req.params.id;
            // Agarro el ID de la venta que viene por la URL

            const pool = await db;
            // Espero la conexión

            const venta = await pool.request()
                .input("id", id)  // Le paso el parámetro seguro para evitar SQL injection
                .query("SELECT * FROM ventas WHERE id = @id");
            // Busco esa venta en la tabla de ventas

            if (venta.recordset.length === 0)
                return res.send("Venta no encontrada");
            // Si no existe, aviso

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
            // Busco todos los productos que pertenecen a esa venta
            // Traigo: cantidad, precio, nombre e imagen
            // Hago el JOIN contra productos para obtener los datos del producto

            res.render("admin/venta_detalle", {
                venta: venta.recordset[0],       // Info general de la venta
                productos: productos.recordset   // Lista de productos vendidos
            });
            // Renderizo la vista del detalle con todo lo necesario

        } catch (err) {
            console.error(err);
            res.send("Error detalle venta");
            // Manejo errores si algo falla
        }
    }
};
