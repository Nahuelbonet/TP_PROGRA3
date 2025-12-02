import { Router } from "express";
import { ticketController } from "../controllers/ticketController.js";

const router = Router();

router.get("/:id", ticketController.generarTicket);

export default router;
