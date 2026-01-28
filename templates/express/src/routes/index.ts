import { Router } from "express";
import { healthRoutes } from "../modules/health/health.route";
const router = Router();

// versioned API
const v1 = Router();

v1.use("/health", healthRoutes);

router.use("/v1", v1);

export const apiRoutes = router;
