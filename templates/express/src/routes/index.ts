import { Router } from "express";
import { healthRoutes } from "../modules/health";
const router = Router();

router.use("/health", healthRoutes);

export const apiRoutes = router;
