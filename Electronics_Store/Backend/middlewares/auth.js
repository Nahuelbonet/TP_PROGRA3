import jwt from "jsonwebtoken";
// Importo jsonwebtoken para poder verificar y crear tokens JWT


export function authMiddleware(req, res, next) {
    const token = req.cookies?.token;
    // Agarro el token que viene en las cookies. Si no existe, queda undefined.

    if (!token) {
        return res.redirect("/admin/login");
        // Si no hay token → el usuario no está logueado → lo mando al login
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Verifico el token con mi clave secreta.
        // Si es válido, decoded contiene toda la info del usuario.

        // Extender duración del token
        const newToken = jwt.sign(
            {
                id: decoded.id,
                user: decoded.user,
                role: decoded.role,
                permisos: decoded.permisos
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        // Acá vuelvo a generar un token nuevo, con la misma info,
        // pero le renuevo la expiración a 1 hora más.
        // Esto sirve para mantener la sesión activa mientras el usuario navega.

        res.cookie("token", newToken, { httpOnly: true });
        // Guardo el token nuevo en la cookie.
        // httpOnly evita que se pueda leer desde el frontend (más seguro).

        req.user = decoded;
        // Guardo la info del usuario (id, permisos, etc.) en req.user
        // Así los controladores pueden saber quién es el usuario logueado.

        next();
        // Si todo salió bien → dejo continuar a la siguiente ruta/middleware

    } catch (err) {
        res.clearCookie("token");
        // Si el token falla (expirado, modificado, inválido), lo borro.

        return res.redirect("/admin/login");
        // Y lo mando al login porque ya no tiene sesión válida
    }
}
