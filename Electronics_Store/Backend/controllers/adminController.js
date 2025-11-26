import jwt from "jsonwebtoken";

export const adminController = {
    
    loginForm(req, res) {
        res.render("admin/login");
    },

    login(req, res) {
        const { user, pass } = req.body;

        if (user !== "admin" || pass !== "admin") {
            return res.render("admin/login", { error: "Credenciales incorrectas" });
        }

        const payload = {
            id: 1,
            user: "admin",
            role: "administrator",
            permisos: ["crud_productos", "ver_ventas"]
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000
        });

        res.redirect("/admin/dashboard");
    },

    dashboard(req, res) {
        res.render("admin/dashboard");
    },

    logout(req, res) {
        res.clearCookie("token");
        res.redirect("/admin/login");
    }
};
