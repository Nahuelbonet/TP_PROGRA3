export function requirePermission(permisoNecesario) {
    // Esta función recibe el permiso que necesita la ruta, por ejemplo "crud_productos"

    return function (req, res, next) {
        // Devuelvo un middleware que se ejecuta cuando la ruta lo pida

        const user = req.user;
        // Tomo el usuario que guardamos antes en req.user desde el authMiddleware

        if (!user || !user.permisos) {
            return res.redirect("/admin/login");
            // Si no hay usuario o no tiene permisos cargados → no está logueado bien
        }

        if (!user.permisos.includes(permisoNecesario)) {
            return res.status(403).send("No tenés permisos para acceder a esta sección.");
            // Si el usuario NO tiene el permiso pedido → le bloqueo la página
        }

        next();
        // Si tiene el permiso → dejo avanzar a la ruta
    };
}
