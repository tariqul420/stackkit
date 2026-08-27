{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "../../lib/auth/auth.constants";
{{/if}}
import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import { profileController } from "./profile.controller";
import { updateProfileSchema } from "./profile.schema";

const router = Router();

router.get("/me", authorize(Role.ADMIN, Role.USER), profileController.getMe);
router.patch(
  "/",
  authorize(Role.ADMIN, Role.USER),
  validate(updateProfileSchema),
  profileController.updateProfile,
);

export const profileRoutes = router;
