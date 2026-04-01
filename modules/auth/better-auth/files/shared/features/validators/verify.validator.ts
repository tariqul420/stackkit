import { z } from "zod";

export const verifyZodSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(1, "OTP is required"),
});

export type IVerifyPayload = z.infer<typeof verifyZodSchema>;
