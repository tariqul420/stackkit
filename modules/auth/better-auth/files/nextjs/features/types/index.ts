import { forgotZodSchema } from "@/features/auth/validators/forgot.validator";
import { loginZodSchema } from "@/features/auth/validators/login.validator";
import { registerZodSchema } from "@/features/auth/validators/register.validator";
import { resetZodSchema } from "@/features/auth/validators/reset.validator";
import { verifyZodSchema } from "@/features/auth/validators/verify.validator";
import { z } from "zod";

export type IRegisterPayload = z.infer<typeof registerZodSchema>;
export type IForgotPayload = z.infer<typeof forgotZodSchema>;
export type IResetPayload = z.infer<typeof resetZodSchema>;
export type IVerifyPayload = z.infer<typeof verifyZodSchema>;
export type ILoginPayload = z.infer<typeof loginZodSchema>;

export * from "./auth.type";
