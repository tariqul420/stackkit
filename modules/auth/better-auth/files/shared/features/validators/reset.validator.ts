import { z } from "zod";

export const resetZodSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(1, "OTP is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type IResetPayload = z.infer<typeof resetZodSchema>;
