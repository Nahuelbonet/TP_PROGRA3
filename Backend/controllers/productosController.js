import db from "../db.js";
// Importo la conexión a la base de datos

export const productosController = {

    async listar(req, res) {
        // Lista todos los productos y los muestra en la vista
        try {
            const pool = await db; // obtengo conexión
            const result = await pool.request().query("SELECT * FROM productos"); // consulta
            res.render("admin/productos", { productos: result.recordset }); // mando datos a la vista
        } catch (err) {
            console.error(err);
            res.send("Error al cargar productos");
        }
    },

    nuevoForm(req, res) {
        // Muestra el formulario para crear un producto nuevo
        res.render("admin/producto_nuevo");
    },

    async crear(req, res) {
        // Guarda un producto nuevo en la base de datos
        try {
            const { nombre, precio, categoria, img } = req.body; // datos enviados del form
            const pool = await db;

            // Inserto el producto
            await pool.request()
                .input("nombre", nombre)
                .input("precio", precio)
                .input("categoria", categoria)
                .input("img", img)
                .query(`
                    INSERT INTO productos (nombre, precio, categoria, img)
                    VALUES (@nombre, @precio, @categoria, @img)
                `);

            res.redirect("/admin/productos"); // vuelvo a la lista
        } catch (err) {
            console.error(err);
            res.send("Error al guardar producto");
        }
    },

    async editarForm(req, res) {
        // Muestra el formulario de edición con los datos cargados
        try {
            const id = req.params.id; // id del producto
            const pool = await db;

            // Busco el producto por id
            const result = await pool.request()
                .input("id", id)
                .query("SELECT * FROM productos WHERE id = @id");

            if (result.recordset.length === 0)
                return res.send("Producto no encontrado");

            // Mando el producto encontrado a la vista
            res.render("admin/producto_editar", { producto: result.recordset[0] });

        } catch (err) {
            console.error(err);
            res.send("Error al cargar edición");
        }
    },

    async actualizar(req, res) {
        // Actualiza los datos del producto editado
        try {
            const id = req.params.id;
            const { nombre, precio, categoria, img } = req.body; // datos nuevos

            const pool = await db;

            // Actualizo el producto
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
        // Muestra el formulario de confirmación de eliminación
        try {
            const id = req.params.id;
            const pool = await db;

            // Busco el producto a eliminar
            const result = await pool.request()
                .input("id", id)
                .query("SELECT * FROM productos WHERE id = @id");

            if (result.recordset.length === 0)
                return res.send("Producto no encontrado");

            // Envío los datos del producto a la vista para mostrarlo
            res.render("admin/producto_eliminar", {
                producto: result.recordset[0]
            });

        } catch (err) {
            console.error(err);
            res.send("Error al cargar eliminación");
        }
    },

    async eliminar(req, res) {
        // Elimina el producto y sus relaciones en ventas_productos
        try {
            const id = req.params.id;
            const pool = await db;

            // Primero borro las ventas relacionadas con ese producto
            await pool.request()
                .input("id", id)
                .query("DELETE FROM ventas_productos WHERE id_producto = @id");

            // Después borro el producto
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
