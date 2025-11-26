import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.redirect("/admin/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

        res.cookie("token", newToken, { httpOnly: true });

        req.user = decoded;

        next();

    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/admin/login");
    }
}
