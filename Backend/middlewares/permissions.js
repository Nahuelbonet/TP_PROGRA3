export function requirePermission(permisoNecesario) {
    return function (req, res, next) {
        const user = req.user;

        if (!user || !user.permisos) {
            return res.redirect("/admin/login");
        }

        if (!user.permisos.includes(permisoNecesario)) {
            return res.status(403).send("No tenés permisos para acceder a esta sección.");
        }

        next();
    };
}
