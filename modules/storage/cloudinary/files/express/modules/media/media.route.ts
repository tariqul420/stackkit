{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "../../modules/auth/auth.constants";
{{/if}}
import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { mediaController } from "./media.controller";

const router = Router();

router.get(
  "/:publicId/transform",
  authorize(Role.ADMIN, Role.USER),
  mediaController.signMedia,
);
router.post(
  "/upload/presign",
  authorize(Role.ADMIN, Role.USER),
  mediaController.createPresign,
);
router.post(
  "/upload/delete",
  authorize(Role.ADMIN, Role.USER),
  mediaController.deleteUploads,
);

export const mediaRoutes = router;
