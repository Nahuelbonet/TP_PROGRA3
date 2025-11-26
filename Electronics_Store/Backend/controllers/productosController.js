import db from "../db.js";

export const productosController = {

    async listar(req, res) {
        try {
            const pool = await db;
            const result = await pool.request().query("SELECT * FROM productos");
            res.render("admin/productos", { productos: result.recordset });
        } catch (err) {
            console.error(err);
            res.send("Error al cargar productos");
        }
    },

    nuevoForm(req, res) {
        res.render("admin/producto_nuevo");
    },

    async crear(req, res) {
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
    },

    async editarForm(req, res) {
        try {
            const id = req.params.id;
            const pool = await db;

            const result = await pool.request()
                .input("id", id)
                .query("SELECT * FROM productos WHERE id = @id");

            if (result.recordset.length === 0)
                return res.send("Producto no encontrado");

            res.render("admin/producto_editar", { producto: result.recordset[0] });

        } catch (err) {
            console.error(err);
            res.send("Error al cargar edición");
        }
    },

    async actualizar(req, res) {
        try {
            const id = req.params.id;
            const { nombre, precio, categoria, img } = req.body;

            const pool = await db;

            await pool.request()
                .input("id", id)
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
            res.send("Error al actualizar");
        }
    },

    async eliminarForm(req, res) {
        try {
            const id = req.params.id;
            const pool = await db;

            const result = await pool.request()
                .input("id", id)
                .query("SELECT * FROM productos WHERE id = @id");

            if (result.recordset.length === 0)
                return res.send("Producto no encontrado");

            res.render("admin/producto_eliminar", {
                producto: result.recordset[0]
            });

        } catch (err) {
            console.error(err);
            res.send("Error al cargar eliminación");
        }
    },

    async eliminar(req, res) {
        try {
            const id = req.params.id;
            const pool = await db;

            await pool.request()
                .input("id", id)
                .query("DELETE FROM ventas_productos WHERE id_producto = @id");

            await pool.request()
                .input("id", id)
                .query("DELETE FROM productos WHERE id = @id");

            res.redirect("/admin/productos");

        } catch (err) {
            console.error("ERROR AL ELIMINAR:", err);
            res.status(500).send("Error al eliminar producto");
        }
    }
};
