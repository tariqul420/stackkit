{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "../../modules/auth/auth.constants";
{{/if}}
import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { validate } from "../../shared/middlewares/validate.middleware";
import { mediaController } from "./media.controller";
import {
  mediaSignParamsSchema,
  mediaSignQuerySchema,
  mediaUploadDeleteSchema,
  mediaUploadPresignSchema,
} from "./media.schema";

const router = Router();

router.get(
  "/:publicId/transform",
  authorize(Role.ADMIN, Role.USER),
  validate(mediaSignParamsSchema, "params"),
  validate(mediaSignQuerySchema, "query"),
  mediaController.signMedia,
);
router.post(
  "/upload/presign",
  authorize(Role.ADMIN, Role.USER),
  validate(mediaUploadPresignSchema),
  mediaController.createPresign,
);
router.post(
  "/upload/delete",
  authorize(Role.ADMIN, Role.USER),
  validate(mediaUploadDeleteSchema),
  mediaController.deleteUploads,
);

export const mediaRoutes = router;
