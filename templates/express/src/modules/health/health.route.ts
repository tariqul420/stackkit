import { Router } from "express";
import { healthController } from "./health.controller";

const router = Router();

// demo route
router.get("/", healthController.health);

export const authRoutes = router;
