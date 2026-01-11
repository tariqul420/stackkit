import { Router } from "express";
import { auth } from "../lib/auth";

const router = Router();

// Mount Better Auth handlers
router.all("/auth/*", async (req, res) => {
  const response = await auth.handler(req);
  return res.status(response.status).json(response.body);
});

export default router;
