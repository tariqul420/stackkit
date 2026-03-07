{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from './auth.constants';
{{/if}}
import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { authController } from "./auth.controller";

const router = Router()

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.get("/me", authorize(Role.ADMIN, Role.USER, Role.SUPER_ADMIN), authController.getMe)
router.post("/refresh-token", authController.getNewToken)
router.post("/change-password", authorize(Role.ADMIN, Role.USER, Role.SUPER_ADMIN), authController.changePassword)
router.post("/logout", authorize(Role.ADMIN, Role.USER, Role.SUPER_ADMIN), authController.logoutUser)
router.post("/verify-email", authController.verifyEmail)
router.post("/forget-password", authController.forgetPassword)
router.post("/reset-password", authController.resetPassword)

router.get("/login/google", authController.googleLogin);
router.get("/google/success", authController.googleLoginSuccess);
router.get("/oauth/error", authController.handleOAuthError);

export const authRoutes = router;