import jwt from "jsonwebtoken"; 
// Importo JWT para generar el token del admin

import bcrypt from "bcryptjs";
// Importo bcrypt para comparar la contraseña encriptada

// Leo de variables de entorno el usuario y el hash de la contraseña
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH;

export const adminController = {
    
    loginForm(req, res) {
        // Muestra el formulario de login del admin
        res.render("admin/login");
    },

    async login(req, res) {
        const { user, pass } = req.body;
        // Obtengo usuario y contraseña enviados desde el formulario

        // Si no está configurado el hash en el .env, devuelvo error claro
        if (!ADMIN_PASS_HASH) {
            return res
              .status(500)
              .send("Falta configurar ADMIN_PASS_HASH en el archivo .env");
        }

        // 1) Verifico que el usuario coincida con el configurado
        if (user !== ADMIN_USER) {
            // Si el usuario no coincide, muestro error genérico
            return res.render("admin/login", { error: "Credenciales incorrectas" });
        }

        // 2) Verifico la contraseña usando bcrypt (comparo texto plano vs hash)
        const passwordOK = await bcrypt.compare(pass, ADMIN_PASS_HASH);

        if (!passwordOK) {
            // Si la contraseña no coincide con el hash, también error genérico
            return res.render("admin/login", { error: "Credenciales incorrectas" });
        }

        // Si usuario y contraseña son correctos, armo el payload del token
        const payload = {
            id: 1,
            user: ADMIN_USER,
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
