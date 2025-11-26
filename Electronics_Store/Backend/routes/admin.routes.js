import express from "express";
import { adminController } from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/permissions.js";

const router = express.Router();

router.get("/login", adminController.loginForm);
router.post("/login", adminController.login);
router.get("/dashboard", authMiddleware, adminController.dashboard);
router.get("/logout", authMiddleware, adminController.logout);

export default router;
