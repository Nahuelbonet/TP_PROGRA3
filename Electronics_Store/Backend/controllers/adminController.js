import jwt from "jsonwebtoken"; 
// Importo JWT para generar el token del admin

export const adminController = {
    
    loginForm(req, res) {
        // Muestra el formulario de login del admin
        res.render("admin/login");
    },

    login(req, res) {
        const { user, pass } = req.body;
        // Obtengo usuario y contraseña enviados desde el formulario

        if (user !== "admin" || pass !== "admin") {
            // Si no coincide con admin/admin, muestro error
            return res.render("admin/login", { error: "Credenciales incorrectas" });
        }

        // Datos del usuario admin que van a ir dentro del token
        const payload = {
            id: 1,
            user: "admin",
            role: "administrator",
            permisos: ["crud_productos", "ver_ventas"] // permisos que va a tener el admin
        };

        // Creo el token firmado con mi JWT_SECRET y dura 1 hora
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Guardo el token en una cookie segura y con duración de 1 hora
        res.cookie("token", token, {
            httpOnly: true,  // la cookie no puede ser leída por JS del cliente
            secure: false,   // en producción debería estar en true (solo https)
            maxAge: 60 * 60 * 1000 // 1 hora
        });

        // Redirijo al dashboard del admin
        res.redirect("/admin/dashboard");
    },

    dashboard(req, res) {
        // Renderiza la vista del panel principal del admin
        res.render("admin/dashboard");
    },

    logout(req, res) {
        // Borro la cookie con el token para cerrar sesión
        res.clearCookie("token");

        // Redirijo al login
        res.redirect("/admin/login");
    }
};
