{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "./auth.constants";
{{/if}}
import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { authController } from "./auth.controller";

const router = Router();

router.get("/me", authorize(Role.ADMIN, Role.USER), authController.getMe);
router.patch(
  "/profile",
  authorize(Role.ADMIN, Role.USER),
  authController.updateProfile,
);

export const authRoutes = router;
