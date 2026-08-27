{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "./auth.constants";
{{/if}}
import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import { authController } from "./auth.controller";
import { updateProfileSchema } from "./auth.schema";

const router = Router();

router.get("/me", authorize(Role.ADMIN, Role.USER), authController.getMe);
router.patch(
  "/profile",
  authorize(Role.ADMIN, Role.USER),
  validate(updateProfileSchema),
  authController.updateProfile,
);

export const authRoutes = router;
