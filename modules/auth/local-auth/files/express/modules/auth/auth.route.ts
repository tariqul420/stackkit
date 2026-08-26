import { Router } from "express";
import { register, login } from "./auth.controller";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 */
router.post("/register", register);

/**
 * @route   POST /api/v1/auth/login
 */
router.post("/login", login);

export const authRoutes = router;
