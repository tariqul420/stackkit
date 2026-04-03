{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "./auth.constants";
{{/if}}
import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { authController } from "./auth.controller";

const router = Router()

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.get("/me", authorize(Role.ADMIN, Role.USER), authController.getMe)
router.post("/refresh-token", authController.getNewToken)
router.post("/change-password", authorize(Role.ADMIN, Role.USER), authController.changePassword)
router.post("/logout", authorize(Role.ADMIN, Role.USER), authController.logoutUser)
router.post("/verify-email", authController.verifyEmail)
router.post("/forget-password", authController.forgetPassword)
router.post("/reset-password", authController.resetPassword)
router.post("/resend-otp", authController.resendOTP);
router.get("/login/:provider", authController.socialLogin);
router.get("/:provider/success", authController.socialLoginSuccess);
router.get("/oauth/error", authController.handleOAuthError);
router.patch(
  "/profile",
  authorize(Role.ADMIN, Role.USER),
  authController.updateProfile,
);

export const authRoutes = router;