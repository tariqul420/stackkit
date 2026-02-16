import { Router } from "express";
import { healthRoutes } from "../modules/health/health.route";
const router = Router();

router.use("/health", healthRoutes);

export const apiRoutes = router;
