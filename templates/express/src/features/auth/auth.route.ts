import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

export const authRoutes = router;
